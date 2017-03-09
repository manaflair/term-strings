export class Node {

    constructor(activator = null) {

        this.children = new Map();
        this.activator = activator;

    }

    isActivable() {

        return this.activator !== null;

    }

    setActivator(activator) {

        this.activator = activator;

    }

    activate(input) {

        return this.activator(input);

    }

    mount(input, constructor = Node) {

        let sub = this.children.get(input);

        if (typeof sub === `undefined`)
            this.children.set(input, sub = []);

        let node = sub.find(node => node.constructor === constructor);

        if (typeof node === `undefined`)
            sub.push(node = new constructor());

        return node;

    }

    hasChildren() {

        return this.children.size > 0;

    }

    has(input) {

        return this.children.has(input);

    }

    get(input) {

        return this.children.get(input);

    }

}
