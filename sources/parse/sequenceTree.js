import { Key }   from './types/Key';
import { Mouse } from './types/Mouse';

class SequenceNode {

    constructor() {

        this.sub = new Map();

        this.output = null;

    }

    mount(sequence, node) {

        if (!node)
            throw new Error('what');

        if (sequence.length < 1)
            throw new Error(`Sequence too short`);

        if (typeof sequence === `string`)
            sequence = new Buffer(sequence);

        if (sequence.length > 1) {

            let [ byte, ... rest ] = sequence;

            let sub = this.sub.get(byte);
            if (!sub) this.sub.set(byte, sub = new SequenceNode());

            sub.mount(rest, node);

        } else {

            let [ byte ] = sequence;

            let sub = this.sub.get(byte);
            if (sub) throw new Error(`Duplicate sequence - there's likely an error in the @manaflair/term-strings package itself. Please open an issue so we can investigate it.`);

            this.sub.set(byte, node);

        }

        return this;

    }

    register(sequence, output) {

        if (typeof sequence === `string`)
            sequence = new Buffer(sequence);

        if (typeof output !== `function`) {
            let temp = output;
            output = () => temp;
        }

        if (sequence.length > 0) {

            let [ byte, ... rest ] = sequence;

            let sub = this.sub.get(byte);
            if (!sub) this.sub.set(byte, sub = new SequenceNode());

            sub.register(rest, output);

        } else {

            if (this.output !== null)
                throw new Error(`Duplicate sequence - there's likely an error in the @manaflair/term-strings package, please open an issue.`);

            this.output = output;

        }

        return this;

    }

    registerKey(sequenceBuilder, name) {

        let shift = 1 << 0, alt = 1 << 1, ctrl = 1 << 2, meta = 1 << 3;

        // Simple key, no modifiers
        this.register(sequenceBuilder(1 + (0)), new Key(name));

        // With a single modifier
        this.register(sequenceBuilder(1 + (shift)), new Key(name, { shift: true }));
        this.register(sequenceBuilder(1 + (alt)), new Key(name, { alt: true }));
        this.register(sequenceBuilder(1 + (ctrl)), new Key(name, { ctrl: true }));
        this.register(sequenceBuilder(1 + (meta)), new Key(name, { meta: true }));

        // With two modifiers
        this.register(sequenceBuilder(1 + (shift | alt)), new Key(name, { shift: true, alt: true }));
        this.register(sequenceBuilder(1 + (shift | ctrl)), new Key(name, { shift: true, ctrl: true }));
        this.register(sequenceBuilder(1 + (shift | meta)), new Key(name, { shift: true, meta: true }));
        this.register(sequenceBuilder(1 + (alt | ctrl)), new Key(name, { alt: true, ctrl: true }));
        this.register(sequenceBuilder(1 + (alt | meta)), new Key(name, { alt: true, meta: true }));
        this.register(sequenceBuilder(1 + (ctrl | meta)), new Key(name, { ctrl: true, meta: true }));

        // With three modifiers
        this.register(sequenceBuilder(1 + (alt | ctrl | meta)), new Key(name, { alt: true, ctrl: true, meta: true }));
        this.register(sequenceBuilder(1 + (shift | ctrl | meta)), new Key(name, { shift: true, ctrl: true, meta: true }));
        this.register(sequenceBuilder(1 + (shift | alt | meta)), new Key(name, { shift: true, alt: true, meta: true }));
        this.register(sequenceBuilder(1 + (shift | alt | ctrl)), new Key(name, { shift: true, ctrl: true, alt: true }));

        // With all modifiers
        this.register(sequenceBuilder(1 + (shift | alt | ctrl | meta)), new Key(name, { shift: true, alt: true, ctrl: true, alt: true }));

        return this;

    }

}

function makeNumberNode(tailFn) {

    // This function is useful to build a node that will loop over itself, avoiding to fill the memory with useless nodes
    // We mainly use it in order to parse dynamic parameters in mouse coordinates. It has its own issues that should probably be fixed in a better world:

    // - A code such as .mount(`test`, makeNumberNode()).register(`test0`, 42) will return 42 for string "test0", but also for "test00" and "test0123456789"
    // - This API doesn't support overlaping nodes, which fortunately doesn't occur yet as far as I know

    let firstNode = new SequenceNode();
    let loopNode = new SequenceNode();

    for (let digit of `0123456789`) {
        loopNode.mount(digit, loopNode);
        firstNode.mount(digit, loopNode);
    }

    tailFn(loopNode);
    return firstNode;

}

