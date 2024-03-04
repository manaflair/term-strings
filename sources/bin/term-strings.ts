#!/usr/bin/env node

import * as TermStrings from '../core';

let mode = `in`;
const strings = [];

for (const arg of process.argv.slice(2)) {
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

  let target = TermStrings as any;

  for (const part of arg.split(/\./g)) {
    if (target === undefined)
      throw new Error(`Cannot find any terminal string for this selector: "${part}"`);

    if (typeof target === `function` && part.match(/^#([0-9a-f]{3}|[0-9a-f]{6)$/i)) {
      target = target(part);
    } else if (Object.hasOwn(target, part)) {
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

for (const string of strings)
  process.stdout.write(string);
