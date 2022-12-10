export class Key {
  public type = `key` as const;

  public name: string;

  public alt: boolean;
  public ctrl: boolean;
  public meta: boolean;
  public shift: boolean;

  constructor(name: string, {alt = false, ctrl = false, meta = false, shift = false}: {alt?: boolean, ctrl?: boolean, meta?: boolean, shift?: boolean} = {}) {
    this.name = name;

    this.alt = alt;
    this.ctrl = ctrl;
    this.meta = meta;
    this.shift = shift;
  }

  inspect() {
    let name = this.name;

    if (this.alt)
      name += `+alt`;

    if (this.ctrl)
      name += `+ctrl`;

    if (this.meta)
      name += `+meta`;

    if (this.shift)
      name += `+shift`;

    return `<Key ${name}>`;
  }
}
