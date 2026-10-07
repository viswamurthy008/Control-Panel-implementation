import React from 'react';
import { sx, hv, Icon, HOVER_MUTED } from '../ui.jsx';

export default function Topbar({ v }) {
  return (
    <header ref={v.headerRef} style={sx(`position:sticky;top:0;z-index:4;display:flex;align-items:center;gap:${v.hdrGap};padding:0 ${v.hdrPad};height:58px;min-width:0;background:color-mix(in srgb, var(--color-bg-default) 82%, transparent);backdrop-filter:blur(8px)`)}>
      <div style={sx('position:relative;flex:0 1 230px;min-width:0;max-width:230px')}>
        <button onClick={v.togglePlantMenu} className={hv(HOVER_MUTED)} style={sx('min-height:44px;min-width:44px;display:flex;align-items:center;gap:9px;padding:5px 9px 5px 6px;border-radius:9px;border:1px solid transparent;background:transparent;cursor:pointer;font-family:var(--font-sans);color:var(--color-text-default);width:100%')}>
          <span style={sx('width:26px;height:26px;border-radius:7px;background:var(--color-action-primary);display:grid;place-items:center;flex:none')}>
            <Icon name="building" size={15} stroke="#fff" />
          </span>
          <span style={sx('display:flex;flex-direction:column;align-items:flex-start;line-height:1.15;min-width:0;flex:1;overflow:hidden')}>
            <span style={sx('font-weight:600;letter-spacing:-.01em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%')}>{v.curPlantName}</span>
            <span style={sx('font-size:11px;color:var(--color-text-subtle);white-space:nowrap')}>Shift B · Days</span>
          </span>
          <Icon name="chevDown" size={15} stroke="var(--color-text-subtle)" style={sx('flex:none')} />
        </button>
        {v.plantMenu && (
          <div style={sx('position:absolute;top:46px;left:0;width:308px;background:var(--color-bg-default);border:1px solid var(--color-border-default);border-radius:12px;box-shadow:0 12px 32px rgba(0,0,0,.22);padding:6px;z-index:30')}>
            <div style={sx('padding:8px 10px 6px;font-size:10px;letter-spacing:.05em;text-transform:uppercase;color:var(--color-text-placeholder);font-weight:600')}>Switch site</div>
            {v.plantList.map((p) => (
              <button key={p.id} onClick={p.onSelect} className={hv(HOVER_MUTED)} style={sx(p.rowStyle)}>
                <span style={sx('flex:1;min-width:0')}>
                  <span style={sx('display:block;font-size:13px;font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis')}>{p.name}</span>
                  <span style={sx('display:block;font-size:11.5px;color:var(--color-text-subtle)')}>{p.line}</span>
                </span>
                <span style={sx('font-family:var(--font-mono);font-size:11.5px;color:var(--color-text-subtle);flex:none')}>{p.online}</span>
                {p.active && <span style={sx('width:7px;height:7px;border-radius:9999px;background:var(--color-action-primary);flex:none')} />}
              </button>
            ))}
          </div>
        )}
      </div>

      <div style={sx('display:flex;align-items:center;gap:7px;padding:4px 10px;border-radius:9999px;background:var(--color-bg-muted);font-size:12px;color:var(--color-text-subtle);flex:none;white-space:nowrap')}>
        <span style={sx('width:7px;height:7px;border-radius:9999px;background:var(--green-500);animation:lyra-pulse 1.8s ease-in-out infinite')} />
        {v.hdrShowLive && <span>Live</span>}
        <span style={sx('font-family:var(--font-mono);color:var(--color-text-default)')}>{v.clock}</span>
      </div>

      <button onClick={v.openPalette} title="Search (⌘K)" aria-label="Search" className={hv('border-color:var(--color-border-strong)')} style={sx(`min-height:44px;min-width:44px;display:flex;align-items:center;gap:9px;padding:6px 10px;border-radius:8px;border:1px solid var(--color-border-default);background:var(--color-bg-subtle);color:var(--color-text-placeholder);cursor:pointer;font-family:var(--font-sans);font-size:12.5px;${v.searchSize}`)}>
        <Icon name="search" size={15} />
        {v.hdrFull && <span style={sx('flex:1;text-align:left;white-space:nowrap;overflow:hidden;text-overflow:ellipsis')}>Search or jump to…</span>}
        <span style={sx('font-family:var(--font-mono);font-size:11px;padding:1px 6px;border-radius:5px;background:var(--color-bg-muted);color:var(--color-text-subtle);flex:none')}>⌘K</span>
      </button>

      {v.hdrFull ? (
        <div style={sx('display:flex;align-items:center;gap:6px;font-size:12px;color:var(--color-text-subtle);flex:none;white-space:nowrap')}>
          <span style={sx('font-family:var(--font-mono);font-size:13px;color:var(--color-text-default)')}>{v.kpi.active}</span>
          <span>/</span><span>{v.kpi.total}</span><span>online</span>
        </div>
      ) : (
        <div style={sx('flex:1;min-width:0')} />
      )}

      <button onClick={v.toggleEstop} className={hv('filter:brightness(1.06)')} style={sx(v.estopStyle)}>
        <span style={sx(`width:9px;height:9px;border-radius:9999px;background:currentColor;${v.estopPulse}`)} />
        {v.estopLabel}
      </button>

      <div role="group" aria-label="Theme" style={sx('display:flex;gap:0;padding:0;border-radius:9999px;background:var(--color-bg-muted);flex:none')}>
        <button onClick={v.setLight} title="Light theme" aria-pressed={!v.isDark} style={sx(v.themeLightStyle)}>
          <Icon name="sun" size={15} />
        </button>
        <button onClick={v.setDark} title="Dark theme" aria-pressed={v.isDark} style={sx(v.themeDarkStyle)}>
          <Icon name="moon" size={15} />
        </button>
      </div>

      {v.hdrShowLive && <div style={sx('width:1px;height:26px;background:var(--color-border-default);flex:none')} />}
      <button title="Account" className={hv(HOVER_MUTED)} style={sx('min-height:44px;min-width:44px;display:flex;align-items:center;gap:9px;padding:4px 8px 4px 4px;border-radius:9999px;border:1px solid transparent;background:transparent;cursor:pointer;font-family:var(--font-sans);color:var(--color-text-default);flex:none')}>
        <span style={sx('width:30px;height:30px;border-radius:9999px;background:var(--color-bg-brand-subtle);color:var(--color-text-brand);display:grid;place-items:center;font-weight:600;font-size:12px;flex:none')}>RM</span>
        {v.hdrFull && (
          <span style={sx('display:flex;flex-direction:column;align-items:flex-start;line-height:1.15')}>
            <span style={sx('font-size:12.5px;font-weight:500;white-space:nowrap')}>R. Marín</span>
            <span style={sx('font-size:11px;color:var(--color-text-subtle);white-space:nowrap')}>Line supervisor</span>
          </span>
        )}
        <Icon name="chevDown" size={14} stroke="var(--color-text-subtle)" />
      </button>
    </header>
  );
}
