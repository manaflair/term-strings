import {Cursor} from '../types/Cursor';
import {Data}   from '../types/Data';
import {Info}   from '../types/Info';
import {Key}    from '../types/Key';
import {Mouse}  from '../types/Mouse';

import {Node, NodeConstructor} from './Node';

const EndSym = Symbol();

export type End = typeof EndSym;

export type Sequence = Array<string | number | Function>;
export type Production = Cursor | Key | Mouse | Info | Data;
export type Callback = (chars: Array<number>) => Production;

export class Parser {
  static End = EndSym;

  static isValidFilter(filter: string | number) {
    if (typeof filter === `string` && filter.length > 0)
      return true;

    if (typeof filter === `number`)
      return true;

    return false;
  }

  private ended = false;

  private root = new Node<number | End, number, Production>(input => ({
    type: `data`,
    buffer: new Uint8Array(input as Array<number>),
  }));

  private candidates: Array<Node<number | End, number, Production>> = [];
  private current = [this.root];

  private confirmedInput: Array<number> = [];
  private unconfirmedInput: Array<number> = [];

  private bufferedInput: Array<number> = [];

  constructor(private callback: (data: Production) => void) {
    this.candidates = [];
    this.current = [this.root];

    this.confirmedInput = [];
    this.unconfirmedInput = [];

    this.bufferedInput = [];

    this.callback = callback;
  }

  register(...args: [... Sequence, Callback]) {
    const activator = args.pop() as Callback;

    let current = this.root;
    for (let t = 0; t < args.length; ++t) {
      let filter = args[t];
      if (typeof filter === `function`)
        throw new Error(`Invalid filter`);

      if (typeof filter === `string`) {
        for (let u = 0; u < filter.length - 1; ++u)
          current = current.mount(filter.charCodeAt(u));

        filter = filter.charCodeAt(filter.length - 1);
      }

      const nextArgs = args[t + 1];
      if (typeof nextArgs !== `function`) {
        current = current.mount(filter);
      } else {
        current = current.mount(filter, nextArgs as NodeConstructor<number | End, number, Production>);
        t += 1;
      }
    }

    if (current.isActivable())
      throw new Error(`Failed to execute 'register': Target node is already activable.`);

    current.setActivator(activator);
    return this;
  }

  public feed(stream: Array<number> | Uint8Array) {
    return this.feedImpl(stream);
  }

  private feedImpl(stream: Uint8Array | (Array<number | End>)) {
    if (this.ended)
      throw new Error(`Failed to execute 'feed': Cannot feed a closed parser.`);

    const send = (production: Production) => {
      setImmediate(() => {
        this.callback(production);
      });
    };

    const sendBufferedInput = () => {
      const bufferedInput = this.bufferedInput;
      this.bufferedInput = [];

      send({
        type: `data`,
        buffer: new Uint8Array(bufferedInput),
      });
    };

    for (let t = 0; t < stream.length; ++t) {
      const input = stream[t];
      const isLast = t + 1 === stream.length;

      const nextCandidates = [];
      const nextCurrent = [];

      for (const node of this.current) {
        const nextList = node.get(input);

        if (typeof nextList !== `undefined`) {
          for (const next of nextList) {
            if (next.isActivable())
              nextCandidates.push(next);

            nextCurrent.push(next);
          }
        }
      }

      if (nextCandidates.length > 0) {
        this.candidates = nextCandidates;

        this.confirmedInput = [...this.confirmedInput, ...this.unconfirmedInput];
        this.unconfirmedInput = [];
      }

      if (input !== EndSym) {
        if (nextCandidates.length > 0) {
          this.confirmedInput.push(input);
        } else {
          this.unconfirmedInput.push(input);
        }
      }

      if (nextCurrent.length === 0 || nextCurrent.filter(node => node.hasChildren()).length === 0 || (isLast && this.unconfirmedInput.length === 0)) {
        if (this.candidates.length === 0) {
          if (input !== EndSym)
            this.bufferedInput.push(input);
          else if (this.bufferedInput.length > 0)
            sendBufferedInput();

          this.current = [this.root];

          this.confirmedInput = [];
          this.unconfirmedInput = [];
        } else if (this.candidates.length === 1) {
          if (this.bufferedInput.length > 0)
            sendBufferedInput();

          const match = this.candidates[0];

          const confirmed = this.confirmedInput;
          const unconfirmed = this.unconfirmedInput;

          send(match.activate(confirmed));

          this.candidates = [];
          this.current = [this.root];

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
    this.feedImpl([EndSym]);

    this.candidates = [];
    this.current = [this.root];

    this.confirmedInput = [];
    this.unconfirmedInput = [];
  }
}
