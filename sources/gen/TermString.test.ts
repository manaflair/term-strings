import {expect}            from 'chai';

import {style}             from '../core';

import {TermStringBuilder} from './TermStringBuilder';
import {TermString}        from './TermString';

const string = new TermStringBuilder()

  .pushText(`hello`)

  .pushStyle({emboldened: style.emboldened})
  .pushText(`foo`)
  .pushStyle({italic: style.italic})

  .pushStyle({emboldened: null})
  .pushText(`bar`)
  .pushStyle({italic: null})

  .pushText(`world`)

  .build();

describe(`TermString`, () => {
  describe(`#substr()`, () => {
    it(`should return an empty string when slicing a zero-length string`, () => {
      expect(string.substr(1, 0)).to.equal(``);
    });

    it(`should return an empty string when slicing outside of the string`, () => {
      expect(string.substr(100, 10)).to.equal(``);
    });

    it(`should return a raw string when slicing inside the very first text token`, () => {
      expect(string.substr(1, 4)).to.equal(`ello`);
    });

    it(`should return a term string when slicing over multiple tokens`, () => {
      expect(string.substr(1, 6)).to.deep.equal(new TermStringBuilder().pushText(`ello`).pushStyle({emboldened: style.emboldened}).pushText(`fo`).build());
    });

    it(`should slice to the end of the string when called without length parameter`, () => {
      expect(string.substr(3)).to.deep.equal(new TermStringBuilder().pushText(`lo`).pushStyle({emboldened: style.emboldened}).pushText(`foo`).pushStyle({italic: style.italic}).pushStyle({emboldened: null}).pushText(`bar`).pushStyle({italic: null}).pushText(`world`).build());
    });

    it(`should work with negative offset`, () => {
      expect(string.substr(-3)).to.equal(`rld`);
    });
  });

  describe(`#repeat()`, () => {
    it(`can repeat a string multiple times`, () => {
      expect(string.repeat(2)).to.deep.equal(new TermStringBuilder().pushText(`hello`).pushStyle({emboldened: style.emboldened}).pushText(`foo`).pushStyle({italic: style.italic}).pushStyle({emboldened: null}).pushText(`bar`).pushStyle({italic: null}).pushText(`world`).pushText(`hello`).pushStyle({emboldened: style.emboldened}).pushText(`foo`).pushStyle({italic: style.italic}).pushStyle({emboldened: null}).pushText(`bar`).pushStyle({italic: null}).pushText(`world`).build());
    });
  });

  describe(`#padStart()`, () => {
    it(`can pad a string to the left, a single time`, () => {
      expect(string.padStart(20)).to.deep.equal(new TermStringBuilder().pushText(`    hello`).pushStyle({emboldened: style.emboldened}).pushText(`foo`).pushStyle({italic: style.italic}).pushStyle({emboldened: null}).pushText(`bar`).pushStyle({italic: null}).pushText(`world`).build());
    });

    it(`won't pad a string that is already long enough`, () => {
      expect(string.padStart(15)).to.deep.equal(new TermStringBuilder().pushText(`hello`).pushStyle({emboldened: style.emboldened}).pushText(`foo`).pushStyle({italic: style.italic}).pushStyle({emboldened: null}).pushText(`bar`).pushStyle({italic: null}).pushText(`world`).build());
    });

    it(`can pad a string with any character`, () => {
      expect(string.padStart(20, `.`)).to.deep.equal(new TermStringBuilder().pushText(`....hello`).pushStyle({emboldened: style.emboldened}).pushText(`foo`).pushStyle({italic: style.italic}).pushStyle({emboldened: null}).pushText(`bar`).pushStyle({italic: null}).pushText(`world`).build());
    });

    it(`can pad using a longer string than needed`, () => {
      expect(string.padStart(20, `FOO`)).to.deep.equal(new TermStringBuilder().pushText(`FOOFhello`).pushStyle({emboldened: style.emboldened}).pushText(`foo`).pushStyle({italic: style.italic}).pushStyle({emboldened: null}).pushText(`bar`).pushStyle({italic: null}).pushText(`world`).build());
    });

    it(`can pad using a term string`, () => {
      expect(TermString.from(string).padStart(20, new TermStringBuilder().pushStyle({emboldened: style.emboldened}).pushText(`x`).pushStyle({emboldened: null}).pushText(`y`).build())).to.deep.equal(new TermStringBuilder().pushStyle({emboldened: style.emboldened}).pushText(`x`).pushStyle({emboldened: null}).pushText(`y`).pushStyle({emboldened: style.emboldened}).pushText(`x`).pushStyle({emboldened: null}).pushText(`y`).pushText(`hello`).pushStyle({emboldened: style.emboldened}).pushText(`foo`).pushStyle({italic: style.italic}).pushStyle({emboldened: null}).pushText(`bar`).pushStyle({italic: null}).pushText(`world`).build());
    });
  });

  describe(`#padEnd()`, () => {
    it(`can pad a string to the right, a single time`, () => {
      expect(string.padEnd(20)).to.deep.equal(new TermStringBuilder().pushText(`hello`).pushStyle({emboldened: style.emboldened}).pushText(`foo`).pushStyle({italic: style.italic}).pushStyle({emboldened: null}).pushText(`bar`).pushStyle({italic: null}).pushText(`world    `).build());
    });

    it(`won't pad a string that is already long enough`, () => {
      expect(string.padEnd(15)).to.deep.equal(new TermStringBuilder().pushText(`hello`).pushStyle({emboldened: style.emboldened}).pushText(`foo`).pushStyle({italic: style.italic}).pushStyle({emboldened: null}).pushText(`bar`).pushStyle({italic: null}).pushText(`world`).build());
    });

    it(`can pad a string with any character`, () => {
      expect(string.padEnd(20, `.`)).to.deep.equal(new TermStringBuilder().pushText(`hello`).pushStyle({emboldened: style.emboldened}).pushText(`foo`).pushStyle({italic: style.italic}).pushStyle({emboldened: null}).pushText(`bar`).pushStyle({italic: null}).pushText(`world....`).build());
    });

    it(`can pad using a longer string than needed`, () => {
      expect(string.padEnd(20, `FOO`)).to.deep.equal(new TermStringBuilder().pushText(`hello`).pushStyle({emboldened: style.emboldened}).pushText(`foo`).pushStyle({italic: style.italic}).pushStyle({emboldened: null}).pushText(`bar`).pushStyle({italic: null}).pushText(`worldFOOF`).build());
    });

    it(`can pad using a term string`, () => {
      expect(TermString.from(string).padEnd(20, new TermStringBuilder().pushStyle({emboldened: style.emboldened}).pushText(`x`).pushStyle({emboldened: null}).pushText(`y`).build())).to.deep.equal(new TermStringBuilder().pushText(`hello`).pushStyle({emboldened: style.emboldened}).pushText(`foo`).pushStyle({italic: style.italic}).pushStyle({emboldened: null}).pushText(`bar`).pushStyle({italic: null}).pushText(`world`).pushStyle({emboldened: style.emboldened}).pushText(`x`).pushStyle({emboldened: null}).pushText(`y`).pushStyle({emboldened: style.emboldened}).pushText(`x`).pushStyle({emboldened: null}).pushText(`y`).build());
    });
  });

  describe(`#toString()`, () => {
    it(`should skip trailing "leave" terminal sequences altogether, and replace them by a clear`, () => {
      expect(new TermStringBuilder().pushStyle({emboldened: style.emboldened}).pushText(`hello`).pushStyle({emboldened: null}).build().toString()).to.equal(`${style.emboldened.in}hello${style.clear}`);
    });

    it(`should end a string with the style clear when using unterminated terminal sequences`, () => {
      expect(new TermStringBuilder().pushStyle({emboldened: style.emboldened}).pushText(`hello`).build().toString()).to.equal(`${style.emboldened.in}hello${style.clear}`);
    });

    it(`should not add trailing style clear if no style is currently active`, () => {
      expect(new TermStringBuilder().pushStyle({emboldened: style.emboldened}).pushText(`hello`).pushStyle({emboldened: null}).pushText(`world`).build().toString()).to.equal(`${style.emboldened.in}hello${style.emboldened.out}world`);
    });
  });
});
