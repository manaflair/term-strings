import { NumberNode } from './parser/NumberNode';
import { Cursor }     from './types/Cursor';
import { Key }        from './types/Key';
import { Mouse }      from './types/Mouse';

let shift = 1 << 0, alt = 1 << 1, ctrl = 1 << 2, meta = 1 << 3;

let applyModifiers = (sequenceBuilder, name) => ({

    // Simple key, no modifiers
    [sequenceBuilder(1 + (0))]: new Key(name),

    // With a single modifier
    [sequenceBuilder(1 + (shift))]: new Key(name, { shift: true }),
    [sequenceBuilder(1 + (alt))]: new Key(name, { alt: true }),
    [sequenceBuilder(1 + (ctrl))]: new Key(name, { ctrl: true }),
    [sequenceBuilder(1 + (meta))]: new Key(name, { meta: true }),

    // With two modifiers
    [sequenceBuilder(1 + (shift | alt))]: new Key(name, { shift: true, alt: true }),
    [sequenceBuilder(1 + (shift | ctrl))]: new Key(name, { shift: true, ctrl: true }),
    [sequenceBuilder(1 + (shift | meta))]: new Key(name, { shift: true, meta: true }),
    [sequenceBuilder(1 + (alt | ctrl))]: new Key(name, { alt: true, ctrl: true }),
    [sequenceBuilder(1 + (alt | meta))]: new Key(name, { alt: true, meta: true }),
    [sequenceBuilder(1 + (ctrl | meta))]: new Key(name, { ctrl: true, meta: true }),

    // With three modifiers
    [sequenceBuilder(1 + (alt | ctrl | meta))]: new Key(name, { alt: true, ctrl: true, meta: true }),
    [sequenceBuilder(1 + (shift | ctrl | meta))]: new Key(name, { shift: true, ctrl: true, meta: true }),
    [sequenceBuilder(1 + (shift | alt | meta))]: new Key(name, { shift: true, alt: true, meta: true }),
    [sequenceBuilder(1 + (shift | alt | ctrl))]: new Key(name, { shift: true, ctrl: true, alt: true }),

    // With all modifiers
    [sequenceBuilder(1 + (shift | alt | ctrl | meta))]: new Key(name, { shift: true, alt: true, ctrl: true, alt: true }),

});

