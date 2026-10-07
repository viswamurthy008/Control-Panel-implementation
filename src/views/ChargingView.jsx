import React from 'react';
import { sx, hv, PageHeader, KpiGrid, CARD, RISE, BTN_OUTLINE, HOVER_MUTED } from '../ui.jsx';

function Bay({ b }) {
  return (
    <div style={sx('background:var(--color-bg-subtle);border:1px solid var(--color-border-default);border-radius:11px;padding:13px 14px')}>
      <div style={sx('display:flex;align-items:center;justify-content:space-between;margin-bottom:12px')}>
        <span style={sx('font-family:var(--font-mono);font-weight:600;font-size:12.5px')}>{b.id}</span>
        <span style={sx('font-size:10px;font-weight:600;letter-spacing:.03em;text-transform:uppercase;padding:2px 7px;border-radius:9999px;background:var(--color-bg-muted);color:var(--color-text-subtle)')}>{b.type}</span>
      </div>
      {b.charging && (
        <div onClick={b.open} style={sx('display:flex;align-items:center;gap:13px;cursor:pointer')}>
          <div style={sx(`width:62px;height:62px;border-radius:9999px;background:conic-gradient(${b.ringColor} ${b.soc}%, var(--color-bg-muted) 0);display:grid;place-items:center;flex:none`)}>
            <div style={sx('width:46px;height:46px;border-radius:9999px;background:var(--color-bg-default);display:grid;place-items:center;font-family:var(--font-mono);font-weight:600;font-size:13px')}>{b.socLabel}</div>
          </div>
          <div style={sx('min-width:0')}>
            <div style={sx('font-family:var(--font-mono);font-weight:600;font-size:13px;white-space:nowrap')}>{b.robot}</div>
            <div style={sx('font-size:11.5px;color:var(--color-text-subtle);margin-top:3px')}>{b.rate}</div>
            <div style={sx('font-size:11.5px;color:var(--color-text-subtle);font-family:var(--font-mono)')}>full {b.eta}</div>
          </div>
        </div>
      )}
      {b.available && (
        <div style={sx('height:62px;border:1.5px dashed var(--color-border-default);border-radius:10px;display:grid;place-items:center;color:var(--color-text-placeholder);font-size:12px')}>Available</div>
      )}
      {b.offline && (
        <div style={sx('height:62px;border-radius:10px;display:grid;place-items:center;background:color-mix(in srgb,var(--gray-500) 12%,transparent);color:var(--color-text-subtle);font-size:12px')}>Offline · service</div>
      )}
    </div>
  );
}

export default function ChargingView({ v }) {
  const { chg } = v;
  return (
    <div style={sx(RISE)}>
      <PageHeader title="Charging & docks" subtitle={`Charge dock · ${chg.occupied} of ${chg.bayCount} bays in use · ${chg.draw} kW draw`} />
      <KpiGrid items={v.chgKpis} />
      <div style={sx(CARD + ';padding:14px 18px;margin-bottom:16px;display:flex;align-items:center;gap:16px;flex-wrap:wrap')}>
        <div style={sx('font-size:12px;font-weight:600;color:var(--color-text-subtle);white-space:nowrap')}>Power draw</div>
        <div style={sx('flex:1;min-width:200px;height:10px;border-radius:9999px;overflow:hidden;background:var(--color-bg-muted)')}><div style={sx(`height:100%;width:${chg.drawPct}%;background:var(--color-action-primary);border-radius:9999px;transition:width .5s`)} /></div>
        <div style={sx('font-family:var(--font-mono);font-size:12.5px')}><b>{chg.draw}</b> / {chg.cap} kW</div>
      </div>
      <div style={sx('display:grid;grid-template-columns:1fr 300px;gap:16px;align-items:start')}>
        <div style={sx(CARD + ';padding:18px')}>
          <div style={sx('font-size:13px;font-weight:600;margin-bottom:14px')}>Dock bays</div>
          <div style={sx('display:grid;grid-template-columns:repeat(auto-fill,minmax(184px,1fr));gap:12px')}>
            {v.chgBays.map((b) => <Bay key={b.id} b={b} />)}
          </div>
        </div>
        <div style={sx(CARD + ';overflow:hidden')}>
          <div style={sx('padding:14px 18px;font-size:13px;font-weight:600;border-bottom:1px solid var(--color-border-default);display:flex;align-items:center;justify-content:space-between')}>
            Charge queue<span style={sx('font-family:var(--font-mono);font-size:12px;color:var(--color-text-subtle)')}>{v.chgQueue.length}</span>
          </div>
          {v.chgQueue.length > 0 ? v.chgQueue.map((q) => (
            <div key={q.uid} style={sx('display:flex;align-items:center;gap:11px;padding:12px 16px;border-bottom:1px solid var(--color-border-default)')}>
              <div style={sx('flex:1;min-width:0')}>
                <div style={sx('font-family:var(--font-mono);font-weight:600;font-size:12.5px')}>{q.id}</div>
                <div style={sx('font-size:11.5px;color:var(--color-text-subtle);white-space:nowrap;overflow:hidden;text-overflow:ellipsis')}>{q.zone}</div>
              </div>
              <span style={sx(`font-family:var(--font-mono);font-size:12px;font-weight:600;color:${q.battColor}`)}>{q.batt}</span>
              <button onClick={q.send} className={hv(HOVER_MUTED)} style={sx(BTN_OUTLINE + ';padding:5px 10px;border-radius:7px;font-size:11.5px;white-space:nowrap')}>Dock</button>
            </div>
          )) : (
            <div style={sx('padding:32px 18px;text-align:center;color:var(--color-text-placeholder);font-size:12.5px')}>No units waiting for a dock.</div>
          )}
        </div>
      </div>
    </div>
  );
}
