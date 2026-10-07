// The design is authored with CSS declaration strings. These helpers let the
// React port keep those strings verbatim.

const styleCache = new Map();

function splitDecls(css) {
  const out = [];
  let depth = 0, start = 0;
  for (let i = 0; i < css.length; i++) {
    const ch = css[i];
    if (ch === '(') depth++;
    else if (ch === ')') depth--;
    else if (ch === ';' && depth === 0) { out.push(css.slice(start, i)); start = i + 1; }
  }
  out.push(css.slice(start));
  return out;
}

const camel = (prop) => prop.startsWith('--') ? prop : prop.replace(/-([a-z])/g, (_, c) => c.toUpperCase());

/** Convert a CSS declaration string ("a:b;c:d") into a React style object. */
export function sx(css) {
  if (!css) return undefined;
  const hit = styleCache.get(css);
  if (hit) return hit;
  const style = {};
  for (const decl of splitDecls(css)) {
    const idx = decl.indexOf(':');
    if (idx === -1) continue;
    const prop = decl.slice(0, idx).trim();
    const value = decl.slice(idx + 1).trim();
    if (prop && value) style[camel(prop)] = value;
  }
  if (styleCache.size > 4000) styleCache.clear();
  styleCache.set(css, style);
  return style;
}

const hoverCache = new Map();
let sheet = null;
let n = 0;

/**
 * Return a class name that applies `css` on :hover. Declarations are marked
 * !important so they win over the element's inline styles.
 */
export function hv(css) {
  const hit = hoverCache.get(css);
  if (hit) return hit;
  if (!sheet) {
    const el = document.createElement('style');
    document.head.appendChild(el);
    sheet = el.sheet;
  }
  const cls = 'hv' + (n++).toString(36);
  const body = splitDecls(css).filter((d) => d.trim()).map((d) => d.trim() + ' !important').join(';');
  sheet.insertRule(`.${cls}:hover{${body}}`, sheet.cssRules.length);
  hoverCache.set(css, cls);
  return cls;
}