let parseCursorSequence = sequence => {

    let [ all, y, x ] = String.fromCharCode(... sequence).match(/^\x1b\[([0-9]+);([0-9]+)R$/);

    return { x: Number(x) - 1, y: Number(y) - 1 };

};

let parseMouseSequence = sequence => {

    let [ all, x, y ] = String.fromCharCode(... sequence).match(/^\x1b\[<[0-9]+;([0-9]+);([0-9]+)[Mm]$/);

    return { x: Number(x) - 1, y: Number(y) - 1 };

};

let buildRegistrations = definition => {

    return Array.from(Object.entries(definition)).map(([ sequence, result ]) => {

        return [ sequence, () => result ];

    });

};

export let sequences = buildRegistrations({

    // Backspace
    //[`\b`]: new Key(`backspace`, { shift: true }), // conflicts with <ctrl-h> (\x08)
    [`\x7f`]: new Key(`backspace`),

    // Tab
    [`\x1b[Z`]: new Key(`tab`, { shift: true }),
    [`\t`]: new Key(`tab`),

    // Enter
    [`\r`]: new Key(`enter`),
    [`\n`]: new Key(`enter`),

    // Escape
    [`\x1b`]: new Key(`escape`),

    // Insert
    [`\x1b[2~`]: new Key(`insert`),

    // Delete
    ... applyModifiers(modifiers => `\x1b[3;${modifiers}~`, `delete`),
    [`\x1b[3~`]: new Key(`delete`),

    // Home
    [`\x1b[1~`]: new Key(`home`), // default
    [`\x1b[H`]: new Key(`home`), // rxvt

    // End
    [`\x1b[4~`]: new Key(`end`), // default
    [`\x1b[Ow`]: new Key(`end`), // rxvt

    // Page Up
    [`\x1b[5~`]: new Key(`pgup`),

    // Page Down
    [`\x1b[6~`]: new Key(`pgdown`),

    // F1
    ... applyModifiers(modifiers => `\x1b[1;${modifiers}P`, `f1`),
    [`\x1b[11~`]: new Key(`f1`), // default
    [`\x1bOP`]: new Key(`f1`), // vt100
    [`\x1b[[A`]: new Key(`f1`), // linux mode
    [`\x1b[M`]: new Key(`f1`), // sco mode

    // F2
    ... applyModifiers(modifiers => `\x1b[1;${modifiers}Q`, `f2`),
    [`\x1b[12~`]: new Key(`f2`), // default
    [`\x1bOQ`]: new Key(`f2`), // vt100
    [`\x1b[[B`]: new Key(`f2`), // linux mode
    [`\x1b[N`]: new Key(`f2`), // sco mode

    // F3
    ... applyModifiers(modifiers => `\x1b[1;${modifiers}R`, `f3`),
    [`\x1b[13~`]: new Key(`f3`), // default
    [`\x1bOR`]: new Key(`f3`), // vt100
    [`\x1b[[C`]: new Key(`f3`), // linux mode
    [`\x1b[O`]: new Key(`f3`), // sco mode

    // F4
    ... applyModifiers(modifiers => `\x1b[1;${modifiers}S`, `f4`),
    [`\x1b[14~`]: new Key(`f4`), // default
    [`\x1bOS`]: new Key(`f4`), // vt100
    [`\x1b[[D`]: new Key(`f4`), // linux mode
    [`\x1b[P`]: new Key(`f4`), // sco mode

    // F5
    ... applyModifiers(modifiers => `\x1b[15;${modifiers}~`, `f5`),
    [`\x1b[15~`]: new Key(`f5`), // default
    [`\x1b[[E`]: new Key(`f5`), // linux mode
    [`\x1b[Q`]: new Key(`f5`), // sco mode

    // F6
    ... applyModifiers(modifiers => `\x1b[17;${modifiers}~`, `f6`),
    [`\x1b[17~`]: new Key(`f6`), // default
    [`\x1b[R`]: new Key(`f6`), // sco mode

    // F7
    ... applyModifiers(modifiers => `\x1b[18;${modifiers}~`, `f7`),
    [`\x1b[18~`]: new Key(`f7`), // default
    [`\x1b[S`]: new Key(`f7`), // sco mode

    // F8
    ... applyModifiers(modifiers => `\x1b[19;${modifiers}~`, `f8`),
    [`\x1b[19~`]: new Key(`f8`), // default
    [`\x1b[T`]: new Key(`f8`), // sco mode

    // F9
    ... applyModifiers(modifiers => `\x1b[20;${modifiers}~`, `f9`),
    [`\x1b[20~`]: new Key(`f9`), // default
    [`\x1b[U`]: new Key(`f9`), // sco mode

    // F10
    ... applyModifiers(modifiers => `\x1b[21;${modifiers}~`, `f10`),
    [`\x1b[21~`]: new Key(`f10`), // default
    [`\x1b[V`]: new Key(`f10`), // sco mode

    // F11
    ... applyModifiers(modifiers => `\x1b[23;${modifiers}~`, `f11`),
    [`\x1b[23~`]: new Key(`f11`), // default
    [`\x1b[W`]: new Key(`f11`), // sco mode

    // F12
    ... applyModifiers(modifiers => `\x1b[24;${modifiers}~`, `f12`),
    [`\x1b[24~`]: new Key(`f12`), // default
    [`\x1b[X`]: new Key(`f12`), // sco mode

    // Left
    ... applyModifiers(modifiers => `\x1b[1;${modifiers}D`, `left`),
    [`\x1bOD`]: new Key(`left`),
    [`\x1b[D`]: new Key(`left`),
    [`\x1b\x1b[D`]: new Key(`left`, { meta: true }), // PuTTY

    // Right
    ... applyModifiers(modifiers => `\x1b[1;${modifiers}C`, `right`),
    [`\x1bOC`]: new Key(`right`),
    [`\x1b[C`]: new Key(`right`),
    [`\x1b\x1b[C`]: new Key(`right`, { meta: true }), // PuTTY

    // Up
    ... applyModifiers(modifiers => `\x1b[1;${modifiers}A`, `up`),
    [`\x1bOA`]: new Key(`up`),
    [`\x1b[A`]: new Key(`up`),
    [`\x1b\x1b[A`]: new Key(`up`, { meta: true }), // PuTTY

    // Down
    ... applyModifiers(modifiers => `\x1b[1;${modifiers}B`, `down`),
    [`\x1bOB`]: new Key(`down`),
    [`\x1b[B`]: new Key(`down`),
    [`\x1b\x1b[B`]: new Key(`down`, { meta: true }), // PuTTY

    // Ctrl+Letter
    [`\x01`]: new Key(`a`, { ctrl: true }),
    [`\x02`]: new Key(`b`, { ctrl: true }),
    [`\x03`]: new Key(`c`, { ctrl: true }),
    [`\x04`]: new Key(`d`, { ctrl: true }),
    [`\x05`]: new Key(`e`, { ctrl: true }),
    [`\x06`]: new Key(`f`, { ctrl: true }),
    [`\x07`]: new Key(`g`, { ctrl: true }),
    [`\x08`]: new Key(`h`, { ctrl: true }),
    //[`\x09`]: new Key(`i`, { ctrl: true }), // conflicts with <tab> (\t)
    //[`\x0a`]: new Key(`j`, { ctrl: true }), // conflicts with <enter> (\r)
    [`\x0b`]: new Key(`k`, { ctrl: true }),
    [`\x0c`]: new Key(`l`, { ctrl: true }),
    //[`\x0d`]: new Key(`m`, { ctrl: true }), // conflicts with <enter> (\n)
    [`\x0e`]: new Key(`n`, { ctrl: true }),
    [`\x0f`]: new Key(`o`, { ctrl: true }),
    [`\x10`]: new Key(`p`, { ctrl: true }),
    [`\x11`]: new Key(`q`, { ctrl: true }),
    [`\x12`]: new Key(`r`, { ctrl: true }),
    [`\x13`]: new Key(`s`, { ctrl: true }),
    [`\x14`]: new Key(`t`, { ctrl: true }),
    [`\x15`]: new Key(`u`, { ctrl: true }),
    [`\x16`]: new Key(`v`, { ctrl: true }),
    [`\x17`]: new Key(`w`, { ctrl: true }),
    [`\x18`]: new Key(`x`, { ctrl: true }),
    [`\x19`]: new Key(`y`, { ctrl: true }),
    [`\x1a`]: new Key(`z`, { ctrl: true }),

    [`\x1ba`]: new Key(`a`, { alt: true }),
    [`\x1bb`]: new Key(`b`, { alt: true }),
    [`\x1bc`]: new Key(`c`, { alt: true }),
    [`\x1bd`]: new Key(`d`, { alt: true }),
    [`\x1be`]: new Key(`e`, { alt: true }),
    [`\x1bf`]: new Key(`f`, { alt: true }),
    [`\x1bg`]: new Key(`g`, { alt: true }),
    [`\x1bh`]: new Key(`h`, { alt: true }),
    [`\x1bi`]: new Key(`i`, { alt: true }),
    [`\x1bj`]: new Key(`j`, { alt: true }),
    [`\x1bk`]: new Key(`k`, { alt: true }),
    [`\x1bl`]: new Key(`l`, { alt: true }),
    [`\x1bm`]: new Key(`m`, { alt: true }),
    [`\x1bn`]: new Key(`n`, { alt: true }),
    [`\x1bo`]: new Key(`o`, { alt: true }),
    [`\x1bp`]: new Key(`p`, { alt: true }),
    [`\x1bq`]: new Key(`q`, { alt: true }),
    [`\x1br`]: new Key(`r`, { alt: true }),
    [`\x1bs`]: new Key(`s`, { alt: true }),
    [`\x1bt`]: new Key(`t`, { alt: true }),
    [`\x1bu`]: new Key(`u`, { alt: true }),
    [`\x1bv`]: new Key(`v`, { alt: true }),
    [`\x1bw`]: new Key(`w`, { alt: true }),
    [`\x1bx`]: new Key(`x`, { alt: true }),
    [`\x1by`]: new Key(`y`, { alt: true }),
    [`\x1bz`]: new Key(`z`, { alt: true }),

}).concat([

    [ `\x1b[`, NumberNode, `;`, NumberNode, `R`, sequence => new Cursor(parseCursorSequence(sequence)) ],

    [ `\x1b[`, NumberNode, `;5u`, sequence => new Key(String.fromCharCode(String.fromCharCode(... sequence).match(/([0-9]+)/)[0]), { ctrl: true }) ],
    [ `\x1b[`, NumberNode, `;6u`, sequence => new Key(String.fromCharCode(String.fromCharCode(... sequence).match(/([0-9]+)/)[0]), { ctrl: true }) ],

    [ `\x1b[<0;`, NumberNode, `;`, NumberNode, `M`, sequence => new Mouse(`left`, { ... parseMouseSequence(sequence), start: true }) ],
    [ `\x1b[<0;`, NumberNode, `;`, NumberNode, `m`, sequence => new Mouse(`left`, { ... parseMouseSequence(sequence), end: true }) ],

    [ `\x1b[<1;`, NumberNode, `;`, NumberNode, `M`, sequence => new Mouse(`middle`, { ... parseMouseSequence(sequence), start: true }) ],
    [ `\x1b[<1;`, NumberNode, `;`, NumberNode, `m`, sequence => new Mouse(`middle`, { ... parseMouseSequence(sequence), end: true }) ],

    [ `\x1b[<2;`, NumberNode, `;`, NumberNode, `M`, sequence => new Mouse(`right`, { ... parseMouseSequence(sequence), start: true }) ],
    [ `\x1b[<2;`, NumberNode, `;`, NumberNode, `m`, sequence => new Mouse(`right`, { ... parseMouseSequence(sequence), end: true }) ],

    [ `\x1b[<8;`, NumberNode, `;`, NumberNode, `M`, sequence => new Mouse(`left`, { ... parseMouseSequence(sequence), start: true, alt: true }) ],
    [ `\x1b[<8;`, NumberNode, `;`, NumberNode, `m`, sequence => new Mouse(`left`, { ... parseMouseSequence(sequence), end: true, alt: true }) ],

    [ `\x1b[<9;`, NumberNode, `;`, NumberNode, `M`, sequence => new Mouse(`middle`, { ... parseMouseSequence(sequence), start: true, alt: true }) ],
    [ `\x1b[<9;`, NumberNode, `;`, NumberNode, `m`, sequence => new Mouse(`middle`, { ... parseMouseSequence(sequence), end: true, alt: true }) ],

    [ `\x1b[<10;`, NumberNode, `;`, NumberNode, `M`, sequence => new Mouse(`right`, { ... parseMouseSequence(sequence), start: true, alt: true }) ],
    [ `\x1b[<10;`, NumberNode, `;`, NumberNode, `m`, sequence => new Mouse(`right`, { ... parseMouseSequence(sequence), end: true, alt: true }) ],

    [ `\x1b[<16;`, NumberNode, `;`, NumberNode, `M`, sequence => new Mouse(`left`, { ... parseMouseSequence(sequence), start: true, ctrl: true }) ],
    [ `\x1b[<16;`, NumberNode, `;`, NumberNode, `m`, sequence => new Mouse(`left`, { ... parseMouseSequence(sequence), end: true, ctrl: true }) ],

    [ `\x1b[<17;`, NumberNode, `;`, NumberNode, `M`, sequence => new Mouse(`middle`, { ... parseMouseSequence(sequence), start: true, ctrl: true }) ],
    [ `\x1b[<17;`, NumberNode, `;`, NumberNode, `m`, sequence => new Mouse(`middle`, { ... parseMouseSequence(sequence), end: true, ctrl: true }) ],

    [ `\x1b[<18;`, NumberNode, `;`, NumberNode, `M`, sequence => new Mouse(`right`, { ... parseMouseSequence(sequence), start: true, ctrl: true }) ],
    [ `\x1b[<18;`, NumberNode, `;`, NumberNode, `m`, sequence => new Mouse(`right`, { ... parseMouseSequence(sequence), end: true, ctrl: true }) ],

    [ `\x1b[<32;`, NumberNode, `;`, NumberNode, `M`, sequence => new Mouse(`left`, { ... parseMouseSequence(sequence) }) ],
    [ `\x1b[<32;`, NumberNode, `;`, NumberNode, `m`, sequence => new Mouse(`left`, { ... parseMouseSequence(sequence) }) ],

    [ `\x1b[<33;`, NumberNode, `;`, NumberNode, `M`, sequence => new Mouse(`middle`, { ... parseMouseSequence(sequence) }) ],
    [ `\x1b[<33;`, NumberNode, `;`, NumberNode, `m`, sequence => new Mouse(`middle`, { ... parseMouseSequence(sequence) }) ],

    [ `\x1b[<34;`, NumberNode, `;`, NumberNode, `M`, sequence => new Mouse(`right`, { ... parseMouseSequence(sequence) }) ],
    [ `\x1b[<34;`, NumberNode, `;`, NumberNode, `m`, sequence => new Mouse(`right`, { ... parseMouseSequence(sequence) }) ],

    [ `\x1b[<35;`, NumberNode, `;`, NumberNode, `M`, sequence => new Mouse(null, { ... parseMouseSequence(sequence) }) ],
    [ `\x1b[<35;`, NumberNode, `;`, NumberNode, `m`, sequence => new Mouse(null, { ... parseMouseSequence(sequence) }) ],

    [ `\x1b[<43;`, NumberNode, `;`, NumberNode, `M`, sequence => new Mouse(null, { ... parseMouseSequence(sequence), alt: true }) ],
    [ `\x1b[<43;`, NumberNode, `;`, NumberNode, `m`, sequence => new Mouse(null, { ... parseMouseSequence(sequence), alt: true }) ],

    [ `\x1b[<51;`, NumberNode, `;`, NumberNode, `M`, sequence => new Mouse(null, { ... parseMouseSequence(sequence), ctrl: true }) ],
    [ `\x1b[<51;`, NumberNode, `;`, NumberNode, `m`, sequence => new Mouse(null, { ... parseMouseSequence(sequence), ctrl: true }) ],

    [ `\x1b[<64;`, NumberNode, `;`, NumberNode, `M`, sequence => new Mouse(`wheel`, { ... parseMouseSequence(sequence), start: true, end: true, d: -1 }) ],
    [ `\x1b[<64;`, NumberNode, `;`, NumberNode, `m`, sequence => new Mouse(`wheel`, { ... parseMouseSequence(sequence), start: true, end: true, d: -1 }) ],

    [ `\x1b[<65;`, NumberNode, `;`, NumberNode, `M`, sequence => new Mouse(`wheel`, { ... parseMouseSequence(sequence), start: true, end: true, d: +1 }) ],
    [ `\x1b[<65;`, NumberNode, `;`, NumberNode, `m`, sequence => new Mouse(`wheel`, { ... parseMouseSequence(sequence), start: true, end: true, d: +1 }) ],

    [ `\x1b[<72;`, NumberNode, `;`, NumberNode, `M`, sequence => new Mouse(`wheel`, { ... parseMouseSequence(sequence), start: true, end: true, d: -1, alt: true }) ],
    [ `\x1b[<72;`, NumberNode, `;`, NumberNode, `m`, sequence => new Mouse(`wheel`, { ... parseMouseSequence(sequence), start: true, end: true, d: -1, alt: true }) ],

    [ `\x1b[<73;`, NumberNode, `;`, NumberNode, `M`, sequence => new Mouse(`wheel`, { ... parseMouseSequence(sequence), start: true, end: true, d: +1, alt: true }) ],
    [ `\x1b[<73;`, NumberNode, `;`, NumberNode, `m`, sequence => new Mouse(`wheel`, { ... parseMouseSequence(sequence), start: true, end: true, d: +1, alt: true }) ],

    [ `\x1b[<80;`, NumberNode, `;`, NumberNode, `M`, sequence => new Mouse(`wheel`, { ... parseMouseSequence(sequence), start: true, end: true, d: -1, ctrl: true }) ],
    [ `\x1b[<80;`, NumberNode, `;`, NumberNode, `m`, sequence => new Mouse(`wheel`, { ... parseMouseSequence(sequence), start: true, end: true, d: -1, ctrl: true }) ],

    [ `\x1b[<81;`, NumberNode, `;`, NumberNode, `M`, sequence => new Mouse(`wheel`, { ... parseMouseSequence(sequence), start: true, end: true, d: +1, ctrl: true }) ],
    [ `\x1b[<81;`, NumberNode, `;`, NumberNode, `m`, sequence => new Mouse(`wheel`, { ... parseMouseSequence(sequence), start: true, end: true, d: +1, ctrl: true }) ],

]);
