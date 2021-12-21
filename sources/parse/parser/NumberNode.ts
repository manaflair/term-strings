import {Node} from './Node';

export class NumberNode<TIn extends number, TSeq, TOut> extends Node<TIn, TSeq, TOut> {
  static isDigit(input: unknown) {
    return typeof input === `number` && input >= 48 && input <= 57;
  }

  hasChildren() {
    return true;
  }

  has(input: TIn) {
    if (NumberNode.isDigit(input))
      return true;

    return super.has(input);
  }

  get(input: TIn): Array<Node<TIn, TSeq, TOut>> | undefined {
    if (!NumberNode.isDigit(input))
      return super.get(input);

    const parent = super.get(input);

    if (typeof parent !== `undefined`) {
      return parent.concat([this]);
    } else {
      return [this];
    }
  }
}
