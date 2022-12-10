import {closest as closestColor} from 'color-diff';
import fs                        from 'fs';

import {hexToRgb, RGB}           from '../sources/core/tools/getColor';

const paletteDataPath = require.resolve(`../sources/core/data/colorPalettes.json`);
const paletteDataFile = require(paletteDataPath);

paletteDataFile.palette16 = paletteDataFile.palette16.map((hex: string) => hexToRgb(hex));
paletteDataFile.palette256 = paletteDataFile.palette16.map((hex: string) => hexToRgb(hex));

const nameDataPath = require.resolve(`../sources/core/data/colorNames.json`);
const nameDataFile = require(nameDataPath);

function getClosestColor(color: RGB, target: Array<RGB>) {
  return target.indexOf(closestColor(color, target));
}
  
for (const name of Object.keys(nameDataFile.colorNames) as any[]) {
  const hex = nameDataFile.colorNames[name];
  const rgb = hexToRgb(hex);

  nameDataFile.colorNames[name] = {
    rgb,
    c16: getClosestColor(rgb, paletteDataFile.palette16),
    c256: getClosestColor(rgb, paletteDataFile.palette256),
  };
}

const compiledPath = (p: string) => p.replace(/\.json$/, `.compiled.json`);

fs.writeFileSync(compiledPath(paletteDataPath), `${JSON.stringify(paletteDataFile, null, 2)}\n`);
fs.writeFileSync(compiledPath(nameDataPath), `${JSON.stringify(nameDataFile, null, 2)}\n`);
