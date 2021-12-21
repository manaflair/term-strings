import {closest as closestColor} from 'color-diff';

import {palette16, palette256}   from '../data/colorPalettes.json';
import {doesSupport16Colors}     from '../support';
import {doesSupport256Colors}    from '../support';
import {doesSupportTrueColors}   from '../support';

export enum Target {
  Foreground = 0,
  Background = 10,
}

// Needs to be R,G,B rather than r,g,b for
// compat with color-diff
type RGB = {
  R: number;
  G: number;
  B: number;
};

function fixHex(hex: string) {
  return (`0`.repeat(6 - hex.length) + hex).substr(0, 6);
}

function hexToDec(hex: string): RGB {
  const color = parseInt(fixHex(String(hex)
    .replace(/^#|0x/, ``)
    .replace(/[^0-9a-f]/ig, ``)), 16);

  const r = (color & 0xFF0000) >>> 16;
  const g = (color & 0x00FF00) >>>  8;
  const b = (color & 0x0000FF) >>>  0;

  return {R: r, G: g, B: b};
}

const hydratedPalette16 = palette16.map(hex => hexToDec(hex));
const hydratedPalette256 = palette256.map(hex => hexToDec(hex));

function getClosestColor(hex: string, target: Array<RGB>) {
  return target.indexOf(closestColor(hexToDec(hex), target));
}

export function getColorSequence(hex: string, target: Target) {
  if (doesSupportTrueColors) {
    const {R: r, G: g, B: b} = hexToDec(hex);
    return `\x1b[${38 + target};2;${r};${g};${b}m`;
  }

  if (doesSupport256Colors) {
    const index = getClosestColor(hex, hydratedPalette256);
    return `\x1b[${38 + target};5;${index}m`;
  }

  if (doesSupport16Colors) {
    const index = getClosestColor(hex, hydratedPalette16);
    return `\x1b[${(index < 8 ? 30 : 90 - 8) + target + index}m`;
  }

  return ``;
}

export function getColorReset(target: Target) {
  if (doesSupportTrueColors || doesSupport256Colors || doesSupport16Colors)
    return `\x1b[${39 + target}m`;

  return ``;
}

export function getColor(hex: string, target: Target) {
  return {in: getColorSequence(hex, target), out: getColorReset(target)};
}
