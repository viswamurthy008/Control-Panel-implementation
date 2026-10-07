import React from 'react';
import { sx, hv, PageHeader, CARD, LABEL, RISE, BTN_OUTLINE, BTN_PRIMARY, HOVER_MUTED, HOVER_SUBTLE, HOVER_PRIMARY } from '../ui.jsx';

function SevCard({ label, color, value }) {
  return (
    <div style={sx(`${CARD};border-left:3px solid ${color};padding:14px 16px`)}>
      <div style={sx(LABEL)}>{label}</div>
      <div style={sx(`font-size:26px;font-weight:600;font-family:var(--font-mono);margin-top:4px;color:${color}`)}>{value}</div>
    </div>
  );
}

function Incidents({ v }) {
  return (
    <>
      <div style={sx('display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-bottom:16px')}>
        <SevCard label="Critical" color="var(--red-500)" value={v.sevCounts.critical} />
        <SevCard label="Warning" color="var(--yellow-500)" value={v.sevCounts.warning} />
        <SevCard label="Info" color="var(--blue-500)" value={v.sevCounts.info} />
      </div>
      <div style={sx(CARD + ';overflow:hidden')}>
        {v.alertList.map((a) => (
          <div key={a.id} onClick={a.onOpen} className={hv(HOVER_SUBTLE)} style={sx(a.rowStyle)}>
            <span style={sx(`width:26px;height:26px;border-radius:8px;display:grid;place-items:center;flex:none;font-weight:700;font-size:14px;background:${a.tint};color:${a.tone}`)}>{a.glyph}</span>
            <div style={sx('flex:1;min-width:0')}>
              <div style={sx('font-size:13.5px;font-weight:500')}>{a.msg}</div>
              <div style={sx('font-size:11.5px;color:var(--color-text-subtle);margin-top:2px')}><span style={sx('font-family:var(--font-mono)')}>{a.robot}</span> · {a.zone} · {a.time}</div>
            </div>
            {a.open && (
              <div style={sx('display:flex;gap:8px;flex:none')}>
                <button onClick={a.onAck} className={hv(HOVER_MUTED)} style={sx('min-height:44px;min-width:44px;' + BTN_OUTLINE + ';padding:5px 11px;border-radius:7px;font-size:12px')}>Ack</button>
                <button onClick={a.onResolve} className={hv(HOVER_PRIMARY)} style={sx('min-height:44px;min-width:44px;' + BTN_PRIMARY + ';border:1px solid transparent;padding:5px 11px;border-radius:7px;font-size:12px;font-weight:500')}>Resolve</button>
              </div>
            )}
            {a.acked && <span style={sx('font-size:11.5px;color:var(--color-text-subtle);font-family:var(--font-mono);flex:none')}>acknowledged</span>}
          </div>
        ))}
      </div>
    </>
  );
}

function Rules({ v }) {
  const stepBtn = 'min-height:44px;min-width:44px;width:44px;height:44px;border:none;background:transparent;color:var(--color-text-subtle);cursor:pointer;line-height:1;font-family:var(--font-sans)';
  return (
    <div style={sx('display:grid;grid-template-columns:1.35fr 1fr;gap:16px;align-items:start')}>
      <div style={sx(CARD + ';overflow:hidden')}>
        <div style={sx('display:flex;align-items:center;justify-content:space-between;padding:14px 16px;border-bottom:1px solid var(--color-border-default)')}>
          <span style={sx('font-size:13px;font-weight:600')}>Alert rules &amp; thresholds</span>
          <span style={sx('font-size:11.5px;color:var(--color-text-subtle)')}>Conditions that raise an incident</span>
        </div>
        {v.rulesView.map((r) => (
          <div key={r.id} style={sx(r.rowStyle)}>
            <button onClick={r.toggle} aria-label={`Toggle ${r.name}`} aria-pressed={r.enabled} style={sx(r.toggleStyle)}><span style={sx(r.knobStyle)} /></button>
            <div style={sx('flex:1;min-width:0')}>
              <div style={sx('display:flex;align-items:center;gap:8px;margin-bottom:3px')}>
                <span style={sx('font-size:13.5px;font-weight:600')}>{r.name}</span>
                <span style={sx(`padding:1px 8px;border-radius:9999px;font-size:10px;font-weight:600;background:${r.sevBg};color:${r.sevTone}`)}>{r.sevLabel}</span>
              </div>
              <div style={sx('font-size:12px;color:var(--color-text-subtle)')}>{r.display}</div>
              <div style={sx('font-size:11.5px;color:var(--color-text-placeholder);margin-top:3px')}>→ {r.action}</div>
            </div>
            {r.editable && (
              <div style={sx('display:flex;align-items:center;border:1px solid var(--color-border-default);border-radius:8px;overflow:hidden;flex:none')}>
                <button onClick={r.dec} className={hv(HOVER_MUTED)} style={sx(stepBtn + ';font-size:17px')}>−</button>
                <span style={sx('min-width:52px;text-align:center;font-family:var(--font-mono);font-size:13px;font-weight:600')}>{r.valueLabel}</span>
                <button onClick={r.inc} className={hv(HOVER_MUTED)} style={sx(stepBtn + ';font-size:16px;border-left:1px solid var(--color-border-default)')}>+</button>
              </div>
            )}
          </div>
        ))}
      </div>
      <div style={sx(CARD + ';overflow:hidden')}>
        <div style={sx('padding:14px 16px;font-size:13px;font-weight:600;border-bottom:1px solid var(--color-border-default)')}>Notification routing</div>
        {v.routing.map((rt) => (
          <div key={rt.channel} style={sx('padding:13px 16px;border-bottom:1px solid var(--color-border-default)')}>
            <div style={sx('font-size:13px;font-weight:500')}>{rt.channel}</div>
            <div style={sx('font-size:11.5px;color:var(--color-text-subtle);margin-bottom:8px')}>{rt.target}</div>
            <div style={sx('display:flex;gap:6px;flex-wrap:wrap')}>
              {rt.chips.map((c) => <span key={c.label} style={sx(c.style)}>{c.label}</span>)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AlertsView({ v }) {
  return (
    <div style={sx(RISE)}>
      <PageHeader title="Alerts & incidents" subtitle="Live stream and the rules that raise it">
        <div style={sx('display:flex;gap:3px;padding:3px;background:var(--color-bg-muted);border-radius:10px;flex:none')}>
          <button onClick={v.setIncTab} style={sx(v.tabIncStyle)}>Incidents</button>
          <button onClick={v.setRulesTab} style={sx(v.tabRulesStyle)}>Rules &amp; routing</button>
        </div>
      </PageHeader>
      {v.isRulesTab ? <Rules v={v} /> : <Incidents v={v} />}
    </div>
  );
}