export let sequenceTree = new SequenceNode();

// Backspace
//sequenceTree.register(`\b`, new Key(`backspace`, { shift: true })); // conflicts with <ctrl-h> (\x08)
sequenceTree.register(`\x7f`, new Key(`backspace`));

// Tab
sequenceTree.register(`\x1b[Z`, new Key(`tab`, { shift: true }));
sequenceTree.register(`\t`, new Key(`tab`));

// Enter
sequenceTree.register(`\r`, new Key(`enter`));
sequenceTree.register(`\n`, new Key(`enter`));

// Escape
sequenceTree.register(`\x1b`, new Key(`escape`));

// Insert
sequenceTree.register(`\x1b[2~`, new Key(`insert`));

// Delete
sequenceTree.registerKey(modifiers => `\x1b[3;${modifiers}~`, `delete`);
sequenceTree.register(`\x1b[3~`, new Key(`delete`));

// Home
sequenceTree.register(`\x1b[1~`, new Key(`home`)); // default
sequenceTree.register(`\x1b[H`, new Key(`home`)); // rxvt

// End
sequenceTree.register(`\x1b[4~`, new Key(`end`)); // default
sequenceTree.register(`\x1b[Ow`, new Key(`end`)); // rxvt

// Page Up
sequenceTree.register(`\x1b[5~`, new Key(`pgup`));

// Page Down
sequenceTree.register(`\x1b[6~`, new Key(`pgdown`));

// F1
sequenceTree.registerKey(modifiers => `\x1b[1;${modifiers}P`, `f1`);
sequenceTree.register(`\x1b[11~`, new Key(`f1`)); // default
sequenceTree.register(`\x1bOP`, new Key(`f1`)); // vt100
sequenceTree.register(`\x1b[[A`, new Key(`f1`)); // linux mode
sequenceTree.register(`\x1b[M`, new Key(`f1`)); // sco mode

// F2
sequenceTree.registerKey(modifiers => `\x1b[1;${modifiers}Q`, `f2`);
sequenceTree.register(`\x1b[12~`, new Key(`f2`)); // default
sequenceTree.register(`\x1bOQ`, new Key(`f2`)); // vt100
sequenceTree.register(`\x1b[[B`, new Key(`f2`)); // linux mode
sequenceTree.register(`\x1b[N`, new Key(`f2`)); // sco mode

// F3
sequenceTree.registerKey(modifiers => `\x1b[1;${modifiers}R`, `f3`);
sequenceTree.register(`\x1b[13~`, new Key(`f3`)); // default
sequenceTree.register(`\x1bOR`, new Key(`f3`)); // vt100
sequenceTree.register(`\x1b[[C`, new Key(`f3`)); // linux mode
sequenceTree.register(`\x1b[O`, new Key(`f3`)); // sco mode

// F4
sequenceTree.registerKey(modifiers => `\x1b[1;${modifiers}S`, `f4`);
sequenceTree.register(`\x1b[14~`, new Key(`f4`)); // default
sequenceTree.register(`\x1bOS`, new Key(`f4`)); // vt100
sequenceTree.register(`\x1b[[D`, new Key(`f4`)); // linux mode
sequenceTree.register(`\x1b[P`, new Key(`f4`)); // sco mode

// F5
sequenceTree.registerKey(modifiers => `\x1b[15;${modifiers}~`, `f5`);
sequenceTree.register(`\x1b[15~`, new Key(`f5`)); // default
sequenceTree.register(`\x1b[[E`, new Key(`f5`)); // linux mode
sequenceTree.register(`\x1b[Q`, new Key(`f5`)); // sco mode

// F6
sequenceTree.registerKey(modifiers => `\x1b[17;${modifiers}~`, `f6`);
sequenceTree.register(`\x1b[17~`, new Key(`f6`)); // default
sequenceTree.register(`\x1b[R`, new Key(`f6`)); // sco mode

// F7
sequenceTree.registerKey(modifiers => `\x1b[18;${modifiers}~`, `f7`);
sequenceTree.register(`\x1b[18~`, new Key(`f7`)); // default
sequenceTree.register(`\x1b[S`, new Key(`f7`)); // sco mode

