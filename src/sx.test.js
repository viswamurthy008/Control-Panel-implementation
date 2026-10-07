import { describe, expect, it, vi } from 'vitest';
import { sx, hv } from './sx.js';

describe('sx', () => {
  it('converts declarations to a camel-cased style object', () => {
    expect(sx('font-size:12px;background-color:red')).toEqual({ fontSize: '12px', backgroundColor: 'red' });
  });

  it('keeps custom properties and var() values as written', () => {
    expect(sx('--accent:#fff;color:var(--color-text-default)')).toEqual({ '--accent': '#fff', color: 'var(--color-text-default)' });
  });

  it('does not split on semicolons or colons inside parentheses', () => {
    const bg = 'repeating-linear-gradient(45deg,transparent,color-mix(in srgb,var(--red-500) 15%,transparent) 5px)';
    expect(sx(`background:${bg};width:2px`)).toEqual({ background: bg, width: '2px' });
  });

  it('skips empty and malformed declarations', () => {
    expect(sx('color:red;;;  ;nonsense;width:1px;')).toEqual({ color: 'red', width: '1px' });
  });

  it('returns undefined for empty input and caches repeat strings', () => {
    expect(sx('')).toBeUndefined();
    expect(sx('color:blue')).toBe(sx('color:blue'));
  });
});

describe('hv', () => {
  it('reuses one class per declaration string', () => {
    expect(hv('color:red')).toBe(hv('color:red'));
    expect(hv('color:red')).not.toBe(hv('color:blue'));
  });

  it('adds an !important :hover rule so it beats inline styles', () => {
    // jsdom drops !important when serialising var() values, so check the
    // rule text handed to the stylesheet rather than reading it back.
    const insert = vi.spyOn(CSSStyleSheet.prototype, 'insertRule');
    const cls = hv('background:var(--x);opacity:.5');
    expect(insert).toHaveBeenCalledWith(`.${cls}:hover{background:var(--x) !important;opacity:.5 !important}`, expect.any(Number));
  });
});
