import React from 'react';
import { sx, Icon, PageHeader, Segmented, CARD, LABEL, RISE } from '../ui.jsx';

const pos = (o) => `position:absolute;left:${o.x}%;top:${o.y}%`;
const NOGO = 'repeating-linear-gradient(45deg,transparent,transparent 5px,color-mix(in srgb,var(--red-500) 15%,transparent) 5px,color-mix(in srgb,var(--red-500) 15%,transparent) 10px)';

function Legend({ heat }) {
  const dot = (color) => <span style={sx(`width:9px;height:9px;border-radius:9999px;background:${color}`)} />;
  const item = (key, swatch, label) => <span key={key} style={sx('display:flex;align-items:center;gap:6px')}>{swatch}{label}</span>;
  return (
    <div style={sx('display:flex;gap:18px;flex-wrap:wrap;margin-top:14px;font-size:12px;color:var(--color-text-subtle)')}>
      {item('a', dot('var(--green-500)'), 'Active')}
      {item('c', dot('var(--blue-500)'), 'Charging')}
      {item('i', dot('var(--gray-400)'), 'Idle')}
      {item('f', dot('var(--red-500)'), 'Fault')}
      {item('p', <Icon name="person" size={13} stroke="var(--yellow-500)" width={2.4} />, 'Personnel')}
      {item('n', <span style={sx('width:15px;height:9px;border-radius:2px;border:1px dashed var(--red-500);background:repeating-linear-gradient(45deg,transparent,transparent 3px,color-mix(in srgb,var(--red-500) 18%,transparent) 3px,color-mix(in srgb,var(--red-500) 18%,transparent) 6px)')} />, 'No-go zone')}
      {item('d', <span style={sx('width:13px;height:8px;border-radius:2px;border:1.5px solid var(--green-500)')} />, 'Charge dock')}
      {heat && (
        <span style={sx('display:flex;align-items:center;gap:7px;margin-left:auto')}>
          <span style={sx('font-family:var(--font-mono);font-size:11px')}>low</span>
          <span style={sx('width:60px;height:9px;border-radius:9999px;background:linear-gradient(90deg,color-mix(in srgb,var(--green-500) 45%,transparent),color-mix(in srgb,var(--yellow-500) 62%,transparent),color-mix(in srgb,var(--red-500) 72%,transparent))')} />
          <span style={sx('font-family:var(--font-mono);font-size:11px')}>high density</span>
        </span>
      )}
    </div>
  );
}

