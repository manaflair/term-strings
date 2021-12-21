import {TermStringBuilder, TermStringSection} from './TermStringBuilder';
import {TermStringStyle}                      from './TermStringStyle';

export class TermString {
  static from(text: TermString | string) {
    if (text instanceof TermString)
      return text;

    return new TermString([{
      style: TermStringStyle.empty,
      text,
    }], text.length);
  }

  constructor(public sections: Array<TermStringSection>, public length: number) {
  }

  slice(offsetStart: number, offsetEnd = this.length) {
    if (offsetStart < offsetEnd) {
      return this.substr(offsetStart, offsetEnd - offsetStart);
    } else {
      return ``;
    }
  }

  substring(offsetStart: number, offsetEnd = this.length) {
    if (offsetStart < offsetEnd) {
      return this.substr(offsetStart, offsetEnd - offsetStart);
    } else {
      return this.substr(offsetEnd, offsetStart - offsetEnd);
    }
  }

  substr(offset: number, length = this.length - offset) {
    // Negative offsets support
    if (offset < 0)
      offset = this.length + offset;

    // Cut the offset and length parameters to be valid inside this string
    offset = Math.max(0, Math.min(offset, this.length + offset));
    length = Math.max(0, Math.min(length, this.length - offset));

    // Early abort if we're not slicing anything
    if (offset >= this.length || length === 0)
      return ``;

    // Create a new string builder
    const result = new TermStringBuilder();

    // Iterate over the following sections
    for (let t = 0; t < this.sections.length && length > 0; ++t) {
      // Skip the sections until we are in the right range
      if (this.sections[t].text.length <= offset) {
        offset -= this.sections[t].text.length;
        continue;
      }

      // Push the style of the section
      result.pushStyle(this.sections[t].style);

      // And push a slice of the text (we will only need part of the first section)
      const newToken = this.sections[t].text.substr(offset, length);
      result.pushText(newToken);

      // Updates the slice boundaries
      length -= newToken.length;
      offset = 0;
    }

    return result.build();
  }

  repeat(count: number) {
    if (count < 0)
      return ``;

    if (count === 1)
      return this;

    const result = new TermStringBuilder();

    for (let t = 0; t < count; ++t)
      result.pushText(this);

    return result.build();
  }

  padStart(targetLength: number, padString: string | TermString = ` `) {
    if (targetLength <= this.length)
      return this;

    const missingLength = targetLength - this.length;

    const padCount = Math.ceil(missingLength / padString.length);
    const pad = padString.repeat(padCount).substr(0, missingLength);

    const result = new TermStringBuilder();

    result.pushText(pad);
    result.pushText(this);

    return result.build();
  }

  padEnd(targetLength: number, padString: string | TermString = ` `) {
    if (targetLength <= this.length)
      return this;

    const missingLength = targetLength - this.length;

    const padCount = Math.ceil(missingLength / padString.length);
    const pad = padString.repeat(padCount).substr(0, missingLength);

    const result = new TermStringBuilder();

    result.pushText(this);
    result.pushText(pad);

    return result.build();
  }

  toString() {
    let string = ``;

    let currentStyle = new TermStringStyle();

    for (const section of this.sections) {
      // Only the final section can have an empty length; we skip it, because we will use a clear sequence instead
      if (section.text.length === 0)
        continue;

      // Otherwise, we iterate on each property that change in order to print the "out" sequence of those who have be deactivated, and the "in" sequence of those who have been added or changed
      const diff = currentStyle.diff(section.style);
      for (const prop of diff) {
        const currentStyleSetting = currentStyle[prop];
        const newStyleSetting = section.style[prop];

        if (newStyleSetting) {
          string += newStyleSetting.in;
        } else {
          string += currentStyleSetting!.out;
        }
      }

      // We can now bake the text inside the returned string
      string += section.text;

      // And finally we switch the current style map
      currentStyle = section.style;
    }

    return string + currentStyle.clearSequence();
  }
}
