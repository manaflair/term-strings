import chai, { expect }      from 'chai';

import { style }             from '../core';

import { TermStringBuilder } from './TermStringBuilder';

let string = new TermStringBuilder()

    .append(`hello`)

    .enter(style.emboldened)
    .append(`foo`)
    .enter(style.italic)

    .leave(style.emboldened)
    .append(`bar`)
    .leave(style.italic)

    .append(`world`)

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

            expect(string.substr(1, 6)).to.deep.equal(new TermStringBuilder().enter(style.emboldened).append(`ello`).enter(style.italic).append(`fo`).build());

        });

        it(`should slice to the end of the string when called without length parameter`, () => {

            expect(string.substr(3)).to.deep.equal(new TermStringBuilder().append(`lo`).enter(style.emboldened).append(`foo`).enter(style.italic).leave(style.emboldened).append(`bar`).leave(style.italic).append(`world`).build());

        });

        it(`should work with negative offset`, () => {

            expect(string.substr(-3)).to.equal(`rld`);

        });

    });

    describe(`#repeat()`, () => {

        it(`can repeat a string multiple times`, () => {

            expect(string.repeat(2)).to.deep.equal(new TermStringBuilder().append(`hello`).enter(style.emboldened).append(`foo`).enter(style.italic).leave(style.emboldened).append(`bar`).leave(style.italic).append(`world`).append(`hello`).enter(style.emboldened).append(`foo`).enter(style.italic).leave(style.emboldened).append(`bar`).leave(style.italic).append(`world`).build());

        });

    });

    describe(`#padStart()`, () => {

        it(`can pad a string to the left, a single time`, () => {

            expect(string.padStart(20)).to.deep.equal(new TermStringBuilder().append(`    hello`).enter(style.emboldened).append(`foo`).enter(style.italic).leave(style.emboldened).append(`bar`).leave(style.italic).append(`world`).build());

        });

        it(`won't pad a string that is already long enough`, () => {

            expect(string.padStart(15)).to.deep.equal(new TermStringBuilder().append(`hello`).enter(style.emboldened).append(`foo`).enter(style.italic).leave(style.emboldened).append(`bar`).leave(style.italic).append(`world`).build());

        });

        it(`can pad a string with any character`, () => {

            expect(string.padStart(20, `.`)).to.deep.equal(new TermStringBuilder().append(`....hello`).enter(style.emboldened).append(`foo`).enter(style.italic).leave(style.emboldened).append(`bar`).leave(style.italic).append(`world`).build());

        });

        it(`can pad using a longer string than needed`, () => {

            expect(string.padStart(20, `FOO`)).to.deep.equal(new TermStringBuilder().append(`FOOFhello`).enter(style.emboldened).append(`foo`).enter(style.italic).leave(style.emboldened).append(`bar`).leave(style.italic).append(`world`).build());

        });

        it(`can pad using a term string`, () => {

            expect(string.padStart(20, new TermStringBuilder().enter(style.emboldened).append(`x`).leave(style.emboldened).append(`y`).build())).to.deep.equal(new TermStringBuilder().enter(style.emboldened).append(`x`).leave(style.emboldened).append(`y`).enter(style.emboldened).append(`x`).leave(style.emboldened).append(`y`).append(`hello`).enter(style.emboldened).append(`foo`).enter(style.italic).leave(style.emboldened).append(`bar`).leave(style.italic).append(`world`).build());

        });

    });

    describe(`#padEnd()`, () => {

        it(`can pad a string to the right, a single time`, () => {

            expect(string.padEnd(20)).to.deep.equal(new TermStringBuilder().append(`hello`).enter(style.emboldened).append(`foo`).enter(style.italic).leave(style.emboldened).append(`bar`).leave(style.italic).append(`world    `).build());

        });

        it(`won't pad a string that is already long enough`, () => {

            expect(string.padEnd(15)).to.deep.equal(new TermStringBuilder().append(`hello`).enter(style.emboldened).append(`foo`).enter(style.italic).leave(style.emboldened).append(`bar`).leave(style.italic).append(`world`).build());

        });

        it(`can pad a string with any character`, () => {

            expect(string.padEnd(20, `.`)).to.deep.equal(new TermStringBuilder().append(`hello`).enter(style.emboldened).append(`foo`).enter(style.italic).leave(style.emboldened).append(`bar`).leave(style.italic).append(`world....`).build());

        });

        it(`can pad using a longer string than needed`, () => {

            expect(string.padEnd(20, `FOO`)).to.deep.equal(new TermStringBuilder().append(`hello`).enter(style.emboldened).append(`foo`).enter(style.italic).leave(style.emboldened).append(`bar`).leave(style.italic).append(`worldFOOF`).build());

        });

        it(`can pad using a term string`, () => {

            expect(string.padEnd(20, new TermStringBuilder().enter(style.emboldened).append(`x`).leave(style.emboldened).append(`y`).build())).to.deep.equal(new TermStringBuilder().append(`hello`).enter(style.emboldened).append(`foo`).enter(style.italic).leave(style.emboldened).append(`bar`).leave(style.italic).append(`world`).enter(style.emboldened).append(`x`).leave(style.emboldened).append(`y`).enter(style.emboldened).append(`x`).leave(style.emboldened).append(`y`).build());

        });

    });

    describe(`#toString()`, () => {

        it(`should skip trailing "leave" terminal sequences altogether, and replace them by a clear`, () => {

            expect(new TermStringBuilder().enter(style.emboldened).append(`hello`).leave(style.emboldened).build().toString()).to.equal(`${style.emboldened.in}hello${style.clear}`);

        });

        it(`should end a string with the style clear when using unterminated terminal sequences`, () => {

            expect(new TermStringBuilder().enter(style.emboldened).append(`hello`).build().toString()).to.equal(`${style.emboldened.in}hello${style.clear}`);

        });

        it(`should not add trailing style clear if no style is currently active`, () => {

            expect(new TermStringBuilder().enter(style.emboldened).append(`hello`).leave(style.emboldened).append(`world`).build().toString()).to.equal(`${style.emboldened.in}hello${style.emboldened.out}world`);

        });

    });

});
