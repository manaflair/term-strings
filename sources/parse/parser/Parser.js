import { Node } from './Node';

export class Parser {

    static End = {};

    static isValidFilter(filter) {

        if (typeof filter === `string` && filter.length > 0)
            return true;

        if (typeof filter === `number`)
            return true;

        return false;

    }

    constructor(callback) {

        this.root = new Node(input => new Buffer(input));

        this.candidates = [];
        this.current = [ this.root ];

        this.confirmedInput = [];
        this.unconfirmedInput = [];

        this.bufferedInput = [];

        this.callback = callback;

    }

    register(... args) {

        if (args.length < 2)
            throw new Error(`Failed to execute 'register': Not enough parameters.`);

        let activator = args.pop();

        for (let t = 0; t < args.length; ++t) if (!Parser.isValidFilter(args[t]) && (typeof args[t] !== `function` || t === 0 || !Parser.isValidFilter(args[t - 1])))
            throw new Error(`Failed to execute 'register': Parameter ${t} is not a valid input filter.`);

        if (typeof activator !== `function`)
            throw new Error(`Failed to execute 'register': Parameter ${args.length + 1} is not a function.`);

        let current = this.root;

        for (let t = 0; t < args.length; ++t) {

            let filter = args[t];

            if (typeof filter === `string`) {

                for (let u = 0; u < filter.length - 1; ++u)
                    current = current.mount(filter.charCodeAt(u));

                filter = filter.charCodeAt(filter.length - 1);

            }

            if (typeof args[t + 1] === `function`) {
                current = current.mount(filter, args[++t]);
            } else {
                current = current.mount(filter);
            }

        }

        if (current.isActivable())
            throw new Error(`Failed to execute 'register': Target node is already activable.`);
        else
            current.setActivator(activator);

        return this;

    }

    feed(stream) {

        if (this.ended)
            throw new Error(`Failed to execute 'feed': Cannot feed a closed parser.`);

        let send = (instance) => {

            setImmediate(() => {
                this.callback(instance);
            });

        };

        let sendBufferedInput = () => {

            send(new Buffer(this.bufferedInput));

            this.bufferedInput = [];

        };

        for (let input of stream) {

            if (typeof input === `string`)
                input = input.charCodeAt(0);

            let nextCandidates = [];
            let nextCurrent = [];

            for (let node of this.current) {

                let nextList = node.get(input);

                if (typeof nextList !== `undefined`) {

                    for (let next of nextList) {

                        if (next.isActivable())
                            nextCandidates.push(next);

                        nextCurrent.push(next);

                    }

                }

            }

            if (nextCandidates.length > 0) {

                this.candidates = nextCandidates;

                this.confirmedInput = [ ... this.confirmedInput, ... this.unconfirmedInput ];
                this.unconfirmedInput = [];

                if (input !== Parser.End) {
                    this.confirmedInput.push(input);
                }

            } else {

                this.unconfirmedInput.push(input);

            }

            if (nextCurrent.length === 0 || nextCurrent.filter(node => node.hasChildren()).length === 0) {

                if (this.candidates.length === 0) {

                    if (input !== Parser.End)
                        this.bufferedInput.push(input);
                    else if (this.bufferedInput.length > 0)
                        sendBufferedInput();

                    this.current = [ this.root ];

                    this.confirmedInput = [];
                    this.unconfirmedInput = [];

                } else if (this.candidates.length === 1) {

                    if (this.bufferedInput.length > 0)
                        sendBufferedInput();

                    let match = this.candidates[0];

                    let confirmed = this.confirmedInput;
                    let unconfirmed = this.unconfirmedInput;

                    send(match.activate(confirmed));

                    this.candidates = [];
                    this.current = [ this.root ];

                    this.confirmedInput = [];
                    this.unconfirmedInput = [];

                    this.feed(unconfirmed);

                } else {

                    throw new Error(`Assertion failed while executing 'feed': Ambiguous grammar for '${this.confirmedInput}'.`);

                }

            } else {

                this.current = nextCurrent;

            }

        }

        if (this.bufferedInput.length > 0)
            sendBufferedInput();

        return this;

    }

    end() {

        this.feed([ Parser.End ]);

        this.candidates = [];
        this.current = [ this.root ];

        this.confirmedInput = [];
        this.unconfirmedInput = [];

    }

}
