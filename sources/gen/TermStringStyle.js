export class TermStringStyle {

    static empty = new TermStringStyle();

    constructor(prop = {}) {

        this.back = prop.back || null;
        this.front = prop.front || null;

        this.emboldened = prop.emboldened || null;
        this.fainted = prop.fainted || null;
        this.hidden = prop.hidden || null;
        this.inversed = prop.inversed || null;
        this.italic = prop.italic || null;
        this.standout = prop.standout || null;
        this.strikethrough = prop.strikethrough || null;
        this.strong = prop.strong || null;
        this.underlined = prop.underlined || null;

    }

    diff(props) {

        let diff = [];

        for (let [ prop, value ] of Object.entries(props)) {

            if (!Reflect.has(this, prop))
                continue;

            if (value === this[prop])
                continue;

            diff.push(prop);

        }

        return diff;

    }

    merge(props) {

        let diff = this.diff(props);

        if (diff.length === 0)
            return this;

        let copy = new TermStringStyle(this);

        for (let prop of diff)
            copy[prop] = props[prop];

        return copy;

    }

}
