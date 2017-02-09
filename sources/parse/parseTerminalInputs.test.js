import chai, { expect }        from 'chai';

import { parseTerminalInputs } from './parseTerminalInputs';
import { Key }                 from './types/Key';
import { Mouse }               from './types/Mouse';

chai.use(require(`../../extra/mochaObservablePlugin`).default);

describe(`parseTerminalInputs`, () => {

    it(`should correctly parse a single simple key`, async () => {

        let inputSource = parseTerminalInputs(Observable.of(new Buffer(`\n`)));

        await expect(inputSource).to.emit(value => {
            expect(value).to.be.instanceOf(Key).and.to.deep.equal(new Key(`enter`));
        }).then.complete();

    });

    it(`should correctly parse multiple simple keys`, async () => {

        let inputSource = parseTerminalInputs(Observable.of(new Buffer(`\n`.repeat(5))));

        await expect(inputSource).to.emit(value => {
            expect(value).to.be.instanceOf(Key).and.to.deep.equal(new Key(`enter`));
        }).then.emit(value => {
            expect(value).to.be.instanceOf(Key).and.to.deep.equal(new Key(`enter`));
        }).then.emit(value => {
            expect(value).to.be.instanceOf(Key).and.to.deep.equal(new Key(`enter`));
        }).then.emit(value => {
            expect(value).to.be.instanceOf(Key).and.to.deep.equal(new Key(`enter`));
        }).then.emit(value => {
            expect(value).to.be.instanceOf(Key).and.to.deep.equal(new Key(`enter`));
        }).then.complete();

    });

    it(`should correctly parse a single complex key`, async () => {

        let inputSource = parseTerminalInputs(Observable.of(new Buffer(`\x1b[24;4~`)));

        await expect(inputSource).to.emit(value => {
            expect(value).to.be.instanceOf(Key).and.to.deep.equal(new Key(`f12`, { shift: true, alt: true }));
        }).then.complete();

    });

    it(`should correctly parse multiple complex keys`, async () => {

        let inputSource = parseTerminalInputs(Observable.of(new Buffer(`\x1b[24;4~`.repeat(5))));

        await expect(inputSource).to.emit(value => {
            expect(value).to.be.instanceOf(Key).and.to.deep.equal(new Key(`f12`, { shift: true, alt: true }));
        }).then.emit(value => {
            expect(value).to.be.instanceOf(Key).and.to.deep.equal(new Key(`f12`, { shift: true, alt: true }));
        }).then.emit(value => {
            expect(value).to.be.instanceOf(Key).and.to.deep.equal(new Key(`f12`, { shift: true, alt: true }));
        }).then.emit(value => {
            expect(value).to.be.instanceOf(Key).and.to.deep.equal(new Key(`f12`, { shift: true, alt: true }));
        }).then.emit(value => {
            expect(value).to.be.instanceOf(Key).and.to.deep.equal(new Key(`f12`, { shift: true, alt: true }));
        }).then.complete();

    });

    it(`should correctly parse complex keys splitted accross multiple buffers`, async () => {

        let inputSource = parseTerminalInputs(Observable.from([ new Buffer(`\x1b[2`), new Buffer(`4;4~`) ]));

        await expect(inputSource).to.emit(value => {
            expect(value).to.be.instanceOf(Key).and.to.deep.equal(new Key(`f12`, { shift: true, alt: true }));
        }).then.complete();

    });

    it(`should correctly return a buffer when data don't match any possible sequence`, async () => {

        let inputSource = parseTerminalInputs(Observable.from([ new Buffer(`hello`) ]));

        await expect(inputSource).to.emit(value => {
            expect(value).to.be.instanceOf(Buffer).and.to.deep.equal(new Buffer(`hello`));
        }).then.complete();

    });

    it(`should correctly return the buffered data when starting a new sequence`, async () => {

        let inputSource = parseTerminalInputs(Observable.from([ new Buffer(`hello\n`) ]));

        await expect(inputSource).to.emit(value => {
            expect(value).to.be.instanceOf(Buffer).and.to.deep.equal(new Buffer(`hello`));
        }).then.emit(value => {
            expect(value).to.be.instanceOf(Key).and.to.deep.equal(new Key(`enter`));
        }).then.complete();

    });

    it(`should correctly return a buffer when the input stream completes, even if a longer sequence could be found`, async () => {

        let inputSource = parseTerminalInputs(Observable.from([ new Buffer(`\x1bO`) ]));

        await expect(inputSource).to.emit(value => {
            expect(value).to.be.instanceOf(Key).and.to.deep.equal({ name: `escape`, shift: false, alt: false, ctrl: false, meta: false });
        }).then.emit(value => {
            expect(value).to.be.instanceOf(Buffer).and.to.deep.equal(new Buffer(`O`));
        }).then.complete();

    });

    it(`should correctly parse extended mouse sequences`, async () => {

        let inputSource = parseTerminalInputs(Observable.from([ new Buffer(`\x1b[<2;12;34M`), new Buffer(`\x1b[<2;12;34m`) ]));

        await expect(inputSource).to.emit(value => {
            expect(value).to.be.instanceOf(Mouse).and.to.deep.equal(new Mouse(`right`, { x: 11, y: 33, start: true }));
        }).then.emit(value => {
            expect(value).to.be.instanceOf(Mouse).and.to.deep.equal(new Mouse(`right`, { x: 11, y: 33, end: true }));
        }).then.complete();

    });

    it(`should throttle successive mouse move sequences if requested`, async () => {

        let inputSource = parseTerminalInputs(new Observable(observer => {

            setTimeout(() => observer.next(new Buffer(`\x1b[<32;50;50M`)), 0);
            setTimeout(() => observer.next(new Buffer(`\x1b[<32;12;34M`)), 20);
            setTimeout(() => observer.next(new Buffer(`\x1b[<32;12;43M`)), 40);

            setTimeout(() => observer.complete(), 80);

        }), { throttleMouseMoveEvents: 30 });

        await expect(inputSource).to.emit(value => {
            expect(value).to.be.instanceOf(Mouse).and.to.deep.equal(new Mouse(`left`, { x: 11, y: 33 }));
        }).then.emit(value => {
            expect(value).to.be.instanceOf(Mouse).and.to.deep.equal(new Mouse(`left`, { x: 11, y: 42 }));
        }).then.complete();

    });

});
