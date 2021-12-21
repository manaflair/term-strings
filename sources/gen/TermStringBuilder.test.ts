import {expect}            from 'chai';

import {style}             from '../core';

import {TermStringBuilder} from './TermStringBuilder';

describe(`TermStringBuilder`, () => {
  describe(`Basic behaviour`, () => {
    it(`should return an empty string when there's no text`, () => {
      expect(new TermStringBuilder().build()).to.equal(``);
    });

    it(`should return a classic string if there's no raw text`, () => {
      expect(new TermStringBuilder().pushText(`foobar`).build()).to.equal(`foobar`);
    });
  });

  describe(`Methods`, () => {
    describe(`#append()`, () => {
      it(`should add text at the end of the string`, () => {
        expect(new TermStringBuilder().pushText(`foobar`).pushText(`supertest`).build().toString()).to.equal(`foobarsupertest`);
      });

      it(`should not increase the string length when appending raw text`, () => {
        expect(new TermStringBuilder().pushStyle({emboldened: style.emboldened}).pushText(`test`).build().length).to.equal(4);
      });
    });
  });
});
