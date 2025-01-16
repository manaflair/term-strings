/* eslint-disable no-control-regex */

import {HexNode}            from './parser/HexNode';
import {NumberNode}         from './parser/NumberNode';
import {Sequence, Callback} from './parser/Parser';
import {Cursor}             from './types/Cursor';
import {Info}               from './types/Info';
import {Key}                from './types/Key';
import {Mouse}              from './types/Mouse';

const shift = 1 << 0, alt = 1 << 1, ctrl = 1 << 2, meta = 1 << 3;

const applyModifiers = (sequenceBuilder: (n: number) => string, name: string) => ({

  // Simple key, no modifiers
  [sequenceBuilder(1 + (0))]: new Key(name, sequenceBuilder(1 + (0))),

  // With a single modifier
  [sequenceBuilder(1 + (shift))]: new Key(name, sequenceBuilder(1 + (shift)), {shift: true}),
  [sequenceBuilder(1 + (alt))]: new Key(name, sequenceBuilder(1 + (alt)), {alt: true}),
  [sequenceBuilder(1 + (ctrl))]: new Key(name, sequenceBuilder(1 + (ctrl)), {ctrl: true}),
  [sequenceBuilder(1 + (meta))]: new Key(name, sequenceBuilder(1 + (meta)), {meta: true}),

  // With two modifiers
  [sequenceBuilder(1 + (shift | alt))]: new Key(name, sequenceBuilder(1 + (shift | alt)), {shift: true, alt: true}),
  [sequenceBuilder(1 + (shift | ctrl))]: new Key(name, sequenceBuilder(1 + (shift | ctrl)), {shift: true, ctrl: true}),
  [sequenceBuilder(1 + (shift | meta))]: new Key(name, sequenceBuilder(1 + (shift | meta)), {shift: true, meta: true}),
  [sequenceBuilder(1 + (alt | ctrl))]: new Key(name, sequenceBuilder(1 + (alt | ctrl)), {alt: true, ctrl: true}),
  [sequenceBuilder(1 + (alt | meta))]: new Key(name, sequenceBuilder(1 + (alt | meta)), {alt: true, meta: true}),
  [sequenceBuilder(1 + (ctrl | meta))]: new Key(name, sequenceBuilder(1 + (ctrl | meta)), {ctrl: true, meta: true}),

  // With three modifiers
  [sequenceBuilder(1 + (alt | ctrl | meta))]: new Key(name, sequenceBuilder(1 + (alt | ctrl | meta)), {alt: true, ctrl: true, meta: true}),
  [sequenceBuilder(1 + (shift | ctrl | meta))]: new Key(name, sequenceBuilder(1 + (shift | ctrl | meta)), {shift: true, ctrl: true, meta: true}),
  [sequenceBuilder(1 + (shift | alt | meta))]: new Key(name, sequenceBuilder(1 + (shift | alt | meta)), {shift: true, alt: true, meta: true}),
  [sequenceBuilder(1 + (shift | alt | ctrl))]: new Key(name, sequenceBuilder(1 + (shift | alt | ctrl)), {shift: true, ctrl: true, alt: true}),

  // With all modifiers
  [sequenceBuilder(1 + (shift | alt | ctrl | meta))]: new Key(name, sequenceBuilder(1 + (shift | alt | ctrl | meta)), {shift: true, alt: true, ctrl: true, meta: true}),

});

const stringifySequence = (sequence: Array<number>) => {
  return String.fromCharCode(...sequence);
};

