import React from 'react';
import { sx, hv, fv, cx, Icon, HOVER_MUTED } from '../ui.jsx';

const SECTION = 'font-size:10px;letter-spacing:.06em;text-transform:uppercase;color:var(--color-text-placeholder);font-weight:600';
const FOCUS_RING = 'outline:2px solid var(--color-action-primary);outline-offset:-2px';

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
  const open = !v.sbCollapsed;
  return (
    <aside id="app-sidebar" aria-label="Sidebar" style={sx('grid-row:1;position:sticky;top:0;height:100vh;overflow:hidden;display:flex;flex-direction:column;background:var(--color-bg-default);border-right:1px solid var(--color-border-default);z-index:5')}>
      <div style={sx(`display:flex;align-items:center;gap:10px;height:58px;padding:0 ${open ? '18px' : '0'};box-sizing:border-box;flex:none`)}>
        {open && (
          <>
            <div style={sx('width:30px;height:30px;border-radius:8px;background:var(--color-action-primary);display:grid;place-items:center;flex:none')}>
              <Icon name="logo" stroke="#fff" width={2.2} />
            </div>
            <div style={sx('line-height:1.1')}>
              <div style={sx('font-weight:700;letter-spacing:-.01em')}>Orchestrator</div>
              <div style={sx('font-size:11px;color:var(--color-text-subtle);font-family:var(--font-mono)')}>v1.0 · floor ops</div>
            </div>
          </>
        )}
        <button
          type="button"
          onClick={v.toggleSidebar}
          title={open ? 'Collapse sidebar' : 'Expand sidebar'}
          aria-label="Main navigation"
          aria-expanded={open}
          aria-controls="app-sidebar-nav"
          className={cx(hv('background:var(--color-bg-muted);color:var(--color-text-default)'), fv('outline:2px solid var(--color-action-primary);outline-offset:2px'))}
          style={sx(`min-height:44px;min-width:44px;width:44px;height:44px;margin-left:auto;margin-right:auto;border-radius:8px;border:none;background:transparent;color:var(--color-text-subtle);cursor:pointer;display:grid;place-items:center;flex:none;${open ? 'margin-right:-6px;' : ''}`)}
        >
          <Icon name="menu" />
        </button>
      </div>

      {open
        ? <div style={sx('padding:14px 18px 6px;white-space:nowrap;' + SECTION)}>Operations</div>
        : <div style={sx('height:14px')} />}
      <nav id="app-sidebar-nav" aria-label="Main" style={sx('display:flex;flex-direction:column;gap:2px;padding:0 10px')}>
        {NAV.map(([id, icon, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => v.go(id)}
            title={label}
            aria-label={id === 'alerts' ? v.alertsAria : label}
            aria-current={v.navCur[id]}
            className={cx(hv(HOVER_MUTED), fv(FOCUS_RING))}
            style={sx(v.nav[id])}
          >
            <Icon name={icon} />
            {open && (id === 'alerts' ? (
              <>
                <span style={sx('flex:1;text-align:left')}>{label}</span>
                {v.hasAlerts && (
                  <span style={sx('min-width:19px;height:19px;padding:0 5px;border-radius:9999px;background:var(--red-500);color:#fff;font-size:11px;font-weight:600;font-family:var(--font-mono);display:grid;place-items:center')}>{v.unackCount}</span>
                )}
              </>
            ) : (
              <span style={sx('white-space:nowrap')}>{label}</span>
            ))}
            {!open && id === 'alerts' && v.hasAlerts && (
              <span aria-hidden="true" style={sx('position:absolute;top:5px;right:7px;width:8px;height:8px;border-radius:9999px;background:var(--red-500);box-shadow:0 0 0 2px var(--color-bg-default)')} />
            )}
          </button>
        ))}
      </nav>

      {open && (
        <>
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
        </>
      )}
    </aside>
  );
}
