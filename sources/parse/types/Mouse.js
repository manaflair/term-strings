export class Mouse {

    constructor(name, { x = 0, y = 0, d = 0, start = false, end = false, alt = false, ctrl = false } = {}) {

        this.name = name;

        this.x = x;
        this.y = y;
        this.d = d;

        this.start = start;
        this.end = end;

        this.alt = alt;
        this.ctrl = ctrl;

    }

    inspect() {

        let name = this.name;

        if (this.alt)
            name += `+alt`;

        if (this.ctrl)
            name += `+ctrl`;

        return `<Mouse ${name} @${this.x};${this.y}(${this.d >= 0 ? `+` : `-`}${Math.abs(this.d)}) start=${this.start} end=${this.end}>`;

    }

}
