import React from 'react';
import { sx, hv, BackButton, Timeline, CARD, LABEL, RISE, BTN_OUTLINE, BTN_PRIMARY, PANEL_HEAD, HOVER_MUTED, HOVER_SUBTLE, HOVER_PRIMARY } from '../ui.jsx';

const ACTION = 'min-height:44px;min-width:44px;' + BTN_OUTLINE + ';padding:9px 15px;border-radius:8px;font-size:13px';

export default function IncidentView({ v }) {
  const inc = v.inc;
  return (
    <div style={sx(RISE)}>
      <BackButton onClick={() => v.go('alerts')} label="Back to alerts" />
      <div style={sx('display:flex;align-items:center;gap:14px;margin-bottom:18px')}>
        <span style={sx(`width:34px;height:34px;border-radius:10px;display:grid;place-items:center;flex:none;font-weight:700;font-size:17px;background:${inc.tint};color:${inc.tone}`)}>{inc.glyph}</span>
        <div style={sx('flex:1;min-width:0')}>
          <h1 style={sx('margin:0;font-size:20px;font-weight:600;letter-spacing:-.01em;line-height:1.25')}>{inc.title}</h1>
          <p style={sx('margin:3px 0 0;font-size:12.5px;color:var(--color-text-subtle)')}><span style={sx('font-family:var(--font-mono)')}>{inc.robot}</span> · {inc.zone} · {inc.time}</p>
        </div>
        <span style={sx(inc.chip)}>{inc.chipLabel}</span>
      </div>

      <div style={sx('display:grid;grid-template-columns:1.4fr 1fr;gap:16px;margin-bottom:16px;align-items:start')}>
        <div style={sx('display:flex;flex-direction:column;gap:16px')}>
          <div style={sx(CARD + ';padding:18px')}>
            <div style={sx('font-size:13px;font-weight:600;margin-bottom:16px')}>Root-cause timeline</div>
            <Timeline items={inc.timeline} />
          </div>
          <div style={sx(`${CARD};border-left:3px solid ${inc.tone};padding:16px 18px`)}>
            <div style={sx(LABEL + ';margin-bottom:7px')}>Recommended action</div>
            <div style={sx('font-size:13.5px;line-height:1.45')}>{inc.recommended}</div>
          </div>
        </div>

        <div style={sx('display:flex;flex-direction:column;gap:16px')}>
          <div style={sx(CARD + ';padding:16px 18px')}>
            <div style={sx('font-size:13px;font-weight:600;margin-bottom:12px')}>Details</div>
            <div style={sx('display:flex;flex-direction:column;gap:10px')}>
              {inc.details.map((d) => (
                <div key={d.label} style={sx('display:flex;justify-content:space-between;font-size:13px;gap:12px')}>
                  <span style={sx('color:var(--color-text-subtle)')}>{d.label}</span>
                  <span style={sx('font-family:var(--font-mono);text-align:right')}>{d.value}</span>
                </div>
              ))}
            </div>
          </div>
          {inc.hasRobot && (
            <div style={sx(CARD + ';padding:16px 18px')}>
              <div style={sx('font-size:13px;font-weight:600;margin-bottom:12px')}>Telemetry snapshot</div>
              <div style={sx('display:grid;grid-template-columns:1fr 1fr;gap:10px')}>
                {inc.snapshot.map((t) => (
                  <div key={t.label} style={sx('background:var(--color-bg-subtle);border-radius:9px;padding:10px 12px')}>
                    <div style={sx('font-size:10.5px;color:var(--color-text-placeholder);text-transform:uppercase;letter-spacing:.05em;font-weight:600')}>{t.label}</div>
                    <div style={sx('font-size:17px;font-weight:600;font-family:var(--font-mono);margin-top:4px')}>{t.value}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {inc.affected.length > 0 && (
            <div style={sx(CARD + ';overflow:hidden')}>
              <div style={sx(PANEL_HEAD + ';padding:13px 18px')}>Affected units</div>
              {inc.affected.map((r) => (
                <div key={r.uid} onClick={r.open} className={hv(HOVER_SUBTLE)} style={sx('min-height:44px;display:flex;align-items:center;gap:10px;padding:11px 18px;border-bottom:1px solid var(--color-border-default);cursor:pointer')}>
                  <span style={sx('font-family:var(--font-mono);font-weight:600;font-size:12.5px')}>{r.id}</span>
                  <span style={sx('font-size:11.5px;color:var(--color-text-subtle);flex:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis')}>{r.model}</span>
                  <span style={sx(r.badge)}>{r.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div style={sx(CARD + ';display:flex;gap:10px;flex-wrap:wrap;padding:14px 18px')}>
        {inc.hasRobot && <button onClick={inc.openRobot} className={hv(HOVER_MUTED)} style={sx(ACTION)}>Open robot</button>}
        <button onClick={inc.onAssign} className={hv(HOVER_MUTED)} style={sx(ACTION)}>Assign to tech</button>
        <span style={sx('flex:1')} />
        <button onClick={inc.onAck} className={hv(HOVER_MUTED)} style={sx(ACTION)}>Acknowledge</button>
        <button onClick={inc.onResolve} className={hv(HOVER_PRIMARY)} style={sx('min-height:44px;min-width:44px;' + BTN_PRIMARY + ';padding:9px 15px;border-radius:8px;font-size:13px')}>Resolve incident</button>
      </div>
    </div>
  );
}
