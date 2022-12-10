import {closest as closestColor} from 'color-diff';
import { cp } from 'fs';

import {colorNames}              from '../data/colorNames.compiled.json';
import {palette16, palette256}   from '../data/colorPalettes.compiled.json';
import {doesSupport16Colors}     from '../support';
import {doesSupport256Colors}    from '../support';
import {doesSupportTrueColors}   from '../support';

export type ColorName = keyof typeof colorNames;

export enum Target {
  Foreground = 0,
  Background = 10,
  Clear,
}

// Needs to be R,G,B rather than r,g,b for
// compat with color-diff
export type RGB = {
  R: number;
  G: number;
  B: number;
};

const hexRegExp = /^#([0-9a-f]{6})$/i;

export function hexToRgb(hex: string): RGB {
  const match = hex.match(hexRegExp);
  if (!match)
    throw new Error(`Invalid color`);

  const color = parseInt(match[1], 16);

  const r = (color & 0xFF0000) >>> 16;
  const g = (color & 0x00FF00) >>>  8;
  const b = (color & 0x0000FF) >>>  0;

  return {R: r, G: g, B: b};
}

function getClosestColor(color: RGB, target: Array<RGB>) {
  return target.indexOf(closestColor(color, target));
}

export function getClosestColor16(color: RGB) {
  return getClosestColor(color, palette16);
}

export function getClosestColor256(color: RGB) {
  return getClosestColor(color, palette256);
}

export function getTrueColorSequence(color: RGB, target: Target) {
  return `\x1b[${38 + target};2;${color.R};${color.G};${color.B}m`;
}

export function get256ColorsSequence(index: number, target: Target) {
  return `\x1b[${38 + target};5;${index}m`;
}

export function get16ColorsSequence(index: number, target: Target) {
  return `\x1b[${(index < 8 ? 30 : 90 - 8) + target + index}m`;
}

function memo<TArg, TRet>(fn: (arg: TArg) => TRet) {
  const cache = new Map<TArg, TRet>();

  return (arg: TArg) => {
    let entry = cache.get(arg);

    if (typeof entry === `undefined`)
      cache.set(arg, entry = fn(arg));

    return entry;
  };
}

export const hexToRgbMemo = memo(hexToRgb);
export const hexTo256ColorsMemo = memo((color: string) => getClosestColor256(hexToRgb(color)));
export const hexTo16ColorsMemo = memo((color: string) => getClosestColor256(hexToRgb(color)));

export const getHexColorSequence = doesSupportTrueColors
  ? (color: string, target: Target) => getTrueColorSequence(hexToRgbMemo(color), target)
  : doesSupport256Colors
    ? (color: string, target: Target) => get256ColorsSequence(hexTo256ColorsMemo(color), target)
    : doesSupport16Colors
      ? (color: string, target: Target) => get16ColorsSequence(hexTo16ColorsMemo(color), target)
      : () => ``;

export const getNamedColorSequence = doesSupportTrueColors
  ? (name: ColorName, target: Target) => getTrueColorSequence(colorNames[name].rgb, target)
  : doesSupport256Colors
    ? (name: ColorName, target: Target) => get256ColorsSequence(colorNames[name].c256, target)
    : doesSupport16Colors
      ? (name: ColorName, target: Target) => get16ColorsSequence(colorNames[name].c16, target)
      : () => ``;

export function resolveColorToRgb(color: ColorName | string) {
  return Object.prototype.hasOwnProperty.call(colorNames, color)
    ? colorNames[color as ColorName].rgb
    : hexToRgbMemo(color);
}

export function getColorSequence(color: ColorName | string, target: Target) {
  return Object.prototype.hasOwnProperty.call(colorNames, color)
    ? getNamedColorSequence(color as ColorName, target)
    : getHexColorSequence(color, target);
}

export const getColorResetSequence = doesSupportTrueColors || doesSupport256Colors || doesSupport16Colors
  ? (target: Target) => `\x1b[${39 + target}m`
  : () => ``;
