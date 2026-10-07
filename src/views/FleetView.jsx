import React from 'react';
import { sx, hv, Icon, PageHeader, KpiGrid, Segmented, CARD, RISE, TH, HOVER_SUBTLE, HOVER_MUTED } from '../ui.jsx';

const COLS = 'display:grid;grid-template-columns:132px 116px 96px 150px 1fr 108px;gap:14px';

function MiniBar({ pct, color, width = 'flex:1', height = 5 }) {
  return (
    <div style={sx(`${width};height:${height}px;border-radius:9999px;background:var(--color-bg-muted);overflow:hidden`)}>
      <div style={sx(`height:100%;width:${pct}%;background:${color};border-radius:9999px;transition:width .5s`)} />
    </div>
  );
}

function StatusLegend({ v }) {
  const items = [['Active', 'var(--green-500)', v.kpi.active], ['Charging', 'var(--blue-500)', v.kpi.charging], ['Idle', 'var(--gray-400)', v.kpi.idle], ['Fault', 'var(--red-500)', v.kpi.fault]];
  return (
    <div style={sx('display:flex;gap:16px;flex-wrap:wrap;font-size:12px')}>
      {items.map(([label, color, n]) => (
        <span key={label} style={sx('display:flex;align-items:center;gap:6px')}>
          <span style={sx(`width:8px;height:8px;border-radius:9999px;background:${color}`)} />{label} <b style={sx('font-family:var(--font-mono)')}>{n}</b>
        </span>
      ))}
    </div>
  );
}