export default function MapView({ v }) {
  return (
    <div style={sx(RISE)}>
      <PageHeader title="Floor map" subtitle="Building 4 — spatial view · positions update live">
        <Segmented options={[
          { key: 'live', onClick: v.setMapLive, style: v.mapLiveStyle, icon: <Icon name="target" size={14} width={2.2} />, label: 'Live' },
          { key: 'heat', onClick: v.setMapHeat, style: v.mapHeatStyle, icon: <Icon name="heat" size={14} width={2.2} />, label: 'Congestion' },
        ]} />
      </PageHeader>
      <div style={sx('display:grid;grid-template-columns:1fr 260px;gap:16px')}>
        <div style={sx(CARD + ';padding:16px')}>
          <div style={sx('position:relative;width:100%;padding-top:56%;border-radius:8px;background:var(--color-bg-subtle);overflow:hidden;background-image:linear-gradient(var(--color-border-default) 1px,transparent 1px),linear-gradient(90deg,var(--color-border-default) 1px,transparent 1px);background-size:5% 8.9%')}>
            <div style={sx('position:absolute;inset:0')}>
              {v.zonesLayout.map((z) => (
                <div key={z.id} style={sx(`${pos(z)};width:${z.w}%;height:${z.h}%;border:1px solid ${z.border};background:${z.fill};border-radius:6px`)}>
                  <span style={sx(`position:absolute;top:6px;left:8px;font-size:10.5px;font-weight:600;letter-spacing:.04em;text-transform:uppercase;color:${z.color}`)}>{z.name}</span>
                  <span style={sx('position:absolute;bottom:6px;left:8px;font-size:10px;color:var(--color-text-placeholder);font-family:var(--font-mono)')}>{z.kind}</span>
                </div>
              ))}
              {v.isMapHeat && v.heatCells.map((c) => (
                <div key={c.idx} style={sx(`${pos(c)};width:${c.w}%;height:${c.h}%;background:${c.color};transition:background .4s`)} />
              ))}
              {v.noGoZones.map((z) => (
                <div key={z.name} title={z.name} style={sx(`${pos(z)};width:${z.w}%;height:${z.h}%;border-radius:4px;border:1px dashed var(--red-500);background:${NOGO}`)} />
              ))}
              {v.dockMarkers.map((d) => (
                <div key={d.id} title={d.title} style={sx(`${pos(d)};transform:translate(-50%,-50%);width:13px;height:8px;border-radius:2px;background:${d.color};border:1.5px solid ${d.border}`)} />
              ))}
              {!v.isMapHeat && (
                <>
                  {v.humans.map((h) => (
                    <div key={h.uid} style={sx(`${pos(h)};transform:translate(-50%,-50%);display:flex;flex-direction:column;align-items:center;gap:2px`)}>
                      <Icon name="person" size={15} stroke="var(--yellow-500)" width={2.4} />
                    </div>
                  ))}
                  {v.mapRobots.map((r) => (
                    <div key={r.uid} onClick={r.open} title={r.id} style={sx(`${pos(r)};transform:translate(-50%,-50%);width:44px;height:44px;cursor:pointer;transition:left 1.3s linear,top 1.3s linear`)}>
                      <span style={sx(`position:absolute;inset:14px;border-radius:9999px;background:${r.color};box-shadow:0 0 0 2px var(--color-bg-default);${r.pulse}`)} />
                      {r.isFault && <span style={sx('position:absolute;inset:11px;border-radius:9999px;border:2px solid var(--red-500);animation:lyra-ring 1.4s ease-out infinite')} />}
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
          <Legend heat={v.isMapHeat} />
        </div>

        <div style={sx('display:flex;flex-direction:column;gap:12px')}>
          <div style={sx(CARD + ';padding:15px 16px')}>
            <div style={sx(LABEL + ';margin-bottom:10px')}>Safety state</div>
            <div style={sx('display:flex;flex-direction:column;gap:11px')}>
              <div style={sx('display:flex;align-items:center;justify-content:space-between')}><span style={sx('font-size:13px')}>E-stops engaged</span><span style={sx(`font-family:var(--font-mono);font-weight:600;color:${v.safety.estopColor}`)}>{v.safety.estops}</span></div>
              <div style={sx('display:flex;align-items:center;justify-content:space-between')}><span style={sx('font-size:13px')}>Personnel in zones</span><span style={sx('font-family:var(--font-mono);font-weight:600;color:var(--color-text-warning)')}>{v.safety.humans}</span></div>
              <div style={sx('display:flex;align-items:center;justify-content:space-between')}><span style={sx('font-size:13px')}>Speed-limited zones</span><span style={sx('font-family:var(--font-mono);font-weight:600')}>{v.safety.slowed}</span></div>
            </div>
          </div>
          <div style={sx(CARD + ';padding:15px 16px;flex:1')}>
            <div style={sx(LABEL + ';margin-bottom:10px')}>Zone density</div>
            <div style={sx('display:flex;flex-direction:column;gap:11px')}>
              {v.zoneStats.map((z) => (
                <div key={z.id}>
                  <div style={sx('display:flex;justify-content:space-between;font-size:12.5px;margin-bottom:4px')}><span style={sx('color:var(--color-text-subtle);white-space:nowrap')}>{z.name}</span><span style={sx('font-family:var(--font-mono)')}>{z.count}</span></div>
                  <div style={sx('height:5px;border-radius:9999px;background:var(--color-bg-muted);overflow:hidden')}><div style={sx(`height:100%;width:${z.pct}%;background:${z.color};border-radius:9999px`)} /></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
