import React from 'react';
import { sx, hv, Icon, HOVER_MUTED } from '../ui.jsx';

const SECTION = 'font-size:10px;letter-spacing:.06em;text-transform:uppercase;color:var(--color-text-placeholder);font-weight:600';

const NAV = [
  ['fleet', 'grid', 'Fleet overview'],
  ['map', 'map', 'Floor map'],
  ['tasks', 'tasks', 'Job queue'],
  ['charge', 'charge', 'Charging'],
  ['alerts', 'alert', 'Alerts'],
  ['analytics', 'analytics', 'Analytics'],
  ['maint', 'wrench', 'Maintenance'],
  ['rollup', 'rollup', 'Plant rollup'],
  ['handover', 'handover', 'Shift handover'],
];

export default function Sidebar({ v }) {
  return (
    <aside style={sx('grid-row:1;position:sticky;top:0;height:100vh;display:flex;flex-direction:column;background:var(--color-bg-default);border-right:1px solid var(--color-border-default);z-index:5')}>
      <div style={sx('display:flex;align-items:center;gap:10px;height:58px;padding:0 18px;box-sizing:border-box;flex:none')}>
        <div style={sx('width:30px;height:30px;border-radius:8px;background:var(--color-action-primary);display:grid;place-items:center;flex:none')}>
          <Icon name="logo" stroke="#fff" width={2.2} />
        </div>
        <div style={sx('line-height:1.1')}>
          <div style={sx('font-weight:700;letter-spacing:-.01em')}>Orchestrator</div>
          <div style={sx('font-size:11px;color:var(--color-text-subtle);font-family:var(--font-mono)')}>v1.0 · floor ops</div>
        </div>
      </div>

      <div style={sx('padding:14px 18px 6px;' + SECTION)}>Operations</div>
      <nav style={sx('display:flex;flex-direction:column;gap:2px;padding:0 10px')}>
        {NAV.map(([id, icon, label]) => (
          <button key={id} onClick={() => v.go(id)} className={hv(HOVER_MUTED)} style={sx(v.nav[id])}>
            <Icon name={icon} />
            {id === 'alerts' ? (
              <>
                <span style={sx('flex:1;text-align:left')}>{label}</span>
                {v.hasAlerts && (
                  <span style={sx('min-width:19px;height:19px;padding:0 5px;border-radius:9999px;background:var(--red-500);color:#fff;font-size:11px;font-weight:600;font-family:var(--font-mono);display:grid;place-items:center')}>{v.unackCount}</span>
                )}
              </>
            ) : (
              <span style={sx('white-space:nowrap')}>{label}</span>
            )}
          </button>
        ))}
      </nav>

      <div style={sx('padding:16px 18px 6px;' + SECTION)}>Zones</div>
      <div style={sx('padding:0 18px;display:flex;flex-direction:column;gap:9px;overflow:auto;flex:1')}>
        {v.zoneStats.map((z) => (
          <div key={z.id} style={sx('display:flex;align-items:center;gap:9px;font-size:12.5px')}>
            <span style={sx(`width:8px;height:8px;border-radius:2px;flex:none;background:${z.color}`)} />
            <span style={sx('flex:1;color:var(--color-text-subtle)')}>{z.name}</span>
            <span style={sx('font-family:var(--font-mono);font-size:11.5px;color:var(--color-text-default)')}>{z.count}</span>
          </div>
        ))}
      </div>

      <div style={sx('padding:12px 18px;border-top:1px solid var(--color-border-default);display:flex;align-items:center;gap:10px')}>
        <div style={sx('width:30px;height:30px;border-radius:9999px;background:var(--color-bg-brand-subtle);color:var(--color-text-brand);display:grid;place-items:center;font-weight:600;font-size:12px;flex:none')}>RM</div>
        <div style={sx('line-height:1.15;flex:1;min-width:0')}>
          <div style={sx('font-size:12.5px;font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis')}>R. Marín</div>
          <div style={sx('font-size:11px;color:var(--color-text-subtle)')}>Line supervisor</div>
        </div>
        <button onClick={v.toggleTheme} title="Toggle theme" className={hv(HOVER_MUTED)} style={sx('width:30px;height:30px;border-radius:8px;border:1px solid var(--color-border-default);background:transparent;color:var(--color-text-subtle);cursor:pointer;display:grid;place-items:center')}>
          <span style={sx('font-size:14px')}>{v.themeGlyph}</span>
        </button>
      </div>
    </aside>
  );
}
