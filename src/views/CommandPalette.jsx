import React from 'react';
import { sx, hv, Icon, HOVER_MUTED } from '../ui.jsx';

const KIND = 'font-family:var(--font-mono);font-size:10px;letter-spacing:.04em;text-transform:uppercase;padding:2px 6px;border-radius:5px;background:var(--color-bg-muted);color:var(--color-text-subtle)';

export default function CommandPalette({ v }) {
  const onKeyDown = (e) => {
    if (e.key === 'Enter' && v.palette.length) v.palette[0].onSelect();
  };
  return (
    <div onClick={v.closePalette} style={sx('position:fixed;inset:0;z-index:50;background:rgba(8,12,20,.5);display:flex;align-items:flex-start;justify-content:center;padding-top:12vh;backdrop-filter:blur(2px)')}>
      <div role="dialog" aria-label="Command palette" onClick={(e) => e.stopPropagation()} style={sx('width:min(560px,92vw);background:var(--color-bg-default);border:1px solid var(--color-border-default);border-radius:14px;box-shadow:0 24px 60px rgba(0,0,0,.35);overflow:hidden')}>
        <div style={sx('display:flex;align-items:center;gap:11px;padding:14px 16px;border-bottom:1px solid var(--color-border-default)')}>
          <Icon name="search" stroke="var(--color-text-subtle)" />
          <input
            value={v.paletteQuery}
            onChange={v.onPaletteInput}
            onKeyDown={onKeyDown}
            autoFocus
            placeholder="Search robots, screens, actions…"
            style={sx('flex:1;border:none;outline:none;background:transparent;font-family:var(--font-sans);font-size:15px;color:var(--color-text-default)')}
          />
          <span style={sx('font-family:var(--font-mono);font-size:11px;padding:2px 7px;border-radius:6px;background:var(--color-bg-muted);color:var(--color-text-subtle)')}>esc</span>
        </div>
        <div style={sx('max-height:340px;overflow:auto;padding:6px')}>
          {v.palette.map((it) => (
            <button key={it.kind + it.label} onClick={it.onSelect} className={hv(HOVER_MUTED)} style={sx('display:flex;align-items:center;gap:11px;width:100%;padding:10px 12px;border:none;background:transparent;border-radius:9px;cursor:pointer;text-align:left;font-family:var(--font-sans)')}>
              <span style={sx(KIND)}>{it.kind}</span>
              <span style={sx('flex:1;font-size:13.5px;color:var(--color-text-default)')}>{it.label}</span>
              <span style={sx('font-size:12px;color:var(--color-text-subtle);font-family:var(--font-mono)')}>{it.hint}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
