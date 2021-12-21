import {StyleBag, TermStringStyle} from './TermStringStyle';
import {TermString}                from './TermString';

export type TermStringSection = {
  text: string;
  style: TermStringStyle;
};

export class TermStringBuilder {
  private sections: Array<TermStringSection> = [{
    style: TermStringStyle.empty,
    text: ``,
  }];

  private length = 0;

  getLastSection() {
    return this.sections[this.sections.length - 1];
  }

  pushStyle(props: Partial<StyleBag>) {
    const currentStyle = this.getLastSection().style;
    const nextStyle = currentStyle.merge(props);

    if (nextStyle === currentStyle)
      return this;

    if (this.getLastSection().text.length === 0)
      this.getLastSection().style = nextStyle;
    else
      this.sections.push({style: nextStyle, text: ``});

    return this;
  }

  pushText(text: TermString | string) {
    if (text.length === 0)
      return this;

    if (text instanceof TermString) {
      for (const section of text.sections) {
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
