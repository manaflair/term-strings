import { TermString } from './TermString';

export class TermStringBuilder {

    constructor() {

        this.sections = [ new Set() ];

        this.length = 0;

    }

    enter(attribute) {

        if (!attribute)
            return this;

        if (this.sections.length % 3 === 2)
            this.sections.push(new Set());

        if (this.sections.length % 3 === 0)
            this.sections.push(new Set());

        this.sections[this.sections.length - 1].add(attribute);

        return this;

    }

    append(text) {

        if (!text)
            return this;

        if (text instanceof TermString)
            return this.inject(text);

        if (this.sections.length % 3 === 0)
            this.sections.push(new Set());

        if (this.sections.length % 3 === 1)
            this.sections.push(``);

        this.sections[this.sections.length - 1] += text;
        this.length += text.length;

        return this;

    }

    leave(attribute) {

        if (!attribute)
            return this;

        if (this.sections.length % 3 === 1)
            this.sections.push(``);

        if (this.sections.length % 3 === 2)
            this.sections.push(new Set());

        this.sections[this.sections.length - 1].add(attribute);

        return this;

    }

    inject(string) {

        if (!string)
            return this;

        for (let sectionIndex = 0; sectionIndex < string.sections.length; ++sectionIndex) {

            switch (sectionIndex % 3) {

                case 0: {

                    for (let attribute of string.sections[sectionIndex]) {
                        this.enter(attribute);
                    }

                } break;

                case 1: {

                    this.append(string.sections[sectionIndex]);

                } break;

                case 2: {

                    for (let attribute of string.sections[sectionIndex]) {
                        this.leave(attribute);
                    }

                } break;

            }

        }

        return this;

    }

    build() {

        if (this.length === 0)
            return ``;

        if (this.sections.length === 2 && this.sections[0].size === 0)
            return this.sections[1];

        let significantSections = Math.floor((this.sections.length - 2) / 3) * 3 + 2;

        let sections = this.sections.slice(0, significantSections);
        let length = this.length;

        return new TermString(sections, length);

    }

}
