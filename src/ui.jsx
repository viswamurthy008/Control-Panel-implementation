import React from 'react';
import { sx, hv } from './sx.js';

export { sx, hv };

// Shared declaration strings from the design.
export const CARD = 'background:var(--color-bg-default);border:1px solid var(--color-border-default);border-radius:12px';
export const LABEL = 'font-size:11px;letter-spacing:.05em;text-transform:uppercase;color:var(--color-text-placeholder);font-weight:600';
export const TH = 'font-size:10px;letter-spacing:.05em;text-transform:uppercase;color:var(--color-text-placeholder);font-weight:600';
export const PANEL_HEAD = 'padding:14px 18px;font-size:13px;font-weight:600;border-bottom:1px solid var(--color-border-default)';
export const MONO = 'font-family:var(--font-mono)';
export const BTN_OUTLINE = 'border:1px solid var(--color-border-default);background:transparent;color:var(--color-text-default);font-weight:500;cursor:pointer;font-family:var(--font-sans)';
export const BTN_PRIMARY = 'border:none;background:var(--color-action-primary);color:#fff;font-weight:600;cursor:pointer;font-family:var(--font-sans)';
export const HOVER_MUTED = 'background:var(--color-bg-muted)';
export const HOVER_SUBTLE = 'background:var(--color-bg-subtle)';
export const HOVER_PRIMARY = 'background:var(--color-action-primary-hover)';
export const RISE = 'animation:lyra-rise .25s ease';

export function PageHeader({ title, subtitle, children }) {
  return (
    <div style={sx('display:flex;align-items:flex-end;justify-content:space-between;gap:16px;margin-bottom:18px')}>
      <div>
        <h1 style={sx('margin:0 0 3px;font-size:22px;font-weight:600;letter-spacing:-.01em')}>{title}</h1>
        <p style={sx('margin:0;font-size:13px;color:var(--color-text-subtle)')}>{subtitle}</p>
      </div>
      {children}
    </div>
  );
}

/** Four-up KPI row. Cards with a `delta` field show it beside the value. */
export function KpiGrid({ items, size = 26 }) {
  return (
    <div style={sx('display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:16px')}>
      {items.map((k) => (
        <div key={k.label} style={sx(CARD + ';padding:16px 18px')}>
          <div style={sx(LABEL)}>{k.label}</div>
          {k.delta !== undefined ? (
            <div style={sx('display:flex;align-items:baseline;gap:8px;margin-top:8px')}>
              <span style={sx(`font-size:${size}px;font-weight:600;font-family:var(--font-mono);letter-spacing:-.02em`)}>{k.value}</span>
              <span style={sx(`font-size:12px;font-weight:600;color:${k.deltaColor}`)}>{k.delta}</span>
            </div>
          ) : (
            <div style={sx(`font-size:${size}px;font-weight:600;font-family:var(--font-mono);margin-top:8px`)}>{k.value}</div>
          )}
          <div style={sx('font-size:11.5px;color:var(--color-text-subtle);margin-top:2px')}>{k.helper}</div>
        </div>
      ))}
    </div>
  );
}

/** Rounded progress track. */
export function Bar({ pct, color = 'var(--color-action-primary)', height = 6, style = '', animate = true }) {
  return (
    <div style={sx(`height:${height}px;border-radius:9999px;background:var(--color-bg-muted);overflow:hidden;${style}`)}>
      <div style={sx(`height:100%;width:${pct}%;background:${color};border-radius:9999px${animate ? ';transition:width .5s' : ''}`)} />
    </div>
  );
}

export function Dot({ color, size = 8, radius = '9999px', style = '' }) {
  return <span style={sx(`width:${size}px;height:${size}px;border-radius:${radius};background:${color};flex:none;${style}`)} />;
}

export function Segmented({ options, radius = 9 }) {
  return (
    <div style={sx(`display:flex;gap:3px;padding:3px;border-radius:${radius}px;background:var(--color-bg-muted);flex:none`)}>
      {options.map((o) => (
        <button key={o.key} onClick={o.onClick} style={sx(o.style)}>{o.icon}{o.label}</button>
      ))}
    </div>
  );
}