function FleetTable({ v }) {
  return (
    <div style={sx(CARD + ';overflow:hidden')}>
      <div style={sx(`${COLS};padding:10px 18px;border-bottom:1px solid var(--color-border-default);${TH};white-space:nowrap`)}>
        <span>Robot</span><span>Model</span><span>Status</span><span>Battery</span><span>Current task</span><span style={sx('text-align:right')}>Progress</span>
      </div>
      {v.fleetGroups.map((g) => (
        <div key={g.id}>
          <div onClick={g.onToggle} className={hv(HOVER_MUTED)} style={sx('display:flex;align-items:center;gap:10px;padding:9px 18px;background:var(--color-bg-subtle);border-bottom:1px solid var(--color-border-default);cursor:pointer;font-size:12.5px')}>
            <span style={sx('width:12px;color:var(--color-text-subtle);font-size:11px')}>{g.chevron}</span>
            <span style={sx(`width:8px;height:8px;border-radius:2px;background:${g.color}`)} />
            <span style={sx('font-weight:600')}>{g.name}</span>
            <span style={sx('font-family:var(--font-mono);color:var(--color-text-subtle)')}>{g.count}</span>
            <span style={sx('flex:1')} />
            <span style={sx('display:flex;gap:12px;font-family:var(--font-mono);font-size:11.5px')}>
              <span style={sx('color:var(--color-text-success)')}>{g.active} active</span>
              <span style={sx('color:var(--color-text-subtle)')}>{g.idle} idle</span>
              <span style={sx('color:var(--color-text-danger)')}>{g.fault} fault</span>
            </span>
          </div>
          {g.expanded && g.rows.map((r) => (
            <div key={r.uid} onClick={r.open} className={hv(HOVER_SUBTLE)} style={sx(`${COLS};align-items:center;padding:9px 18px;border-bottom:1px solid var(--color-border-default);cursor:pointer;font-size:13px`)}>
              <span style={sx('display:flex;align-items:center;gap:8px;font-family:var(--font-mono);font-weight:600;font-size:12.5px')}>
                <span style={sx(`width:8px;height:8px;border-radius:9999px;background:${r.color};${r.pulse};flex:none`)} />{r.id}
              </span>
              <span style={sx('color:var(--color-text-subtle);font-size:12px')}>{r.model}</span>
              <span><span style={sx(r.badge)}>{r.statusLabel}</span></span>
              <span style={sx('display:flex;align-items:center;gap:7px')}>
                <MiniBar pct={r.battery} color={r.battColor} />
                <span style={sx('font-family:var(--font-mono);font-size:11.5px;width:32px;text-align:right')}>{r.battLabel}</span>
              </span>
              <span style={sx('color:var(--color-text-subtle);white-space:nowrap;overflow:hidden;text-overflow:ellipsis')}>{r.task}</span>
              <span style={sx('display:flex;align-items:center;gap:7px;justify-content:flex-end')}>
                <MiniBar pct={r.progress} color="var(--color-action-primary)" width="width:60px" />
                <span style={sx('font-family:var(--font-mono);font-size:11.5px;width:32px;text-align:right')}>{r.progLabel}</span>
              </span>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

function FleetCards({ v }) {
  const row = (label, pct, color, text) => (
    <div style={sx('display:flex;align-items:center;gap:8px')}>
      <span style={sx('font-size:11px;color:var(--color-text-placeholder);width:52px')}>{label}</span>
      <MiniBar pct={pct} color={color} height={6} />
      <span style={sx('font-family:var(--font-mono);font-size:11.5px;width:34px;text-align:right')}>{text}</span>
    </div>
  );
  return (
    <div style={sx('display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:14px')}>
      {v.fleetRobots.map((r) => (
        <div key={r.uid} onClick={r.open} className={hv('border-color:var(--color-border-strong);box-shadow:0 2px 10px rgba(0,0,0,.06)')} style={sx(CARD + ';padding:15px 16px;cursor:pointer;transition:border-color .12s,box-shadow .12s')}>
          <div style={sx('display:flex;align-items:center;gap:10px;margin-bottom:12px')}>
            <span style={sx('position:relative;width:10px;height:10px;flex:none')}>
              <span style={sx(`position:absolute;inset:0;border-radius:9999px;background:${r.color};${r.pulse}`)} />
            </span>
            <div style={sx('flex:1;min-width:0')}>
              <div style={sx('font-weight:600;font-family:var(--font-mono);font-size:13.5px')}>{r.id}</div>
              <div style={sx('font-size:11.5px;color:var(--color-text-subtle);white-space:nowrap;overflow:hidden;text-overflow:ellipsis')}>{r.model} · {r.zoneName}</div>
            </div>
            <span style={sx(r.badge)}>{r.statusLabel}</span>
          </div>
          <div style={sx('margin-bottom:6px')}>{row('Battery', r.battery, r.battColor, r.battLabel)}</div>
          {row('Task', r.progress, 'var(--color-action-primary)', r.progLabel)}
          <div style={sx('font-size:12px;color:var(--color-text-subtle);margin-top:9px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis')}>{r.task}</div>
        </div>
      ))}
    </div>
  );
}

export default function FleetView({ v }) {
  return (
    <div style={sx(RISE)}>
      <PageHeader title="Fleet overview" subtitle={`${v.kpi.total} humanoid units across 6 zones · real-time telemetry`}>
        <Segmented options={[
          { key: 'cards', onClick: v.goCards, style: v.segCards, icon: <Icon name="grid" size={15} />, label: 'Cards' },
          { key: 'table', onClick: v.goTable, style: v.segTable, icon: <Icon name="rows" size={15} />, label: 'Table' },
        ]} />
      </PageHeader>

      <KpiGrid items={v.fleetKpis} size={28} />

      <div style={sx(CARD + ';padding:14px 18px;margin-bottom:16px;display:flex;align-items:center;gap:20px;flex-wrap:wrap')}>
        <div style={sx('font-size:12px;font-weight:600;color:var(--color-text-subtle)')}>Fleet status</div>
        <div style={sx('flex:1;min-width:220px;height:10px;border-radius:9999px;overflow:hidden;display:flex;background:var(--color-bg-muted)')}>
          <div style={sx(`width:${v.dist.active}%;background:var(--green-500)`)} />
          <div style={sx(`width:${v.dist.charging}%;background:var(--blue-500)`)} />
          <div style={sx(`width:${v.dist.idle}%;background:var(--gray-400)`)} />
          <div style={sx(`width:${v.dist.fault}%;background:var(--red-500)`)} />
        </div>
        <StatusLegend v={v} />
      </div>

      <div style={sx('display:flex;align-items:center;gap:8px;margin-bottom:14px;flex-wrap:wrap')}>
        {v.filters.map((f) => (
          <button key={f.id} onClick={f.onClick} className={hv('border-color:var(--color-border-strong)')} style={sx(f.style)}>
            {f.label}<span style={sx('font-family:var(--font-mono);opacity:.7;margin-left:6px')}>{f.count}</span>
          </button>
        ))}
      </div>

      {v.isTable ? <FleetTable v={v} /> : <FleetCards v={v} />}
    </div>
  );
}
