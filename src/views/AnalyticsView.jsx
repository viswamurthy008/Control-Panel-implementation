import React from 'react';
import { sx, PageHeader, KpiGrid, Bar, CARD, RISE } from '../ui.jsx';

const AXIS = 'font-size:10px;color:var(--color-text-placeholder);font-family:var(--font-mono)';

function MeterList({ items, value, color, gap }) {
  return (
    <div style={sx(`display:flex;flex-direction:column;gap:${gap}px`)}>
      {items.map((u) => (
        <div key={u.name}>
          <div style={sx('display:flex;justify-content:space-between;font-size:12.5px;margin-bottom:5px')}>
            <span style={sx('color:var(--color-text-subtle);white-space:nowrap')}>{u.name}</span>
            <span style={sx('font-family:var(--font-mono);font-weight:500')}>{value(u)}</span>
          </div>
          <Bar pct={u.pct} color={color || u.color} height={8} />
        </div>
      ))}
    </div>
  );
}

export default function AnalyticsView({ v }) {
  return (
    <div style={sx(RISE)}>
      <PageHeader title="Analytics" subtitle="Throughput & utilization · shift to date" />
      <KpiGrid items={v.anaKpis} />

      <div style={sx('display:grid;grid-template-columns:1.6fr 1fr;gap:16px')}>
        <div style={sx(CARD + ';padding:18px')}>
          <div style={sx('display:flex;align-items:center;justify-content:space-between;margin-bottom:18px')}>
            <span style={sx('font-size:13px;font-weight:600')}>Units completed / hour</span>
            <span style={sx('font-size:11.5px;color:var(--color-text-subtle);font-family:var(--font-mono)')}>last 12h</span>
          </div>
          <div style={sx('display:flex;align-items:flex-end;gap:8px;height:200px')}>
            {v.throughput.map((b) => (
              <div key={b.label} title={`${b.label}:00 · ${b.h}`} style={sx('flex:1;display:flex;flex-direction:column;align-items:center;gap:6px;height:100%;justify-content:flex-end')}>
                <div style={sx(`width:100%;border-radius:5px 5px 0 0;background:${b.fill};height:${b.h}%;transition:height .5s;position:relative`)}>
                  {b.cur && (
                    <span style={sx('position:absolute;inset:0;border-radius:5px 5px 0 0;overflow:hidden')}>
                      <span style={sx('position:absolute;top:0;left:0;width:30%;height:100%;background:linear-gradient(90deg,transparent,rgba(255,255,255,.35),transparent);animation:lyra-sweep 2s linear infinite')} />
                    </span>
                  )}
                </div>
                <span style={sx(AXIS)}>{b.label}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={sx(CARD + ';padding:18px')}>
          <div style={sx('font-size:13px;font-weight:600;margin-bottom:16px')}>Utilization by zone</div>
          <MeterList items={v.utilization} value={(u) => u.pct + '%'} gap={14} />
        </div>
      </div>

      <div style={sx('display:grid;grid-template-columns:1.4fr 1fr 1fr;gap:16px;margin-top:16px')}>
        <div style={sx(CARD + ';padding:18px')}>
          <div style={sx('display:flex;align-items:center;justify-content:space-between;margin-bottom:14px')}>
            <span style={sx('font-size:13px;font-weight:600')}>Fleet uptime — 7 days</span>
            <span style={sx('font-family:var(--font-mono);font-size:12px;color:var(--color-text-success)')}>{v.uptimeLast}</span>
          </div>
          <svg viewBox="0 0 280 90" preserveAspectRatio="none" style={sx('width:100%;height:104px;display:block')}>
            <polyline points={v.uptimeArea} fill="color-mix(in srgb,var(--color-action-primary) 12%,transparent)" stroke="none" />
            <polyline points={v.uptimePts} fill="none" stroke="var(--color-action-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
          </svg>
          <div style={sx('display:flex;justify-content:space-between;margin-top:8px')}>
            {v.uptimeDays.map((d) => <span key={d} style={sx(AXIS)}>{d}</span>)}
          </div>
        </div>
        <div style={sx(CARD + ';padding:18px')}>
          <div style={sx('font-size:13px;font-weight:600;margin-bottom:16px')}>MTBF by model</div>
          <MeterList items={v.mtbfByModel} value={(m) => m.mtbf} color="var(--blue-500)" gap={15} />
        </div>
        <div style={sx(CARD + ';padding:18px')}>
          <div style={sx('font-size:13px;font-weight:600;margin-bottom:16px')}>Charge cycles / day</div>
          <div style={sx('display:flex;align-items:flex-end;gap:8px;height:150px')}>
            {v.chargeCycles.map((b) => (
              <div key={b.label} style={sx('flex:1;display:flex;flex-direction:column;align-items:center;gap:6px;height:100%;justify-content:flex-end')}>
                <span style={sx('font-family:var(--font-mono);font-size:10px;color:var(--color-text-subtle)')}>{b.v}</span>
                <div style={sx(`width:100%;border-radius:5px 5px 0 0;background:${b.fill};height:${b.h}%;transition:height .5s`)} />
                <span style={sx(AXIS)}>{b.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
