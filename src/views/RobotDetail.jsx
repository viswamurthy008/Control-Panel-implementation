import React from 'react';
import { sx, hv, Icon, BackButton, CARD, RISE, BTN_OUTLINE, HOVER_MUTED } from '../ui.jsx';

const SMALL_LABEL = 'font-size:11px;color:var(--color-text-placeholder);text-transform:uppercase;letter-spacing:.05em;font-weight:600';
const CMD = BTN_OUTLINE + ';padding:9px;border-radius:8px;font-size:13px';
const PAD = 'display:flex;align-items:center;justify-content:center;padding:12px;border-radius:9px;border:1px solid var(--color-border-default);background:transparent;color:var(--color-text-default);cursor:pointer';

function Teleop({ sel }) {
  const pad = (dir, icon, label) => (
    <button onClick={() => sel.drive(dir)} aria-label={label} className={hv(HOVER_MUTED)} style={sx(PAD)}>
      <Icon name={icon} />
    </button>
  );
  return (
    <div style={sx(CARD + ';padding:18px')}>
      <div style={sx('display:flex;align-items:center;justify-content:space-between;margin-bottom:6px')}>
        <span style={sx('font-size:13px;font-weight:600')}>Teleop</span>
        <span style={sx('font-size:10.5px;font-family:var(--font-mono);color:var(--color-text-warning);letter-spacing:.03em')}>MANUAL OVERRIDE</span>
      </div>
      <p style={sx('margin:0 0 14px;font-size:11.5px;color:var(--color-text-subtle)')}>Nudge the unit while paused. Hold for continuous.</p>
      <div style={sx('display:grid;grid-template-columns:repeat(3,1fr);gap:8px;max-width:210px;margin:0 auto')}>
        <span />
        {pad('forward', 'chevUp', 'Forward')}
        <span />
        {pad('rotate left', 'chevLeft', 'Rotate left')}
        <button onClick={() => sel.drive('stop')} className={hv('background:color-mix(in srgb,var(--red-500) 20%,transparent)')} style={sx('display:flex;align-items:center;justify-content:center;padding:12px;border-radius:9px;border:1px solid var(--red-500);background:color-mix(in srgb,var(--red-500) 12%,transparent);color:var(--color-text-danger);cursor:pointer;font-family:var(--font-sans);font-weight:600;font-size:12px')}>Stop</button>
        {pad('rotate right', 'chevRight', 'Rotate right')}
        <span />
        {pad('reverse', 'chevDown', 'Reverse')}
        <span />
      </div>
    </div>
  );
}

