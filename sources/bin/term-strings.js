#!/usr/bin/env node

import 'core-js';

import * as TermStrings from '../core';

let mode = `in`;
let strings = [];

for (let arg of process.argv.slice(2)) {

    if (arg === `--raw` || arg === `-r`) {
        mode = `raw`;
        continue;
    } else if (arg.startsWith(`-`)) {
        throw new Error(`Unknown option "${arg}"`);
    }

    if (mode === `raw`) {
        strings.push(arg);
        mode = `in`;
        continue;
    }

    let target = TermStrings;

    for (let part of arg.split(/\./g)) {

        if (target === undefined)
            break;

        if (typeof target === `function` && part.match(/^#([0-9a-f]{3}|[0-9a-f]{6)$/i)) {
            target = target(part);
        } else if (Object.prototype.hasOwnProperty.call(target, part)) {
            target = target[part];
        } else {
            target = undefined;
        }

    }

    if (target === undefined)
        throw new Error(`Cannot find any terminal string for this selector: "${arg}"`);

    if (typeof target !== `string`)
        throw new Error(`The selector "${arg}" doesn't match a value of type string (got ${typeof target} instead)`);

    strings.push(target);

}

for (let string of strings) {
    process.stdout.write(string);
}
