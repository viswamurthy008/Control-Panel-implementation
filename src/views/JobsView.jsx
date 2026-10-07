import React from 'react';
import { sx, PageHeader, RISE } from '../ui.jsx';

export default function JobsView({ v }) {
  return (
    <div style={sx(RISE)}>
      <PageHeader title="Job queue" subtitle={`Scheduling across the floor · ${v.jobCount} jobs today`} />
      <div style={sx('display:grid;grid-template-columns:repeat(4,1fr);gap:14px;align-items:start')}>
        {v.jobColumns.map((col) => (
          <div key={col.id} style={sx('background:var(--color-bg-subtle);border:1px solid var(--color-border-default);border-radius:12px;padding:12px;min-height:120px')}>
            <div style={sx('display:flex;align-items:center;gap:8px;margin-bottom:12px;padding:0 2px')}>
              <span style={sx(`width:8px;height:8px;border-radius:2px;background:${col.color}`)} />
              <span style={sx('font-size:12.5px;font-weight:600;white-space:nowrap')}>{col.title}</span>
              <span style={sx('font-family:var(--font-mono);font-size:11.5px;color:var(--color-text-subtle);margin-left:auto')}>{col.count}</span>
            </div>
            <div style={sx('display:flex;flex-direction:column;gap:10px')}>
              {col.jobs.map((j) => (
                <div key={j.id} style={sx('background:var(--color-bg-default);border:1px solid var(--color-border-default);border-radius:10px;padding:11px 12px')}>
                  <div style={sx('display:flex;align-items:center;justify-content:space-between;margin-bottom:6px')}>
                    <span style={sx('font-family:var(--font-mono);font-size:11px;color:var(--color-text-placeholder)')}>{j.id}</span>
                    <span style={sx(j.prioStyle)}>{j.priority}</span>
                  </div>
                  <div style={sx('font-size:13px;font-weight:500;margin-bottom:8px;line-height:1.3')}>{j.title}</div>
                  {j.showBar && (
                    <div style={sx('height:5px;border-radius:9999px;background:var(--color-bg-muted);overflow:hidden;margin-bottom:9px')}>
                      <div style={sx(`height:100%;width:${j.progress}%;background:var(--color-action-primary);border-radius:9999px;transition:width .5s`)} />
                    </div>
                  )}
                  <div style={sx('display:flex;align-items:center;justify-content:space-between;font-size:11.5px;color:var(--color-text-subtle)')}>
                    <span style={sx('font-family:var(--font-mono)')}>{j.robot}</span>
                    <span>{j.meta}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
