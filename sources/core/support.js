export let doesSupportBasicColors = process.stdout.isTTY && process.env.TERM && /^(screen|xterm|vt100)/.test(process.env.TERM);

export let doesSupport256Colors = doesSupportBasicColors && process.env.TERM && /^\w+-256/.test(process.env.TERM);

export let doesSupportTrueColors = doesSupport256Colors && false;

if (process.env.TERM_FEATURES) {

    if (/\bbasic-colors\b/.test(process.env.TERM_FEATURES))
        doesSupportBasicColors = true;

    if (/\b256-colors\b/.test(process.env.TERM_FEATURES))
        doesSupport256Colors = true;

    if (/\btrue-colors\b/.test(process.env.TERM_FEATURES)) {
        doesSupportTrueColors = true;
    }

}
