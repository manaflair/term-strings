# [![Term-Strings](/logo.png?raw=true)](https://github.com/manaflair/term-strings)

> Easily communicate with your terminal, straight from your CLI or from Node

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

## Color support

Term-Strings fully supports the truecolors mode (aka 16,777,216-colors mode), up to the point where they're actually used internally all along, until we actually print them to the screen, at which point they'll be gracefully degraded to 256-colors, then 16-colors, then finally monochrome, according to your terminal configuration (there's a small catch, check below).

```js
import { style } from '@manaflair/term-strings';

let prefix = style.bold + style.front(`#663399`);
let suffix = style.bold.out + style.front.out;

console.log(`${prefix}Hello!${suffix}`);
```

Note that it is strongly advised to cache the result of the `style.front()` and `style.back()` functions, as calling them multiple times in a single render might become quite expensive (to the point where it can become the major bottleneck of your application). In order to somewhat alleviate this issue, Term-Strings automatically builds a cache entry for each named color in the CSS standard, and make them available as style properties (for example `style.front.purple`). Since these properties are precomputed, using them has no impact on performances.

### Feature detection

Despite being natively supported, the truecolors feature detection isn't currently possible without a bit of help (this information cannot be extracted from the terminfo database at the moment, and their maintainers apparently have little interest in supporting it). In order to enable truecolors, you'll need to export a `TERM_FEATURES` environment variable as such:

```
$> export TERM_FEATURES="true-colors:$TERM_FEATURES"
```

(This environment variable can also be used to manually enable the 256-colors mode (`256-colors`) or even the 16-colors mode (`16-colors`), should Term-Strings fail to recognize any of them)

## Parsing terminal sequences

From time to time, and especially when working while in raw mode (`process.stdin.setRawMode(true)`), your terminal might send you cryptic sequences to indicate that a particular key or mouse event occured. Efficiently parsing them yourself might be quite tricky, so Term-Strings ships with a dedicated parser to help you in this task:

```js
import { Key, Mouse, parseTerminalInput } from '@manaflair/term-strings/parse';

parseTerminalInput(process.stdin).subscribe(input => {
    console.log(input); // A Node.js Buffer, or a Term-Strings Key or Mouse instance
});
```

## License (MIT)

> **Copyright © 2016 Manaflair**
>
> Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
>
> The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
>
> THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
