import { Node } from './Node';

export class NumberNode extends Node {

    static isDigit(input) {

        return input >= 48 && input <= 57;

    }

    hasChildren() {

        return true;

    }

    has(input) {

        if (NumberNode.isDigit(input))
            return true;

        return super.has(input);

    }

    get(input) {

        if (!NumberNode.isDigit(input))
            return super.get(input);

        let parent = super.get(input);

        if (typeof parent !== `undefined`) {
            return parent.concat([ this ]);
        } else {
            return [ this ];
        }

    }

}
