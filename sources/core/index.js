import { colorNames }                                  from './data/colorNames';
import { getColor, getColorReset, COLOR_FG, COLOR_BG } from './tools/getColor';

export let feature = {};

feature.enableMouseTracking = { in: `\x1b[?1000h`, out: `\x1b[?1000l` };
feature.enableMouseHoldTracking = { in: `\x1b[?1002h`, out: `\x1b[?1002l` };
feature.enableMouseMoveTracking = { in: `\x1b[?1003h`, out: `\x1b[?1003l` };
feature.enableExtendedCoordinates = { in: `\x1b[?1006h`, out: `\x1b[?1006l` };

export let screen = {};

screen.reset = `\x1bc\x1b[?1000l\x1b[?25h`;
screen.clear = `\x1b[H\x1b[J`;

export let cursor = {};

cursor.display = `\x1b[34h\x1b[?25h`;
cursor.hide = `\x1b[?25l`;
cursor.highlight = `\x1b[34l`;

cursor.upBy = (n = 1) => n === 0 ? `` : n < 0 ? cursor.downBy(-n) : `\x1b[${n}A`;
cursor.downBy = (n = 1) => n === 0 ? `` : n < 0 ? cursor.upBy(-n) : `\x1b[${n}B`;
cursor.leftBy = (n = 1) => n === 0 ? `` : n < 0 ? cursor.rightBy(-n) : `\x1b[${n}D`;
cursor.rightBy = (n = 1) => n === 0 ? `` : n < 0 ? cursor.leftBy(-n) : `\x1b[${n}C`;

cursor.moveTo = ({ x, y, col = x, row = y }) => `\x1b[${row + 1};${col + 1}H`;
cursor.moveBy = ({ x, y, col = x, row = y }) => `${cursor.downBy(y)}${cursor.rightBy(x)}`;

export let style = { cursor: {} };

style.clear = `\x1b[m\x0f`;
style.bold = { in: `\x1b[1m`, out: `\x1b[21m` };
style.dim = { in: `\x1b[2m`, out: `\x1b[22m` };
style.italic = { in: `\x1b[3m`, out: `\x1b[23m` };
style.underline = { in: `\x1b[4m`, out: `\x1b[24m` };
style.inverse = { in: `\x1b[7m`, out: `\x1b[27m` };
style.hidden = { in: `\x1b[8m`, out: `\x1b[28m` };
style.strikethrough = { in: `\x1b[9m`, out: `\x1b[29m` };

style.front = id => style.front[id] || getColor(id, COLOR_FG);
style.front.out = getColorReset(COLOR_FG);

style.back = id => style.back[id] || getColor(id, COLOR_BG);
style.back.out = getColorReset(COLOR_BG);

for (let colorName of Object.keys(colorNames))
    style.front[colorName] = getColor(colorNames[colorName], COLOR_FG);

for (let colorName of Object.keys(colorNames))
    style.back[colorName] = getColor(colorNames[colorName], COLOR_BG);
