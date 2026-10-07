import React from 'react';
import { sx, hv, PageHeader, KpiGrid, CARD, RISE, TH, PANEL_HEAD, HOVER_SUBTLE } from '../ui.jsx';

const SCHED_COLS = 'display:grid;grid-template-columns:104px 128px 1fr 72px 84px;gap:12px';
const PART_COLS = 'display:grid;grid-template-columns:1fr 58px 74px 66px;gap:12px';
const ROW_BORDER = 'border-bottom:1px solid var(--color-border-default)';

export default function MaintenanceView({ v }) {
  return (
    <div style={sx(RISE)}>
      <PageHeader title="Maintenance & reliability" subtitle="Service schedule, MTBF and open work orders" />
      <KpiGrid items={v.maintKpis} />

      <div style={sx('display:grid;grid-template-columns:1.5fr 1fr;gap:16px;align-items:start')}>
        <div style={sx(CARD + ';overflow:hidden')}>
          <div style={sx(PANEL_HEAD)}>Service schedule</div>
          <div style={sx(`${SCHED_COLS};padding:9px 18px;${ROW_BORDER};${TH};white-space:nowrap`)}><span>Robot</span><span>Health</span><span>PM cycle</span><span>MTBF</span><span style={sx('text-align:right')}>Service</span></div>
          {v.maintRows.map((r) => (
            <div key={r.uid} onClick={r.open} className={hv(HOVER_SUBTLE)} style={sx(`${SCHED_COLS};align-items:center;padding:10px 18px;${ROW_BORDER};cursor:pointer;font-size:13px`)}>
              <span style={sx('font-family:var(--font-mono);font-weight:600;font-size:12.5px')}>{r.id}</span>
              <span style={sx('display:flex;align-items:center;gap:8px')}><span style={sx(`width:8px;height:8px;border-radius:9999px;background:${r.healthColor};flex:none`)} /><span style={sx('white-space:nowrap')}>{r.health}</span></span>
              <span style={sx('display:flex;align-items:center;gap:9px')}>
                <span style={sx('flex:1;height:6px;border-radius:9999px;background:var(--color-bg-muted);overflow:hidden')}><span style={sx(`display:block;height:100%;width:${r.pmPct}%;background:${r.pmColor};border-radius:9999px`)} /></span>
                <span style={sx('font-family:var(--font-mono);font-size:10.5px;color:var(--color-text-subtle);white-space:nowrap')}>{r.pmLabel}</span>
              </span>
              <span style={sx('font-family:var(--font-mono);font-size:12px;color:var(--color-text-subtle)')}>{r.mtbf}</span>
              <span style={sx(`font-family:var(--font-mono);font-size:12.5px;font-weight:600;text-align:right;color:${r.serviceColor}`)}>{r.service}</span>
            </div>
          ))}
        </div>
        <div style={sx(CARD + ';overflow:hidden')}>
          <div style={sx(PANEL_HEAD)}>Open work orders</div>
          {v.workOrders.map((w) => (
            <div key={w.id} style={sx(`padding:13px 18px;${ROW_BORDER}`)}>
              <div style={sx('display:flex;align-items:center;gap:8px;margin-bottom:5px')}>
                <span style={sx('font-family:var(--font-mono);font-size:11px;color:var(--color-text-placeholder)')}>{w.id}</span>
                <span style={sx(w.prioStyle)}>{w.pri}</span>
                <span style={sx(`margin-left:auto;font-size:10.5px;font-weight:600;padding:2px 8px;border-radius:9999px;background:${w.chipBg};color:${w.chipColor}`)}>{w.status}</span>
              </div>
              <div style={sx('font-size:13px;font-weight:500;margin-bottom:5px')}>{w.title}</div>
              <div style={sx('font-size:11.5px;color:var(--color-text-subtle)')}><span style={sx('font-family:var(--font-mono)')}>{w.robot}</span> · {w.tech} · opened {w.age} ago</div>
            </div>
          ))}
        </div>
      </div>

      <div style={sx('display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:16px;align-items:start')}>
        <div style={sx(CARD + ';overflow:hidden')}>
          <div style={sx(PANEL_HEAD)}>Spare parts inventory</div>
          <div style={sx(`${PART_COLS};padding:9px 18px;${ROW_BORDER};${TH}`)}><span>Part</span><span>Bin</span><span style={sx('text-align:right')}>Stock / min</span><span style={sx('text-align:right')}>Status</span></div>
          {v.parts.map((p) => (
            <div key={p.sku} style={sx(`${PART_COLS};align-items:center;padding:11px 18px;${ROW_BORDER};font-size:13px`)}>
              <span style={sx('min-width:0')}><span style={sx('display:block;font-weight:500')}>{p.name}</span><span style={sx('font-family:var(--font-mono);font-size:11px;color:var(--color-text-placeholder)')}>{p.sku}</span></span>
              <span style={sx('font-family:var(--font-mono);font-size:12px;color:var(--color-text-subtle)')}>{p.loc}</span>
              <span style={sx('font-family:var(--font-mono);font-size:12.5px;text-align:right')}>{p.stock} / {p.min}</span>
              <span style={sx('text-align:right')}><span style={sx(`display:inline-block;padding:2px 9px;border-radius:9999px;font-size:10.5px;font-weight:600;background:${p.chipBg};color:${p.chipColor}`)}>{p.state}</span></span>
            </div>
          ))}
        </div>
        <div style={sx(CARD + ';overflow:hidden')}>
          <div style={sx(`display:flex;align-items:center;justify-content:space-between;padding:14px 18px;${ROW_BORDER}`)}>
            <span style={sx('font-size:13px;font-weight:600')}>Out of service</span>
            <span style={sx('font-family:var(--font-mono);font-size:12px;color:var(--color-text-subtle)')}>{v.outOfService.length} units</span>
          </div>
          {v.outOfService.length > 0 ? v.outOfService.map((o) => (
            <div key={o.uid} onClick={o.open} className={hv(HOVER_SUBTLE)} style={sx(`display:flex;align-items:center;gap:12px;padding:12px 18px;${ROW_BORDER};cursor:pointer`)}>
              <span style={sx('font-family:var(--font-mono);font-weight:600;font-size:13px')}>{o.id}</span>
              <span style={sx('flex:1;min-width:0;font-size:12px;color:var(--color-text-subtle);white-space:nowrap;overflow:hidden;text-overflow:ellipsis')}>{o.model} · {o.zone}</span>
              <span style={sx(`display:inline-flex;align-items:center;gap:6px;font-size:11.5px;font-weight:600;color:${o.reasonColor};flex:none`)}><span style={sx(`width:7px;height:7px;border-radius:9999px;background:${o.reasonColor}`)} />{o.reason}</span>
            </div>
          )) : (
            <div style={sx('padding:28px 18px;text-align:center;font-size:12.5px;color:var(--color-text-subtle)')}>All units in service.</div>
          )}
        </div>
      </div>
    </div>
  );
}