const parseCursorSequence = (sequence: Array<number>) => {
  const [, y, x] = stringifySequence(sequence).match(/^\x1b\[([0-9]+);([0-9]+)R$/)!;
  return {type: `cursor` as const, sequence: stringifySequence(sequence), x: Number(x) - 1, y: Number(y) - 1};
};

const parseMouseSequence = (sequence: Array<number>) => {
  const [, x, y] = stringifySequence(sequence).match(/^\x1b\[<[0-9]+;([0-9]+);([0-9]+)[Mm]$/)!;
  return {x: Number(x) - 1, y: Number(y) - 1};
};

const hex8 = (c: string) => {
  return c.length === 2 ? c : c.length === 1 ? `${c}${c}` : c.slice(0, 2);
};

const extractXRgbColor = (sequence: Array<number>) => {
  const [, r, g, b] = stringifySequence(sequence).match(/rgb:([0-9a-f]+)\/([0-9a-f]+)\/([0-9a-f]+)/i)!;
  return `#${hex8(r)}${hex8(g)}${hex8(b)}`;
};

const buildRegistrations = (definition: Record<string, Key | Mouse | Cursor>) => {
  return Array.from(Object.entries(definition), ([sequence, result]): [string, Callback] => {
    return [sequence, () => result];
  });
};

export let sequences: Array<[...Sequence, Callback]> = [];

sequences = sequences.concat(buildRegistrations({

  // Backspace
  //[`\b`]: new Key(`backspace`, `\b`, { shift: true }), // conflicts with <ctrl-h> (\x08)
  [`\x7f`]: new Key(`backspace`, `\x7f`),

  // Tab
  [`\x1b[Z`]: new Key(`tab`, `\x1b[Z`, {shift: true}),
  [`\t`]: new Key(`tab`, `\t`),

  // Enter
  [`\r`]: new Key(`enter`, `\r`),
  [`\n`]: new Key(`enter`, `\n`),

  // Escape
  [`\x1b`]: new Key(`escape`, `\x1b`),

  // Insert
  [`\x1b[2~`]: new Key(`insert`, `\x1b[2~`),

  // Delete
  ...applyModifiers(modifiers => `\x1b[3;${modifiers}~`, `delete`),
  [`\x1b[3~`]: new Key(`delete`, `\x1b[3~`),

  // Home
  [`\x1b[1~`]: new Key(`home`, `\x1b[1~`), // default
  [`\x1b[H`]: new Key(`home`, `\x1b[H`), // rxvt

  // End
  [`\x1b[4~`]: new Key(`end`, `\x1b[4~`), // default
  [`\x1b[Ow`]: new Key(`end`, `\x1b[Ow`), // rxvt

  // Page Up
  [`\x1b[5~`]: new Key(`pgup`, `\x1b[5~`),

  // Page Down
  [`\x1b[6~`]: new Key(`pgdown`, `\x1b[6~`),

  // F1
  ...applyModifiers(modifiers => `\x1b[1;${modifiers}P`, `f1`),
  [`\x1b[11~`]: new Key(`f1`, `\x1b[11~`), // default
  [`\x1bOP`]: new Key(`f1`, `\x1bOP`), // vt100
  [`\x1b[[A`]: new Key(`f1`, `\x1b[[A`), // linux mode
  [`\x1b[M`]: new Key(`f1`, `\x1b[M`), // sco mode

  // F2
  ...applyModifiers(modifiers => `\x1b[1;${modifiers}Q`, `f2`),
  [`\x1b[12~`]: new Key(`f2`, `\x1b[12~`), // default
  [`\x1bOQ`]: new Key(`f2`, `\x1bOQ`), // vt100
  [`\x1b[[B`]: new Key(`f2`, `\x1b[[B`), // linux mode
  [`\x1b[N`]: new Key(`f2`, `\x1b[N`), // sco mode

  // F3
  ...applyModifiers(modifiers => `\x1b[1;${modifiers}R`, `f3`),
  [`\x1b[13~`]: new Key(`f3`, `\x1b[13~`), // default
  [`\x1bOR`]: new Key(`f3`, `\x1bOR`), // vt100
  [`\x1b[[C`]: new Key(`f3`, `\x1b[[C`), // linux mode
  [`\x1b[O`]: new Key(`f3`, `\x1b[O`), // sco mode

  // F4
  ...applyModifiers(modifiers => `\x1b[1;${modifiers}S`, `f4`),
  [`\x1b[14~`]: new Key(`f4`, `\x1b[14~`), // default
  [`\x1bOS`]: new Key(`f4`, `\x1bOS`), // vt100
  [`\x1b[[D`]: new Key(`f4`, `\x1b[[D`), // linux mode
  [`\x1b[P`]: new Key(`f4`, `\x1b[P`), // sco mode

  // F5
  ...applyModifiers(modifiers => `\x1b[15;${modifiers}~`, `f5`),
  [`\x1b[15~`]: new Key(`f5`, `\x1b[15~`), // default
  [`\x1b[[E`]: new Key(`f5`, `\x1b[[E`), // linux mode
  [`\x1b[Q`]: new Key(`f5`, `\x1b[Q`), // sco mode

  // F6
  ...applyModifiers(modifiers => `\x1b[17;${modifiers}~`, `f6`),
  [`\x1b[17~`]: new Key(`f6`, `\x1b[17~`), // default
  [`\x1b[R`]: new Key(`f6`, `\x1b[R`), // sco mode

  // F7
  ...applyModifiers(modifiers => `\x1b[18;${modifiers}~`, `f7`),
  [`\x1b[18~`]: new Key(`f7`, `\x1b[18~`), // default
  [`\x1b[S`]: new Key(`f7`, `\x1b[S`), // sco mode

  // F8
  ...applyModifiers(modifiers => `\x1b[19;${modifiers}~`, `f8`),
  [`\x1b[19~`]: new Key(`f8`, `\x1b[19~`), // default
  [`\x1b[T`]: new Key(`f8`, `\x1b[T`), // sco mode

  // F9
  ...applyModifiers(modifiers => `\x1b[20;${modifiers}~`, `f9`),
  [`\x1b[20~`]: new Key(`f9`, `\x1b[20~`), // default
  [`\x1b[U`]: new Key(`f9`, `\x1b[U`), // sco mode

  // F10
  ...applyModifiers(modifiers => `\x1b[21;${modifiers}~`, `f10`),
  [`\x1b[21~`]: new Key(`f10`, `\x1b[21~`), // default
  [`\x1b[V`]: new Key(`f10`, `\x1b[V`), // sco mode

  // F11
  ...applyModifiers(modifiers => `\x1b[23;${modifiers}~`, `f11`),
  [`\x1b[23~`]: new Key(`f11`, `\x1b[23~`), // default
  [`\x1b[W`]: new Key(`f11`, `\x1b[W`), // sco mode

  // F12
  ...applyModifiers(modifiers => `\x1b[24;${modifiers}~`, `f12`),
  [`\x1b[24~`]: new Key(`f12`, `\x1b[24~`), // default
  [`\x1b[X`]: new Key(`f12`, `\x1b[X`), // sco mode

  // Left
  ...applyModifiers(modifiers => `\x1b[1;${modifiers}D`, `left`),
  [`\x1bOD`]: new Key(`left`, `\x1bOD`),
  [`\x1b[D`]: new Key(`left`, `\x1b[D`),
  [`\x1b\x1b[D`]: new Key(`left`, `\x1b\x1b[D`, {meta: true}), // PuTTY

  // Right
  ...applyModifiers(modifiers => `\x1b[1;${modifiers}C`, `right`),
  [`\x1bOC`]: new Key(`right`, `\x1bOC`),
  [`\x1b[C`]: new Key(`right`, `\x1b[C`),
  [`\x1b\x1b[C`]: new Key(`right`, `\x1b\x1b[C`, {meta: true}), // PuTTY

  // Up
  ...applyModifiers(modifiers => `\x1b[1;${modifiers}A`, `up`),
  [`\x1bOA`]: new Key(`up`, `\x1bOA`),
  [`\x1b[A`]: new Key(`up`, `\x1b[A`),
  [`\x1b\x1b[A`]: new Key(`up`, `\x1b\x1b[A`, {meta: true}), // PuTTY

  // Down
  ...applyModifiers(modifiers => `\x1b[1;${modifiers}B`, `down`),
  [`\x1bOB`]: new Key(`down`, `\x1bOB`),
  [`\x1b[B`]: new Key(`down`, `\x1b[B`),
  [`\x1b\x1b[B`]: new Key(`down`, `\x1b\x1b[B`, {meta: true}), // PuTTY

  // Ctrl+Letter
  [`\x01`]: new Key(`a`, `\x01`, {ctrl: true}),
  [`\x02`]: new Key(`b`, `\x02`, {ctrl: true}),
  [`\x03`]: new Key(`c`, `\x03`, {ctrl: true}),
  [`\x04`]: new Key(`d`, `\x04`, {ctrl: true}),
  [`\x05`]: new Key(`e`, `\x05`, {ctrl: true}),
  [`\x06`]: new Key(`f`, `\x06`, {ctrl: true}),
  [`\x07`]: new Key(`g`, `\x07`, {ctrl: true}),
  [`\x08`]: new Key(`h`, `\x08`, {ctrl: true}),
  //[`\x09`]: new Key(`i`, `\x09`, { ctrl: true }), // conflicts with <tab> (\t)
  //[`\x0a`]: new Key(`j`, `\x0a`, { ctrl: true }), // conflicts with <enter> (\r)
  [`\x0b`]: new Key(`k`, `\x0b`, {ctrl: true}),
  [`\x0c`]: new Key(`l`, `\x0c`, {ctrl: true}),
  //[`\x0d`]: new Key(`m`, `\x0d`, { ctrl: true }), // conflicts with <enter> (\n)
  [`\x0e`]: new Key(`n`, `\x0e`, {ctrl: true}),
  [`\x0f`]: new Key(`o`, `\x0f`, {ctrl: true}),
  [`\x10`]: new Key(`p`, `\x10`, {ctrl: true}),
  [`\x11`]: new Key(`q`, `\x11`, {ctrl: true}),
  [`\x12`]: new Key(`r`, `\x12`, {ctrl: true}),
  [`\x13`]: new Key(`s`, `\x13`, {ctrl: true}),
  [`\x14`]: new Key(`t`, `\x14`, {ctrl: true}),
  [`\x15`]: new Key(`u`, `\x15`, {ctrl: true}),
  [`\x16`]: new Key(`v`, `\x16`, {ctrl: true}),
  [`\x17`]: new Key(`w`, `\x17`, {ctrl: true}),
  [`\x18`]: new Key(`x`, `\x18`, {ctrl: true}),
  [`\x19`]: new Key(`y`, `\x19`, {ctrl: true}),
  [`\x1a`]: new Key(`z`, `\x1a`, {ctrl: true}),

  [`\x1ba`]: new Key(`a`, `\x1ba`, {alt: true}),
  [`\x1bb`]: new Key(`b`, `\x1bb`, {alt: true}),
  [`\x1bc`]: new Key(`c`, `\x1bc`, {alt: true}),
  [`\x1bd`]: new Key(`d`, `\x1bd`, {alt: true}),
  [`\x1be`]: new Key(`e`, `\x1be`, {alt: true}),
  [`\x1bf`]: new Key(`f`, `\x1bf`, {alt: true}),
  [`\x1bg`]: new Key(`g`, `\x1bg`, {alt: true}),
  [`\x1bh`]: new Key(`h`, `\x1bh`, {alt: true}),
  [`\x1bi`]: new Key(`i`, `\x1bi`, {alt: true}),
  [`\x1bj`]: new Key(`j`, `\x1bj`, {alt: true}),
  [`\x1bk`]: new Key(`k`, `\x1bk`, {alt: true}),
  [`\x1bl`]: new Key(`l`, `\x1bl`, {alt: true}),
  [`\x1bm`]: new Key(`m`, `\x1bm`, {alt: true}),
  [`\x1bn`]: new Key(`n`, `\x1bn`, {alt: true}),
  [`\x1bo`]: new Key(`o`, `\x1bo`, {alt: true}),
  [`\x1bp`]: new Key(`p`, `\x1bp`, {alt: true}),
  [`\x1bq`]: new Key(`q`, `\x1bq`, {alt: true}),
  [`\x1br`]: new Key(`r`, `\x1br`, {alt: true}),
  [`\x1bs`]: new Key(`s`, `\x1bs`, {alt: true}),
  [`\x1bt`]: new Key(`t`, `\x1bt`, {alt: true}),
  [`\x1bu`]: new Key(`u`, `\x1bu`, {alt: true}),
  [`\x1bv`]: new Key(`v`, `\x1bv`, {alt: true}),
  [`\x1bw`]: new Key(`w`, `\x1bw`, {alt: true}),
  [`\x1bx`]: new Key(`x`, `\x1bx`, {alt: true}),
  [`\x1by`]: new Key(`y`, `\x1by`, {alt: true}),
  [`\x1bz`]: new Key(`z`, `\x1bz`, {alt: true}),

}));

const modifierCombinations: Array<{
  code: number;
  alt: boolean;
  ctrl: boolean;
  shift: boolean;
}> = [];

for (const alt of [false, true]) {
  for (const ctrl of [false, true]) {
    for (const shift of [false, true]) {
      modifierCombinations.push({
        code: (alt ? 1 << 3 : 0) | (ctrl ? 1 << 4 : 0) | (shift ? 1 << 2 : 0),
        alt,
        ctrl,
        shift,
      });
    }
  }
}

for (const [index, button] of [`left`, `middle`, `right`].entries()) {
  for (const {code, alt, ctrl, shift} of modifierCombinations) {
    const finalCode = index | code;

    sequences.push([`\x1b[<${finalCode};`, NumberNode, `;`, NumberNode, `M`, sequence => new Mouse(button, stringifySequence(sequence), {alt, ctrl, shift, start: true})]);
    sequences.push([`\x1b[<${finalCode};`, NumberNode, `;`, NumberNode, `m`, sequence => new Mouse(button, stringifySequence(sequence), {alt, ctrl, shift, end: true})]);
  }
}

for (const {code, alt, ctrl, shift} of modifierCombinations) {
  const finalCode = code + 35;

  sequences.push([`\x1b[<${finalCode};`, NumberNode, `;`, NumberNode, `M`, sequence => new Mouse(null, stringifySequence(sequence), {...parseMouseSequence(sequence), alt, ctrl, shift})]);
  sequences.push([`\x1b[<${finalCode};`, NumberNode, `;`, NumberNode, `m`, sequence => new Mouse(null, stringifySequence(sequence), {...parseMouseSequence(sequence), alt, ctrl, shift})]);
}

for (const {code, alt, ctrl, shift} of modifierCombinations) {
  const finalCode = 64 + code;

  sequences.push([`\x1b[<${finalCode + 0};`, NumberNode, `;`, NumberNode, `M`, sequence => new Mouse(`wheel`, stringifySequence(sequence), {...parseMouseSequence(sequence), start: true, end: true, d: -1, alt, ctrl, shift})]);
  sequences.push([`\x1b[<${finalCode + 0};`, NumberNode, `;`, NumberNode, `m`, sequence => new Mouse(`wheel`, stringifySequence(sequence), {...parseMouseSequence(sequence), start: true, end: true, d: -1, alt, ctrl, shift})]);

  sequences.push([`\x1b[<${finalCode + 1};`, NumberNode, `;`, NumberNode, `M`, sequence => new Mouse(`wheel`, stringifySequence(sequence), {...parseMouseSequence(sequence), start: true, end: true, d: +1, alt, ctrl, shift})]);
  sequences.push([`\x1b[<${finalCode + 1};`, NumberNode, `;`, NumberNode, `m`, sequence => new Mouse(`wheel`, stringifySequence(sequence), {...parseMouseSequence(sequence), start: true, end: true, d: +1, alt, ctrl, shift})]);

  sequences.push([`\x1b[<${finalCode + 2};`, NumberNode, `;`, NumberNode, `M`, sequence => new Mouse(`wheel`, stringifySequence(sequence), {...parseMouseSequence(sequence), start: true, end: true, dx: -1, alt, ctrl, shift})]);
  sequences.push([`\x1b[<${finalCode + 2};`, NumberNode, `;`, NumberNode, `m`, sequence => new Mouse(`wheel`, stringifySequence(sequence), {...parseMouseSequence(sequence), start: true, end: true, dx: -1, alt, ctrl, shift})]);

  sequences.push([`\x1b[<${finalCode + 3};`, NumberNode, `;`, NumberNode, `M`, sequence => new Mouse(`wheel`, stringifySequence(sequence), {...parseMouseSequence(sequence), start: true, end: true, dx: +1, alt, ctrl, shift})]);
  sequences.push([`\x1b[<${finalCode + 3};`, NumberNode, `;`, NumberNode, `m`, sequence => new Mouse(`wheel`, stringifySequence(sequence), {...parseMouseSequence(sequence), start: true, end: true, dx: +1, alt, ctrl, shift})]);
}

sequences = sequences.concat([

  [`\x1b]11;rgb:`, HexNode, `/`, HexNode, `/`, HexNode, `\x07`, (sequence): Info => ({type: `info`, name: `screenBackgroundColor`, color: extractXRgbColor(sequence)})],

  [`\x1b[`, NumberNode, `;`, NumberNode, `R`, sequence => parseCursorSequence(sequence)],

  [`\x1b[`, NumberNode, `;5u`, sequence => new Key(String.fromCharCode(+String.fromCharCode(...sequence).match(/([0-9]+)/)![0]), stringifySequence(sequence), {ctrl: true})],
  [`\x1b[`, NumberNode, `;6u`, sequence => new Key(String.fromCharCode(+String.fromCharCode(...sequence).match(/([0-9]+)/)![0]), stringifySequence(sequence), {ctrl: true})],

]);
