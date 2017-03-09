# [![Term-Strings](/logo.png?raw=true)](https://github.com/manaflair/term-strings)

> Terminal sequences for your terminal, from Node or your CLI

[![](https://img.shields.io/npm/v/@manaflair/term-strings.svg)]() [![](https://img.shields.io/npm/l/@manaflair/term-strings.svg)]()

[Check out our other OSS projects!](https://manaflair.github.io)

## Installation

```
$> npm install --save @manaflair/term-strings
```

## Usage (Terminal)

```
$> term-strings style.color.front.rebeccapurple.in
```

The `--raw` option (also available as `-r`) directly print the raw strings that follow without transformation.

```
$> term-strings --raw Hello world!
```

You can use it multiple times, interlaced with regular sequence names:

```
$> term-strings
..
..   style.color.front.red.in
..     -r "Red Text"
..   style.color.front.out
..
..   -r " and "
..
..   style.color.front.green.in
..     -r "Green Text"
..   style.color.front.out
```

Finally, note that hexadecimal colors can also be printed:

```
$> term-strings style.color.front.#FF0000
```

## Usage (Node.js)

```js
import { style } from '@manaflair/term-strings';

let prefix = style.emboldened.in + style.color.front.rebeccapurple.in;
let suffix = style.emboldened.out + style.color.front.out;

console.log(`${prefix}Hello!${suffix}`);
```

## Color support

Term-Strings fully supports the truecolors mode (aka 16,777,216-colors mode), up to the point where they're actually used internally all along, until we actually print them to the screen, at which point they'll be gracefully degraded to 256-colors, then 16-colors, then finally monochrome, according to your terminal configuration (there's a small catch, check below).

```js
import { style } from '@manaflair/term-strings';

let prefix = style.emboldened.in + style.color.front(`#663399`).in;
let suffix = style.emboldened.out + style.color.front.out;

console.log(`${prefix}Hello!${suffix}`);
```

Note that if you choose to use user-defined colors, it is strongly advised you cache the result of the `style.color.front()` and `style.color.back()` functions, as calling them multiple times in a single render might become quite expensive (to the point where it can become the major bottleneck of your application). In order to somewhat alleviate this issue, Term-Strings automatically builds a cache entry for each named color in the CSS standard, and make them available as style properties (for example `style.color.front.purple`). Since these properties are precomputed, using them has no impact on performances, which makes them suitable to be used everywhere in your application.

### Feature detection

Despite being natively supported, the truecolors feature detection isn't currently possible without a bit of help (this information cannot be extracted from the terminfo database at the moment, and their maintainers apparently have little interest in supporting it). In order to enable truecolors, you'll need to export a `COLORTERM` environment variable as such:

```
$> export COLORTERM=truecolors
```

Note that this variable is also used by a few other applications, so you might benefit using it even without considering Term-Strings.

## Parsing terminal sequences

From time to time, and especially when working while in raw mode (`process.stdin.setRawMode(true)`), your terminal might send you cryptic sequences to indicate that a particular key or mouse event occured. Efficiently parsing them yourself might be quite tricky, so Term-Strings ships with a dedicated parser to help you in this task:

```js
import { Key, Mouse, parseTerminalInputs } from '@manaflair/term-strings/parse';

parseTerminalInputs(process.stdin).subscribe(input => {
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
