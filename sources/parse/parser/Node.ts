export interface NodeConstructor<TIn, TSeq, TOut> {
  new(): Node<TIn, TSeq, TOut>;
}

export class Node<TIn, TSeq, TOut> {
  private children = new Map<TIn, Array<Node<TIn, TSeq, TOut>>>();

  constructor(private activator: ((input: Array<TSeq>) => TOut) | null = null) {
  }

  isActivable() {
    return this.activator !== null;
  }

  setActivator(activator: ((input: Array<TSeq>) => TOut) | null) {
    this.activator = activator;
  }

  activate(input: Array<TSeq>) {
    if (!this.activator)
      throw new Error(`Cannot activate a non-activable node`);

    return this.activator(input);
  }

  mount(input: TIn, constructor: NodeConstructor<TIn, TSeq, TOut> = Node): Node<TIn, TSeq, TOut> {
    let sub = this.children.get(input);
    if (typeof sub === `undefined`)
      this.children.set(input, sub = []);

    let node: Node<TIn, TSeq, TOut> | undefined =
        sub.find(node => node.constructor === constructor);
    if (typeof node === `undefined`)
      sub.push(node = new constructor());

    return node;
  }

  hasChildren() {
    return this.children.size > 0;
  }

  has(input: TIn) {
    return this.children.has(input);
  }

  get(input: TIn) {
    return this.children.get(input);
  }
}
