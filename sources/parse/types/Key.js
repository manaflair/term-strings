export class Key {

    constructor(name, { alt = false, ctrl = false, meta = false, shift = false } = {}) {

        this.name = name;

        this.alt = alt;
        this.ctrl = ctrl;
        this.meta = meta;
        this.shift = shift;

    }

    inspect() {

        let name = this.name;

        if (this.alt)
            name += `+alt`;

        if (this.ctrl)
            name += `+ctrl`;

        if (this.meta)
            name += `+meta`;

        if (this.shift)
            name += `+shift`;

        return `<Key ${name}>`;

    }

}
