export let doesSupport16Colors: boolean = !!process.env.TERM && /^(screen|xterm|vt100)/.test(process.env.TERM);
export let doesSupport256Colors: boolean = !!process.env.TERM && doesSupport16Colors && /^\w+-256/.test(process.env.TERM);
export let doesSupportTrueColors: boolean = doesSupport256Colors && false;

if (process.env.TERM_FEATURES) {
  if (/\b16-colors\b/.test(process.env.TERM_FEATURES))
    doesSupport16Colors = true;

  if (/\b256-colors\b/.test(process.env.TERM_FEATURES))
    doesSupport256Colors = true;

  if (/\btrue-colors\b/.test(process.env.TERM_FEATURES)) {
    doesSupportTrueColors = true;
  }
}

if (process.env.COLORTERM) {
  if (/\b(truecolor|24bit)\b/.test(process.env.COLORTERM)) {
    doesSupportTrueColors = true;
  }
}