export default function RobotDetail({ v }) {
  const sel = v.sel;
  return (
    <div style={sx(RISE)}>
      <BackButton onClick={() => v.go('fleet')} label="Back to fleet" />
      <div style={sx('display:flex;align-items:center;gap:14px;margin-bottom:18px')}>
        <span style={sx('position:relative;width:14px;height:14px;flex:none')}><span style={sx(`position:absolute;inset:0;border-radius:9999px;background:${sel.color};${sel.pulse}`)} /></span>
        <div>
          <h1 style={sx('margin:0;font-size:22px;font-weight:600;font-family:var(--font-mono);letter-spacing:-.01em')}>{sel.id}</h1>
          <p style={sx('margin:2px 0 0;font-size:13px;color:var(--color-text-subtle)')}>{sel.model} · {sel.zoneName} · uptime {sel.uptime}h</p>
        </div>
        <span style={sx(sel.badge + ';margin-left:auto')}>{sel.statusLabel}</span>
      </div>

      <div style={sx('display:grid;grid-template-columns:1.3fr 1fr;gap:16px;margin-bottom:16px')}>
        <div style={sx(CARD + ';padding:18px')}>
          <div style={sx('font-size:13px;font-weight:600;margin-bottom:14px')}>Live task</div>
          <div style={sx('font-size:15px;font-weight:500;margin-bottom:12px')}>{sel.task}</div>
          <div style={sx('height:9px;border-radius:9999px;background:var(--color-bg-muted);overflow:hidden;margin-bottom:8px')}><div style={sx(`height:100%;width:${sel.progress}%;background:var(--color-action-primary);border-radius:9999px;transition:width .5s`)} /></div>
          <div style={sx('display:flex;justify-content:space-between;font-size:12px;color:var(--color-text-subtle);font-family:var(--font-mono)')}><span>{sel.progLabel} complete</span><span>cycle {sel.cycleTime}s</span></div>
          <div style={sx('display:grid;grid-template-columns:repeat(2,1fr);gap:12px;margin-top:18px')}>
            {sel.telemetry.map((t) => (
              <div key={t.label} style={sx('background:var(--color-bg-subtle);border-radius:10px;padding:12px 14px')}>
                <div style={sx(SMALL_LABEL)}>{t.label}</div>
                <div style={sx('font-size:19px;font-weight:600;font-family:var(--font-mono);margin-top:5px')}>{t.value}</div>
              </div>
            ))}
          </div>
          <div style={sx('margin-top:18px;padding-top:16px;border-top:1px solid var(--color-border-default)')}>
            <div style={sx('display:flex;align-items:center;justify-content:space-between;margin-bottom:8px')}>
              <span style={sx(SMALL_LABEL)}>Battery — last 90 min</span>
              <span style={sx('font-family:var(--font-mono);font-size:12px;color:var(--color-text-subtle)')}>{sel.sparkLast}%</span>
            </div>
            <svg viewBox="0 0 200 42" preserveAspectRatio="none" style={sx('width:100%;height:44px;display:block')}>
              <polyline points={sel.spark} fill="none" stroke="var(--color-action-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
            </svg>
          </div>
          <div style={sx('margin-top:16px;display:flex;align-items:center;gap:12px')}>
            <span style={sx(SMALL_LABEL + ';width:110px')}>Next service</span>
            <div style={sx('flex:1;height:6px;border-radius:9999px;background:var(--color-bg-muted);overflow:hidden')}><div style={sx(`height:100%;width:${sel.serviceBar}%;background:${sel.serviceBarColor};border-radius:9999px`)} /></div>
            <span style={sx(`font-family:var(--font-mono);font-size:12.5px;font-weight:600;color:${sel.serviceColor};white-space:nowrap`)}>{sel.nextServiceLabel}</span>
            <span style={sx('font-family:var(--font-mono);font-size:11.5px;color:var(--color-text-subtle);white-space:nowrap')}>MTBF {sel.mtbf}</span>
          </div>
        </div>

        <div style={sx('display:flex;flex-direction:column;gap:16px')}>
          <div style={sx(CARD + ';padding:16px')}>
            <div style={sx('font-size:13px;font-weight:600;margin-bottom:6px')}>Camera feed</div>
            <div style={sx('position:relative;width:100%;padding-top:56%;border-radius:8px;background:var(--gray-800);overflow:hidden')}>
              <div style={sx('position:absolute;inset:0;display:grid;place-items:center;color:var(--gray-500)')}>
                <Icon name="camera" size={30} width={1.8} />
              </div>
              <span style={sx('position:absolute;top:8px;left:9px;display:flex;align-items:center;gap:5px;font-size:10.5px;color:#fff;font-family:var(--font-mono)')}>
                <span style={sx('width:6px;height:6px;border-radius:9999px;background:var(--red-500);animation:lyra-pulse 1.4s infinite')} />REC · head cam
              </span>
            </div>
          </div>
          <div style={sx(CARD + ';padding:16px;flex:1')}>
            <div style={sx('font-size:13px;font-weight:600;margin-bottom:12px')}>Commands</div>
            <div style={sx('display:grid;grid-template-columns:1fr 1fr;gap:9px')}>
              <button onClick={sel.cmdPause} className={hv(HOVER_MUTED)} style={sx(CMD)}>{sel.pauseLabel}</button>
              <button onClick={sel.cmdReassign} className={hv(HOVER_MUTED)} style={sx(CMD)}>Reassign task</button>
              <button onClick={sel.cmdCharge} className={hv(HOVER_MUTED)} style={sx(CMD)}>Send to charge</button>
              <button onClick={sel.cmdRecall} className={hv(HOVER_MUTED)} style={sx(CMD)}>Recall to bay</button>
              <button onClick={sel.cmdEstop} className={hv('filter:brightness(1.05)')} style={sx('grid-column:1/-1;padding:11px;border-radius:8px;border:1px solid var(--red-500);background:var(--red-500);color:#fff;font-size:13px;font-weight:600;cursor:pointer;font-family:var(--font-sans);display:flex;align-items:center;justify-content:center;gap:8px')}>
                <span style={sx('width:9px;height:9px;border-radius:9999px;background:#fff')} />Emergency stop
              </button>
            </div>
          </div>
        </div>
      </div>

      <div style={sx('display:grid;grid-template-columns:1.3fr 1fr;gap:16px;margin-bottom:16px')}>
        <div style={sx(CARD + ';padding:18px')}>
          <div style={sx('font-size:13px;font-weight:600;margin-bottom:14px')}>Joint / actuator status</div>
          <div style={sx('display:grid;grid-template-columns:1fr 1fr;gap:10px')}>
            {sel.joints.map((j) => (
              <div key={j.name} style={sx('display:flex;align-items:center;gap:10px;padding:9px 12px;background:var(--color-bg-subtle);border-radius:9px')}>
                <span style={sx(`width:8px;height:8px;border-radius:9999px;background:${j.dot};flex:none`)} />
                <span style={sx('flex:1;font-size:12.5px;font-weight:500')}>{j.name}</span>
                <span style={sx('font-family:var(--font-mono);font-size:11px;color:var(--color-text-subtle)')}>{j.temp}</span>
                <span style={sx('font-family:var(--font-mono);font-size:11px;color:var(--color-text-subtle);width:34px;text-align:right')}>{j.load}</span>
              </div>
            ))}
          </div>
        </div>
        <Teleop sel={sel} />
      </div>

      <div style={sx(CARD + ';padding:18px')}>
        <div style={sx('font-size:13px;font-weight:600;margin-bottom:12px')}>Event log</div>
        <div style={sx('display:flex;flex-direction:column')}>
          {sel.log.map((e, i) => (
            <div key={sel.log.length - i} style={sx('display:flex;gap:12px;padding:9px 0;border-top:1px solid var(--color-border-default);font-size:12.5px')}>
              <span style={sx('font-family:var(--font-mono);color:var(--color-text-placeholder);flex:none;width:64px')}>{e.time}</span>
              <span style={sx(`width:7px;height:7px;border-radius:9999px;background:${e.color};flex:none;margin-top:5px`)} />
              <span style={sx('flex:1')}>{e.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
