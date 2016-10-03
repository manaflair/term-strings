import colorNames                                      from './colorNames';
import { getColor, getColorReset, COLOR_FG, COLOR_BG } from './getColor';

let ESC = `\x1b`;

export let reset = `${ESC}c${ESC}[?1000l${ESC}[?25h`;
export let clear = `${ESC}[H${ESC}[J`;

export let style = (function getStyle() {

    let style = {};

    style.clear = `${ESC}[m\x0f`;
    style.bold = { in: `${ESC}[1m`, out: `${ESC}[21m` };
    style.dim = { in: `${ESC}[2m`, out: `${ESC}[22m` };
    style.italic = { in: `${ESC}[3m`, out: `${ESC}[23m` };
    style.underline = { in: `${ESC}[4m`, out: `${ESC}[24m` };
    style.inverse = { in: `${ESC}[7m`, out: `${ESC}[27m` };
    style.hidden = { in: `${ESC}[8m`, out: `${ESC}[28m` };
    style.strikethrough = { in: `${ESC}[9m`, out: `${ESC}[29m` };

    style.front = id => style.front[id] || getColor(id, COLOR_FG);
    style.front.out = getColorReset(COLOR_FG);

    for (let colorName of Object.keys(colorNames))
        style.front[colorName] = getColor(colorNames[colorName], COLOR_FG);

    style.back = id => style.back[id] || getColor(id, COLOR_BG);
    style.back.out = getColorReset(COLOR_BG);

    for (let colorName of Object.keys(colorNames))
        style.back[colorName] = getColor(colorNames[colorName], COLOR_BG);

    style.cursor = {};

    style.cursor.normal = `${ESC}[34h${ESC}[?25h`;
    style.cursor.hidden = `${ESC}[?25l`;
    style.cursor.obvious = `${ESC}[34l`;

    return style;

}())

export let moveTo = ({ x, y, col = x, row = y }) => {

    if (col == null || row == null)
        throw new Error(`Invalid parameters`);

    return `${ESC}[${row + 1};${col + 1}H`;

};