// F8
sequenceTree.registerKey(modifiers => `\x1b[19;${modifiers}~`, `f8`);
sequenceTree.register(`\x1b[19~`, new Key(`f8`)); // default
sequenceTree.register(`\x1b[T`, new Key(`f8`)); // sco mode

// F9
sequenceTree.registerKey(modifiers => `\x1b[20;${modifiers}~`, `f9`);
sequenceTree.register(`\x1b[20~`, new Key(`f9`)); // default
sequenceTree.register(`\x1b[U`, new Key(`f9`)); // sco mode

// F10
sequenceTree.registerKey(modifiers => `\x1b[21;${modifiers}~`, `f10`);
sequenceTree.register(`\x1b[21~`, new Key(`f10`)); // default
sequenceTree.register(`\x1b[V`, new Key(`f10`)); // sco mode

// F11
sequenceTree.registerKey(modifiers => `\x1b[23;${modifiers}~`, `f11`);
sequenceTree.register(`\x1b[23~`, new Key(`f11`)); // default
sequenceTree.register(`\x1b[W`, new Key(`f11`)); // sco mode

// F12
sequenceTree.registerKey(modifiers => `\x1b[24;${modifiers}~`, `f12`);
sequenceTree.register(`\x1b[24~`, new Key(`f12`)); // default
sequenceTree.register(`\x1b[X`, new Key(`f12`)); // sco mode

// Left
sequenceTree.registerKey(modifiers => `\x1b[1;${modifiers}D`, `left`);
sequenceTree.register(`\x1bOD`, new Key(`left`));
sequenceTree.register(`\x1b[D`, new Key(`left`));
sequenceTree.register(`\x1b\x1b[D`, new Key(`left`, { meta: true })); // PuTTY

// Right
sequenceTree.registerKey(modifiers => `\x1b[1;${modifiers}C`, `right`);
sequenceTree.register(`\x1bOC`, new Key(`right`));
sequenceTree.register(`\x1b[C`, new Key(`right`));
sequenceTree.register(`\x1b\x1b[C`, new Key(`right`, { meta: true })); // PuTTY

// Up
sequenceTree.registerKey(modifiers => `\x1b[1;${modifiers}A`, `up`);
sequenceTree.register(`\x1bOA`, new Key(`up`));
sequenceTree.register(`\x1b[A`, new Key(`up`));
sequenceTree.register(`\x1b\x1b[A`, new Key(`up`, { meta: true })); // PuTTY

// Down
sequenceTree.registerKey(modifiers => `\x1b[1;${modifiers}B`, `down`);
sequenceTree.register(`\x1bOB`, new Key(`down`));
sequenceTree.register(`\x1b[B`, new Key(`down`));
sequenceTree.register(`\x1b\x1b[B`, new Key(`down`, { meta: true })); // PuTTY

// Ctrl+Letter
sequenceTree.register(`\x01`, new Key(`a`, { ctrl: true }));
sequenceTree.register(`\x02`, new Key(`b`, { ctrl: true }));
sequenceTree.register(`\x03`, new Key(`c`, { ctrl: true }));
sequenceTree.register(`\x04`, new Key(`d`, { ctrl: true }));
sequenceTree.register(`\x05`, new Key(`e`, { ctrl: true }));
sequenceTree.register(`\x06`, new Key(`f`, { ctrl: true }));
sequenceTree.register(`\x07`, new Key(`g`, { ctrl: true }));
sequenceTree.register(`\x08`, new Key(`h`, { ctrl: true }));
//sequenceTree.register(`\x09`, new Key(`i`, { ctrl: true })); // conflicts with <tab> (\t)
//sequenceTree.register(`\x0a`, new Key(`j`, { ctrl: true })); // conflicts with <enter> (\r)
sequenceTree.register(`\x0b`, new Key(`k`, { ctrl: true }));
sequenceTree.register(`\x0c`, new Key(`l`, { ctrl: true }));
//sequenceTree.register(`\x0d`, new Key(`m`, { ctrl: true })); // conflicts with <enter> (\n)
sequenceTree.register(`\x0e`, new Key(`n`, { ctrl: true }));
sequenceTree.register(`\x0f`, new Key(`o`, { ctrl: true }));
sequenceTree.register(`\x10`, new Key(`p`, { ctrl: true }));
sequenceTree.register(`\x11`, new Key(`q`, { ctrl: true }));
sequenceTree.register(`\x12`, new Key(`r`, { ctrl: true }));
sequenceTree.register(`\x13`, new Key(`s`, { ctrl: true }));
sequenceTree.register(`\x14`, new Key(`t`, { ctrl: true }));
sequenceTree.register(`\x15`, new Key(`u`, { ctrl: true }));
sequenceTree.register(`\x16`, new Key(`v`, { ctrl: true }));
sequenceTree.register(`\x17`, new Key(`w`, { ctrl: true }));
sequenceTree.register(`\x18`, new Key(`x`, { ctrl: true }));
sequenceTree.register(`\x19`, new Key(`y`, { ctrl: true }));
sequenceTree.register(`\x1a`, new Key(`z`, { ctrl: true }));

