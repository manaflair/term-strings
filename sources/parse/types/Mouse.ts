export class Mouse {
  public type = `mouse` as const;

  public name: string | null;
  public sequence: string;

  public x: number;
  public y: number;
  public d: number;

  public start: boolean;
  public end: boolean;

  public alt: boolean;
  public ctrl: boolean;

  constructor(name: string | null, sequence: string, {
    x = 0,
    y = 0,
    d = 0,

    start = false,
    end = false,

    alt = false,
    ctrl = false,
  }: {
    x?: number;
    y?: number;
    d?: number;

    start?: boolean;
    end?: boolean;

    alt?: boolean;
    ctrl?: boolean;
  }) {
    this.name = name;
    this.sequence = sequence;

    this.x = x;
    this.y = y;
    this.d = d;

    this.start = start;
    this.end = end;

    this.alt = alt;
    this.ctrl = ctrl;
  }

  inspect() {
    let name = this.name;

    if (this.alt)
      name += `+alt`;

    if (this.ctrl)
      name += `+ctrl`;

    return `<Mouse ${name} @${this.x};${this.y}(${this.d >= 0 ? `+` : `-`}${Math.abs(this.d)}) start=${this.start} end=${this.end}>`;
  }
}
