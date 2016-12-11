import { style }             from '../core';

import { TermStringBuilder } from './TermStringBuilder';

export class TermString {

    constructor(sections, length) {

        this.sections = sections;
        this.length = length;

    }

    slice(offsetStart, offsetEnd = this.length) {

        if (offsetStart < offsetEnd) {
            return this.substr(offsetStart, offsetEnd - offsetStart);
        } else {
            return ``;
        }

    }

    substring(offsetStart, offsetEnd = this.length) {

        if (offsetStart < offsetEnd) {
            return this.substr(offsetStart, offsetEnd - offsetStart);
        } else {
            return this.substr(offsetEnd, offsetStart - offsetEnd);
        }

    }

    substr(offset, length = this.length - offset) {

        // Negative offsets support

        if (offset < 0)
            offset = this.length + offset;

        // Cut the offset and length parameters to be valid inside this string

        offset = Math.max(0, Math.min(offset, this.length + offset));
        length = Math.max(0, Math.min(length, this.length - offset));

        // Early abort if we're not slicing anything

        if (offset >= this.length || length === 0)
            return ``;

        // Find the token from where we need to start slicing

        let firstIndex = 1;

        while (firstIndex < this.sections.length && offset >= this.sections[firstIndex].length) {
            offset -= this.sections[firstIndex].length;
            firstIndex += 3;
        }

        // Find all the active attributes from the beginning of the string to this token

        let attributes = new Set();

        for (let sectionIndex = 0; sectionIndex < firstIndex; sectionIndex += 1) {

            switch (sectionIndex % 3) {

                case 0: { // enter

                    for (let attribute of this.sections[sectionIndex]) {
                        attributes.add(attribute);
                    }

                } break;

                case 2: { // leave

                    for (let attribute of this.sections[sectionIndex]) {
                        attributes.delete(attribute);
                    }

                } break;

            }

        }

        // Create a new string builder, and add all those attributes into it

        let result = new TermStringBuilder();

        for (let attribute of attributes)
            result.enter(attribute);

        // Iterate over the following sections

        let sectionIndex = firstIndex;

        while (sectionIndex < this.sections.length && length > 0) {

            // Skip the "enter" field of the first section, since we've already processed it before

            if (sectionIndex !== firstIndex)
                for (let attribute of this.sections[sectionIndex - 1])
                    result.enter(attribute);

            // We need to use substr because we might need to start slicing from inside the token

            let newToken = this.sections[sectionIndex].substr(offset, length);
            result.append(newToken);

            offset = 0;
            length -= newToken.length;

            // Process the "leave" field

            if (sectionIndex + 1 < this.sections.length && length > 0)
                for (let attribute of this.sections[sectionIndex + 1])
                    result.leave(attribute);

            // Move to the next section

            sectionIndex += 3;

        }

        return result.build();

    }

    repeat(count) {

        if (count < 0)
            return ``;

        if (count === 1)
            return this;

        let result = new TermStringBuilder();

        for (let t = 0; t < count; ++t)
            result.append(this);

        return result.build();

    }

    padStart(targetLength, padString = ` `) {

        if (targetLength <= this.length)
            return this;

        let missingLength = targetLength - this.length;

        let padCount = Math.ceil(missingLength / padString.length);
        let pad = padString.repeat(padCount).substr(0, missingLength);

        let result = new TermStringBuilder();

        result.append(pad);
        result.append(this);

        return result.build();

    }

    padEnd(targetLength, padString = ` `) {

        if (targetLength <= this.length)
            return this;

        let missingLength = targetLength - this.length;

        let padCount = Math.ceil(missingLength / padString.length);
        let pad = padString.repeat(padCount).substr(0, missingLength);

        let result = new TermStringBuilder();

        result.append(this);
        result.append(pad);

        return result.build();

    }

    toString() {

        let string = ``;

        let activeAttributes = new Set();

        for (let t = 0; t < this.sections.length; ++t) {

            switch (t % 3) {

                case 0: { // enter

                    for (let attribute of this.sections[t]) {

                        if (activeAttributes.has(attribute))
                            continue;

                        activeAttributes.add(attribute);
                        string += attribute.in;

                    }

                } break;

                case 1: { // text

                    string += this.sections[t];

                } break;

                case 2: { // leave

                    for (let attribute of this.sections[t]) {

                        if (!activeAttributes.has(attribute))
                            continue;

                        activeAttributes.delete(attribute);
                        string += attribute.out;

                    }

                } break;

            }

        }

        if (activeAttributes.size > 0)
            string += style.clear;

        return string;

    }

}
