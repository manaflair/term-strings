# [![Term-Strings](/logo.png?raw=true)](https://github.com/manaflair/term-strings)

> Easily manipulate your terminal, from your CLI or from Node

[![](https://img.shields.io/npm/v/@manaflair/term-strings.svg)]() [![](https://img.shields.io/npm/l/@manaflair/term-strings.svg)]()

[Check out our other OSS projects!](https://manaflair.github.io)

## Installation

```
$> npm install --save @manaflair/term-strings
```

## Usage (Terminal)

```
$> term-strings --in front.red
```

The `--in` option (also available as `-i`) is implied, so you can also write:

```
$> term-strings front.rebeccapurple
```

The `--out` option (also available as `-o`) outputs the sequence required to reset the requested style.

```
$> term-strings --out front
```

The `--raw` option (also available as `-r`) prints the raw strings that follow.

```
$> term-strings --raw Hello world!
```

You can use these options multiple times, in any order:

```
$> term-strings
..   -i front.red
..     -r "Red Text"
..   -o front
..   -r " and "
..   -i front.green
..     -r "Green Text"
..   -o front
```

Finally, note that hexadecimal colors can also be printed:

```
$> term-strings front.#ff0000
```

## Usage (Node.js)

```js
import { style } from '@manaflair/term-strings';

let prefix = style.bold + style.front.rebeccapurple;
let suffix = style.bold.out + style.front.out;

console.log(`${prefix}Hello!${suffix}`);
```

Term-Strings also support truecolors if available (if not, colors will be gracefully degraded to match either 256 colors or 4-bits colors, depending on your terminal capabilities):

```js
import { style } from '@manaflair/term-strings';

let prefix = style.front(`#123456`);
let suffix = style.front.out;
```

It is advised to cache the result of the `front` and `back` functions, as calling them multiple times in a single render might become quite expensive.

## Detecting truecolors

Truecolor detection isn't currently possible without a bit of help. Thank terminfo for [refusing to implement this in their databases, and generally being a dick about it](https://lists.gnu.org/archive/html/bug-ncurses/2016-08/msg00036.html) (they have been notified since 2013).

In order to enable truecolors, you'll need to export a `TERM_FEATURES` environment variable:

```
$> export TERM_FEATURES="true-colors:$TERM_FEATURES"
```

Note that you can also use this variable to enable the 256 colors mode (`256-colors`) or even the basic colors mode (`basic-colors`), should Term-Strings fail to recognize them.

## License (MIT)

> **Copyright © 2016 Manaflair**
>
> Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
>
> The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
>
> THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
