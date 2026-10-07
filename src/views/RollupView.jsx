import React from 'react';
import { sx, PageHeader, KpiGrid, Bar, CARD, RISE, TH, PANEL_HEAD } from '../ui.jsx';

const COLS = 'display:grid;grid-template-columns:1fr 70px 84px 74px;gap:12px';

export default function RollupView({ v }) {
  return (
    <div style={sx(RISE)}>
      <PageHeader title="Plant rollup" subtitle={`Manager view · ${v.curPlantName} · shift B to date`} />
      <KpiGrid items={v.rollupKpis} />
      <div style={sx('display:grid;grid-template-columns:1.5fr 1fr;gap:16px')}>
        <div style={sx(CARD + ';overflow:hidden')}>
          <div style={sx(PANEL_HEAD)}>Line performance</div>
          <div style={sx(`${COLS};padding:9px 18px;border-bottom:1px solid var(--color-border-default);${TH};white-space:nowrap`)}>
            <span>Line</span><span style={sx('text-align:right')}>Units</span><span style={sx('text-align:right')}>Units/hr</span><span style={sx('text-align:right')}>OEE</span>
          </div>
          {v.rollLines.map((l) => (
            <div key={l.name} style={sx('padding:12px 18px;border-bottom:1px solid var(--color-border-default)')}>
              <div style={sx(`${COLS};align-items:center;font-size:13px;margin-bottom:8px`)}>
                <span style={sx('display:flex;align-items:center;gap:9px;font-weight:500')}><span style={sx(`width:8px;height:8px;border-radius:2px;background:${l.color};flex:none`)} />{l.name}</span>
                <span style={sx('font-family:var(--font-mono);text-align:right;color:var(--color-text-subtle)')}>{l.units}</span>
                <span style={sx('font-family:var(--font-mono);text-align:right;color:var(--color-text-subtle)')}>{l.unitsHr}</span>
                <span style={sx(`font-family:var(--font-mono);text-align:right;font-weight:600;color:${l.oeeColor}`)}>{l.oee}%</span>
              </div>
              <Bar pct={l.oee} color={l.oeeColor} />
            </div>
          ))}
        </div>
        <div style={sx(CARD + ';padding:18px')}>
          <div style={sx('font-size:13px;font-weight:600;margin-bottom:18px')}>Output by shift</div>
          <div style={sx('display:flex;align-items:flex-end;gap:16px;height:190px')}>
            {v.shiftBars.map((b) => (
              <div key={b.label} style={sx('flex:1;display:flex;flex-direction:column;align-items:center;gap:8px;height:100%;justify-content:flex-end')}>
                <div style={sx(`width:100%;border-radius:6px 6px 0 0;background:${b.fill};height:${b.h}%;transition:height .5s`)} />
                <span style={sx('font-size:11px;color:var(--color-text-subtle)')}>{b.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
