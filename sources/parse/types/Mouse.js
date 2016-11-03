export class Mouse {

    constructor(name, { x = 0, y = 0, d = 0, start = false, end = false } = {}) {

        this.name = name;

        this.x = x;
        this.y = y;
        this.d = d;

        this.start = start;
        this.end = end;

    }

    inspect() {

        return `<Mouse ${this.name} @${this.x};${this.y}(${this.d >= 0 ? `+` : `-`}${Math.abs(this.d)}) start=${this.start} end=${this.end}>`;

    }

}
