import chai, {expect}        from 'chai';
import Observable            from 'zen-observable';

import {parseTerminalInputs} from './parseTerminalInputs';
import {Key}                 from './types/Key';
import {Mouse}               from './types/Mouse';

chai.use(require(`../../extra/mochaObservablePlugin`).default);

describe(`parseTerminalInputs`, () => {
  it(`should correctly parse a single simple key`, async () => {
    const inputSource = parseTerminalInputs(Observable.of(Buffer.from(`\n`)));

    await expect(inputSource).to.emit(value => {
      expect(value).to.be.instanceOf(Key).and.to.deep.equal(new Key(`enter`, `\n`));
    }).then.complete();
  });

  it(`should correctly parse multiple simple keys`, async () => {
    const inputSource = parseTerminalInputs(Observable.of(Buffer.from(`\n`.repeat(5))));

    await expect(inputSource).to.emit(value => {
      expect(value).to.be.instanceOf(Key).and.to.deep.equal(new Key(`enter`, `\n`));
    }).then.emit(value => {
      expect(value).to.be.instanceOf(Key).and.to.deep.equal(new Key(`enter`, `\n`));
    }).then.emit(value => {
      expect(value).to.be.instanceOf(Key).and.to.deep.equal(new Key(`enter`, `\n`));
    }).then.emit(value => {
      expect(value).to.be.instanceOf(Key).and.to.deep.equal(new Key(`enter`, `\n`));
    }).then.emit(value => {
      expect(value).to.be.instanceOf(Key).and.to.deep.equal(new Key(`enter`, `\n`));
    }).then.complete();
  });

  it(`should correctly parse a single complex key`, async () => {
    const inputSource = parseTerminalInputs(Observable.of(Buffer.from(`\x1b[24;4~`)));

    await expect(inputSource).to.emit(value => {
      expect(value).to.be.instanceOf(Key).and.to.deep.equal(new Key(`f12`, `\x1b[24;4~`, {shift: true, alt: true}));
    }).then.complete();
  });

  it(`should correctly parse multiple complex keys`, async () => {
    const inputSource = parseTerminalInputs(Observable.of(Buffer.from(`\x1b[24;4~`.repeat(5))));

    await expect(inputSource).to.emit(value => {
      expect(value).to.be.instanceOf(Key).and.to.deep.equal(new Key(`f12`, `\x1b[24;4~`, {shift: true, alt: true}));
    }).then.emit(value => {
      expect(value).to.be.instanceOf(Key).and.to.deep.equal(new Key(`f12`, `\x1b[24;4~`, {shift: true, alt: true}));
    }).then.emit(value => {
      expect(value).to.be.instanceOf(Key).and.to.deep.equal(new Key(`f12`, `\x1b[24;4~`, {shift: true, alt: true}));
    }).then.emit(value => {
      expect(value).to.be.instanceOf(Key).and.to.deep.equal(new Key(`f12`, `\x1b[24;4~`, {shift: true, alt: true}));
    }).then.emit(value => {
      expect(value).to.be.instanceOf(Key).and.to.deep.equal(new Key(`f12`, `\x1b[24;4~`, {shift: true, alt: true}));
    }).then.complete();
  });

  it(`should correctly parse complex keys splitted accross multiple buffers`, async () => {
    const inputSource = parseTerminalInputs(Observable.of(Buffer.from(`\x1b[2`), Buffer.from(`4;4~`)));

    await expect(inputSource).to.emit(value => {
      expect(value).to.be.instanceOf(Key).and.to.deep.equal(new Key(`f12`, `\x1b[24;4~`, {shift: true, alt: true}));
    }).then.complete();
  });

  it(`should immediatly send the ESC key when there's no more entry in the current input feed`, async () => {
    const inputSource = parseTerminalInputs(Observable.of(Buffer.from(`\x1b`), Buffer.from(`a`)));

    await expect(inputSource).to.emit(value => {
      expect(value).to.be.instanceOf(Key).and.to.deep.equal(new Key(`escape`, `\x1b`));
    }).then.emit(value => {
      expect(value).to.be.instanceOf(Uint8Array).and.to.deep.equal(Buffer.from(`a`));
    }).then.complete();
  });

  it(`should not send the ESC key when received with inputs that might belong to the same sequence`, async () => {
    const inputSource = parseTerminalInputs(Observable.of(Buffer.from(`\x1ba`)));

    await expect(inputSource).to.emit(value => {
      expect(value).to.be.instanceOf(Key).and.to.deep.equal(new Key(`a`, `\x1ba`, {alt: true}));
    }).then.complete();
  });

  it(`should correctly return a buffer when data don't match any possible sequence`, async () => {
    const inputSource = parseTerminalInputs(Observable.of(Buffer.from(`hello`)));

    await expect(inputSource).to.emit(value => {
      expect(value).to.deep.equal({type: `data`, buffer: Buffer.from(`hello`)});
    }).then.complete();
  });

  it(`should correctly return the buffered data when starting a new sequence`, async () => {
    const inputSource = parseTerminalInputs(Observable.of(Buffer.from(`hello\n`)));

    await expect(inputSource).to.emit(value => {
      expect(value).to.deep.equal({type: `data`, buffer: Buffer.from(`hello`)});
    }).then.emit(value => {
      expect(value).to.be.instanceOf(Key).and.to.deep.equal(new Key(`enter`, `\n`));
    }).then.complete();
  });

  it(`should correctly return a buffer when the input stream completes, even if a longer sequence could be found`, async () => {
    const inputSource = parseTerminalInputs(Observable.of(Buffer.from(`\x1bO`)));

    await expect(inputSource).to.emit(value => {
      expect(value).to.be.instanceOf(Key).and.to.deep.equal(new Key(`escape`, `\x1b`, {shift: false, alt: false, ctrl: false, meta: false}));
    }).then.emit(value => {
      expect(value).to.be.instanceOf(Uint8Array).and.to.deep.equal(Buffer.from(`O`));
    }).then.complete();
  });

  it(`should correctly parse extended mouse sequences`, async () => {
    const inputSource = parseTerminalInputs(Observable.of(Buffer.from(`\x1b[<2;12;34M`), Buffer.from(`\x1b[<2;12;34m`)));

    await expect(inputSource).to.emit(value => {
      expect(value).to.be.instanceOf(Mouse).and.to.deep.equal(new Mouse(`right`, `\x1b[<2;12;34M`, {x: 11, y: 33, start: true}));
    }).then.emit(value => {
      expect(value).to.be.instanceOf(Mouse).and.to.deep.equal(new Mouse(`right`, `\x1b[<2;12;34m`, {x: 11, y: 33, end: true}));
    }).then.complete();
  });

  it(`should throttle successive mouse move sequences if requested`, async () => {
    const inputSource = parseTerminalInputs(new Observable(observer => {
      setTimeout(() => observer.next(Buffer.from(`\x1b[<32;50;50M`)), 0);
      setTimeout(() => observer.next(Buffer.from(`\x1b[<32;12;34M`)), 20);
      setTimeout(() => observer.next(Buffer.from(`\x1b[<32;12;43M`)), 40);

      setTimeout(() => observer.complete(), 80);
    }), {throttleMouseMoveEvents: 30});

    await expect(inputSource).to.emit(value => {
      expect(value).to.be.instanceOf(Mouse).and.to.deep.equal(new Mouse(`left`, `\x1b[<32;12;34M`, {x: 11, y: 33}));
    }).then.emit(value => {
      expect(value).to.be.instanceOf(Mouse).and.to.deep.equal(new Mouse(`left`, `\x1b[<32;12;43M`, {x: 11, y: 42}));
    }).then.complete();
  });
});
