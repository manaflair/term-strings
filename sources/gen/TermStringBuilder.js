import { TermStringStyle } from './TermStringStyle';
import { TermString }      from './TermString';

export class TermStringBuilder {

    constructor() {

        this.sections = [ { style: TermStringStyle.empty , text: `` } ];
        this.length = 0;

    }

    getLastSection() {

        return this.sections[this.sections.length - 1];

    }

    pushStyle(props) {

        let currentStyle = this.getLastSection().style;
        let nextStyle = currentStyle.merge(props);

        if (nextStyle === currentStyle)
            return this;

        if (this.getLastSection().text.length === 0)
            this.getLastSection().style = nextStyle;
        else
            this.sections.push({ style: nextStyle, text: `` });

        return this;

    }

    pushText(text) {

        if (text.length === 0)
            return this;

        if (text instanceof TermString) {

            for (let section of text.sections) {
                this.pushStyle(section.style);
                this.pushText(section.text);
            }

        } else {

            if (typeof text !== `string`)
                text = String(text);

            this.getLastSection().text += text;
            this.length += text.length;

        }

        return this;

    }

    build() {

        // We special-case to directly return strings that do not use any property

        if (this.sections.length > 1 || this.sections[0].style !== TermStringStyle.empty) {
            return new TermString(this.sections, this.length);
        } else {
            return this.sections[0].text;
        }

    }

}
