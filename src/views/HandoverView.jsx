import React from 'react';
import { sx, hv, PageHeader, KpiGrid, CARD, RISE, BTN_PRIMARY, PANEL_HEAD, HOVER_SUBTLE, HOVER_PRIMARY } from '../ui.jsx';

export default function HandoverView({ v }) {
  return (
    <div style={sx(RISE)}>
      <PageHeader title="Shift handover" subtitle={`End of shift B · ${v.curPlantName} · prepared for shift C`} />
      <KpiGrid items={v.hoKpis} />
      <div style={sx('display:grid;grid-template-columns:1.5fr 1fr;gap:16px;align-items:start')}>
        <div style={sx('display:flex;flex-direction:column;gap:16px')}>
          <div style={sx(CARD + ';overflow:hidden')}>
            <div style={sx(PANEL_HEAD + ';display:flex;align-items:center;justify-content:space-between')}>
              Carryover to next shift<span style={sx('font-family:var(--font-mono);font-size:12px;color:var(--color-text-subtle)')}>{v.carryover.length}</span>
            </div>
            {v.carryover.map((c) => (
              <div key={c.key} style={sx('display:flex;align-items:flex-start;gap:12px;padding:13px 18px;border-bottom:1px solid var(--color-border-default)')}>
                <span style={sx(`width:8px;height:8px;border-radius:9999px;background:${c.tone};flex:none;margin-top:5px`)} />
                <div style={sx('flex:1;min-width:0')}>
                  <div style={sx('font-size:13px;font-weight:500;line-height:1.3')}>{c.label}</div>
                  <div style={sx('font-size:11.5px;color:var(--color-text-subtle);margin-top:2px')}><span style={sx('font-family:var(--font-mono)')}>{c.meta}</span></div>
                </div>
                <span style={sx('font-size:10px;font-weight:600;letter-spacing:.03em;text-transform:uppercase;padding:2px 8px;border-radius:9999px;background:var(--color-bg-muted);color:var(--color-text-subtle);flex:none;white-space:nowrap')}>{c.kind}</span>
              </div>
            ))}
          </div>
          <div style={sx(CARD + ';overflow:hidden')}>
            <div style={sx(PANEL_HEAD)}>Watch list</div>
            {v.hoWatch.map((r) => (
              <div key={r.uid} onClick={r.open} className={hv(HOVER_SUBTLE)} style={sx('min-height:44px;display:flex;align-items:center;gap:11px;padding:11px 18px;border-bottom:1px solid var(--color-border-default);cursor:pointer')}>
                <span style={sx(`width:8px;height:8px;border-radius:9999px;background:${r.healthColor};flex:none`)} />
                <span style={sx('font-family:var(--font-mono);font-weight:600;font-size:12.5px')}>{r.id}</span>
                <span style={sx('font-size:12px;color:var(--color-text-subtle);flex:1')}>{r.health}</span>
                <span style={sx(`font-family:var(--font-mono);font-size:12px;font-weight:600;color:${r.serviceColor}`)}>{r.service}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={sx('display:flex;flex-direction:column;gap:16px')}>
          <div style={sx(CARD + ';padding:16px 18px')}>
            <div style={sx('font-size:13px;font-weight:600;margin-bottom:6px')}>Shift notes</div>
            <p style={sx('margin:0 0 10px;font-size:11.5px;color:var(--color-text-subtle)')}>Anything the incoming supervisor should know.</p>
            <textarea
              value={v.handoverNotes}
              onChange={v.onHandoverNote}
              placeholder="e.g. HX-224 isolated in weld cells, awaiting actuator swap. Pick zone running one unit short."
              style={sx('width:100%;min-height:132px;resize:vertical;box-sizing:border-box;border:1px solid var(--color-border-default);border-radius:9px;background:var(--color-bg-subtle);color:var(--color-text-default);font-family:var(--font-sans);font-size:13px;line-height:1.5;padding:11px 12px;outline:none')}
            />
          </div>
          <div style={sx(CARD + ';padding:16px 18px')}>
            <div style={sx('font-size:13px;font-weight:600;margin-bottom:12px')}>Sign-off</div>
            <div style={sx('display:flex;flex-direction:column;gap:10px;margin-bottom:15px')}>
              {v.hoChecklist.map((c) => (
                <label key={c.label} style={sx('display:flex;align-items:center;gap:10px;font-size:13px;cursor:pointer')}>
                  <input type="checkbox" checked={c.done} onChange={c.toggle} style={sx('width:16px;height:16px;accent-color:var(--color-action-primary);cursor:pointer')} />
                  <span style={sx(c.textStyle)}>{c.label}</span>
                </label>
              ))}
            </div>
            <button onClick={v.signHandover} className={hv(HOVER_PRIMARY)} style={sx('min-height:44px;min-width:44px;' + BTN_PRIMARY + ';width:100%;padding:11px;border-radius:9px;font-size:13.5px')}>Complete handover</button>
            <div style={sx('display:flex;align-items:center;gap:8px;margin-top:12px;font-size:12px;color:var(--color-text-subtle)')}>
              <div style={sx('width:26px;height:26px;border-radius:9999px;background:var(--color-bg-brand-subtle);color:var(--color-text-brand);display:grid;place-items:center;font-weight:600;font-size:11px;flex:none')}>RM</div>
              <span>Outgoing: R. Marín · Incoming: T. Osei</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
