import { closest as closestColor } from 'color-diff';

import { palette16, palette256 }   from './colorPalettes';
import { doesSupportBasicColors }  from './support';
import { doesSupport256Colors }    from './support';
import { doesSupportTrueColors }   from './support';

export let COLOR_FG = 0;
export let COLOR_BG = 10;

function fixHex(hex) {

    return (`0`.repeat(6 - hex.length) + hex).substr(0, 6);

}

function hexToDec(hex) {

    let color = parseInt(fixHex(String(hex)
        .replace(/^#|0x/, ``)
        .replace(/[^0-9a-f]/ig, ``)), 16);

    let r = (color & 0xFF0000) >>> 16;
    let g = (color & 0x00FF00) >>>  8;
    let b = (color & 0x0000FF) >>>  0;

    return { R: r, G: g, B: b };

}

let hydratedPalette16 = palette16.map(hex => hexToDec(hex));
let hydratedPalette256 = palette256.map(hex => hexToDec(hex));

function getClosestColor(hex, target) {

    return target.indexOf(closestColor(hexToDec(hex), target));

}

export function getColor(hex, target) {

    if (doesSupportTrueColors) {
        let { R: r, G: g, B: b } = hexToDec(hex);
        return `\x1b[${38 + target};2;${r};${g};${b}m`;
    }

    if (doesSupport256Colors) {
        let index = getClosestColor(hex, hydratedPalette256);
        return `\x1b[${38 + target};5;${index}m`;
    }

    if (doesSupportBasicColors) {
        let index = getClosestColor(hex, hydratedPalette16);
        return `\x1b[${(index < 8 ? 30 : 90) + target + index}m`;
    }

    return ``;

}

export function getColorReset(target) {

    if (doesSupportTrueColors || doesSupport256Colors || doesSupportBasicColors)
        return `\x1b[${39 + target}m`;

    return ``;

}
