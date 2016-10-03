#!/usr/bin/env node

import { style } from '../core';

let mode = `in`;
let strings = [];

for (let arg of process.argv.slice(2)) {

    if (arg === `--in` || arg === `-i`) {
        mode = `in`;
        continue;
    } else if (arg === `--out` || arg === `-o`) {
        mode = `out`;
        continue;
    } else if (arg === `--raw` || arg === `-r`) {
        mode = `raw`;
        continue;
    } else if (arg.startsWith(`-`)) {
        throw new Error(`Unknown option "${arg}"`);
    }

    if (mode === `raw`) {
        strings.push(arg);
        continue;
    }

    let target = style;

    for (let part of arg.split(/\./g)) {

        if (target === undefined)
            break;

        if (typeof target === `function`) {
            target = target(part);
        } else if (Object.prototype.hasOwnProperty.call(target, part)) {
            target = target[part];
        } else {
            target = undefined;
        }

    }

    if (target === undefined)
        throw new Error(`Cannot find any terminal string for this selector: "${arg}"`);

    if (typeof target !== `string` && Object.prototype.hasOwnProperty.call(target, mode))
        target = target[mode];

    if (typeof target === `string`) {
        strings.push(target);
    }

}

for (let string of strings) {
    process.stdout.write(string);
}
