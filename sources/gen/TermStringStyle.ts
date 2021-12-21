import {style} from '../core';

type Style = {
  in: string;
  out: string;
};

export class StyleBag {
  back: Style | null = null;
  front: Style | null = null;

  emboldened: Style | null = null;
  fainted: Style | null = null;
  hidden: Style | null = null;
  inversed: Style | null = null;
  italic: Style | null = null;
  standout: Style | null = null;
  strikethrough: Style | null = null;
  strong: Style | null = null;
  underlined: Style | null = null;
}

type StyleBagKey = keyof StyleBag;
const StyleBagKeys = Object.keys(new StyleBag()) as Array<StyleBagKey>;

export class TermStringStyle extends StyleBag {
  static empty = new TermStringStyle();

  constructor(prop: Partial<StyleBag> = {}) {
    super();

    this.back = prop.back ?? null;
    this.front = prop.front ?? null;

    this.emboldened = prop.emboldened ?? null;
    this.fainted = prop.fainted ?? null;
    this.hidden = prop.hidden ?? null;
    this.inversed = prop.inversed ?? null;
    this.italic = prop.italic ?? null;
    this.standout = prop.standout ?? null;
    this.strikethrough = prop.strikethrough ?? null;
    this.strong = prop.strong ?? null;
    this.underlined = prop.underlined ?? null;
  }

  clearSequence() {
    return StyleBagKeys.some(key => this[key]) ? style.clear : ``;
  }

  diff(props: Partial<StyleBag>) {
    const diff: Array<StyleBagKey> = [];

    for (const key of StyleBagKeys) {
      const value = props[key];

      if (typeof value === `undefined` || value === this[key])
        continue;

      diff.push(key);
    }

    return diff;
  }

  merge(props: Partial<StyleBag>) {
    const diff = this.diff(props);
    if (diff.length === 0)
      return this;

    const copy = new TermStringStyle(this);

    for (const prop of diff)
      copy[prop] = props[prop]!;

    return copy;
  }
}