// Mouse

let parseMouseSequence = sequence => {
    let [ all, x, y ] = String.fromCharCode(... sequence).match(/^\x1b\[<[0-9]+;([0-9]+);([0-9]+)[Mm]$/);
    return { x: Number(x) - 1, y: Number(y) - 1 };
};

sequenceTree.mount(`\x1b[<0;`, makeNumberNode(tail => tail.mount(`;`, makeNumberNode(tail => {
    tail.register(`M`, sequence => new Mouse(`left`, Object.assign(parseMouseSequence(sequence), { start: true })));
    tail.register(`m`, sequence => new Mouse(`left`, Object.assign(parseMouseSequence(sequence), { end: true })));
}))));

sequenceTree.mount(`\x1b[<1;`, makeNumberNode(tail => tail.mount(`;`, makeNumberNode(tail => {
    tail.register(`M`, sequence => new Mouse(`middle`, Object.assign(parseMouseSequence(sequence), { start: true })));
    tail.register(`m`, sequence => new Mouse(`middle`, Object.assign(parseMouseSequence(sequence), { end: true })));
}))));

sequenceTree.mount(`\x1b[<2;`, makeNumberNode(tail => tail.mount(`;`, makeNumberNode(tail => {
    tail.register(`M`, sequence => new Mouse(`right`, Object.assign(parseMouseSequence(sequence), { start: true })));
    tail.register(`m`, sequence => new Mouse(`right`, Object.assign(parseMouseSequence(sequence), { end: true })));
}))));

sequenceTree.mount(`\x1b[<32;`, makeNumberNode(tail => tail.mount(`;`, makeNumberNode(tail => {
    tail.register(`M`, sequence => new Mouse(`left`, Object.assign(parseMouseSequence(sequence))));
    tail.register(`m`, sequence => new Mouse(`left`, Object.assign(parseMouseSequence(sequence))));
}))));

sequenceTree.mount(`\x1b[<33;`, makeNumberNode(tail => tail.mount(`;`, makeNumberNode(tail => {
    tail.register(`M`, sequence => new Mouse(`middle`, Object.assign(parseMouseSequence(sequence))));
    tail.register(`m`, sequence => new Mouse(`middle`, Object.assign(parseMouseSequence(sequence))));
}))));

sequenceTree.mount(`\x1b[<34;`, makeNumberNode(tail => tail.mount(`;`, makeNumberNode(tail => {
    tail.register(`M`, sequence => new Mouse(`right`, Object.assign(parseMouseSequence(sequence))));
    tail.register(`m`, sequence => new Mouse(`right`, Object.assign(parseMouseSequence(sequence))));
}))));

sequenceTree.mount(`\x1b[<64;`, makeNumberNode(tail => tail.mount(`;`, makeNumberNode(tail => {
    tail.register(`M`, sequence => new Mouse(`wheel`, Object.assign(parseMouseSequence(sequence), { start: true, end: true, d: -1 })));
    tail.register(`m`, sequence => new Mouse(`wheel`, Object.assign(parseMouseSequence(sequence), { start: true, end: true, d: -1 })));
}))));

sequenceTree.mount(`\x1b[<65;`, makeNumberNode(tail => tail.mount(`;`, makeNumberNode(tail => {
    tail.register(`M`, sequence => new Mouse(`wheel`, Object.assign(parseMouseSequence(sequence), { start: true, end: true, d: +1 })));
    tail.register(`m`, sequence => new Mouse(`wheel`, Object.assign(parseMouseSequence(sequence), { start: true, end: true, d: +1 })));
}))));