export function BackButton({ onClick, label }) {
  return (
    <button onClick={onClick} className={hv('color:var(--color-text-default)')} style={sx('display:inline-flex;align-items:center;gap:6px;background:transparent;border:none;color:var(--color-text-subtle);font-size:12.5px;cursor:pointer;padding:0;margin-bottom:14px;font-family:var(--font-sans)')}>
      <Icon name="chevLeft" size={15} /><span style={sx('white-space:nowrap')}>{label}</span>
    </button>
  );
}

/** Vertical timeline used by the incident view. */
export function Timeline({ items, dot = 10 }) {
  return (
    <div style={sx('display:flex;flex-direction:column')}>
      {items.map((e, i) => (
        <div key={i} style={sx('display:flex;gap:13px;padding-bottom:16px')}>
          <div style={sx('display:flex;flex-direction:column;align-items:center;flex:none')}>
            <span style={sx(`width:${dot}px;height:${dot}px;border-radius:9999px;background:${e.color};margin-top:3px;flex:none`)} />
            <span style={sx('flex:1;width:2px;background:var(--color-border-default);margin-top:3px')} />
          </div>
          <div style={sx('flex:1;padding-bottom:2px')}>
            <div style={sx('font-size:13px;line-height:1.35')}>{e.text}</div>
            <div style={sx('font-size:11px;color:var(--color-text-subtle);font-family:var(--font-mono);margin-top:3px')}>{e.t}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

const PATHS = {
  logo: <><rect x="4" y="9" width="16" height="11" rx="2"/><path d="M12 9V5"/><circle cx="12" cy="4" r="1.4"/><path d="M9 14h.01M15 14h.01"/><path d="M9 20v-3M15 20v-3"/></>,
  grid: <><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></>,
  map: <><path d="m9 4-6 2v14l6-2 6 2 6-2V4l-6 2-6-2Z"/><path d="M9 4v14M15 6v14"/></>,
  tasks: <><path d="m3 8 2 2 3-3"/><path d="m3 16 2 2 3-3"/><path d="M12 7h9M12 17h9"/></>,
  charge: <><path d="M7 7H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h3"/><path d="M17 7h1a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2h-1"/><path d="M22 11v2"/><path d="m11 6-3 6h4l-3 6"/></>,
  alert: <><path d="M10.3 4.3 2 18a2 2 0 0 0 1.7 3h16.6a2 2 0 0 0 1.7-3L13.7 4.3a2 2 0 0 0-3.4 0Z"/><path d="M12 9v4M12 17h.01"/></>,
  analytics: <><path d="M3 3v18h18"/><rect x="7" y="11" width="3" height="6" rx="1"/><rect x="12.5" y="7" width="3" height="10" rx="1"/><rect x="18" y="13" width="3" height="4" rx="1"/></>,
  wrench: <path d="M14.7 6.3a4 4 0 0 1-5.4 5.4L4 17v3h3l5.3-5.3a4 4 0 0 0 5.4-5.4l-2.5 2.5-2.2-.6-.6-2.2 2.3-2.3Z"/>,
  rollup: <><rect x="4" y="3" width="7" height="18" rx="1"/><rect x="13" y="8" width="7" height="13" rx="1"/><path d="M7 7h1M7 11h1M16 12h1"/></>,
  handover: <><rect x="8" y="3" width="8" height="4" rx="1"/><path d="M9 5H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-3"/><path d="m9 14 2 2 4-4"/></>,
  building: <path d="M3 21h18M5 21V8l6-4 6 4v13M9 12h.01M13 12h.01M9 16h.01M13 16h.01"/>,
  chevDown: <path d="m6 9 6 6 6-6"/>,
  chevUp: <path d="m18 15-6-6-6 6"/>,
  chevLeft: <path d="m15 18-6-6 6-6"/>,
  chevRight: <path d="m9 18 6-6-6-6"/>,
  search: <><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></>,
  rows: <path d="M3 6h18M3 12h18M3 18h18"/>,
  target: <><circle cx="12" cy="12" r="3"/><circle cx="12" cy="12" r="9"/></>,
  heat: <><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></>,
  person: <><circle cx="12" cy="6" r="3.2"/><path d="M6 21v-2a6 6 0 0 1 12 0v2"/></>,
  camera: <><path d="m22 8-6 4 6 4V8Z"/><rect x="2" y="6" width="14" height="12" rx="2"/></>,
};

export function Icon({ name, size = 18, stroke = 'currentColor', width = 2, style }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" style={style}>
      {PATHS[name]}
    </svg>
  );
}
