export class Key {

    constructor(name, { shift = false, alt = false, ctrl = false, meta = false } = {}) {

        this.name = name;

        this.shift = shift;
        this.alt = alt;
        this.ctrl = ctrl;
        this.meta = meta;

    }

    inspect() {

        let name = this.name;

        if (this.shift)
            name += `+shift`;

        if (this.alt)
            name += `+alt`;

        if (this.ctrl)
            name += `+ctrl`;

        if (this.meta)
            name += `+meta`;

        return `<Key ${name}>`;

    }

}
