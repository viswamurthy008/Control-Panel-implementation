import React from 'react';
import { sx } from '../ui.jsx';

export default function Toasts({ toasts }) {
  return (
    <div role="status" aria-live="polite" style={sx('position:fixed;right:22px;bottom:22px;z-index:60;display:flex;flex-direction:column;gap:10px;align-items:flex-end')}>
      {toasts.map((t) => (
        <div key={t.id} style={sx(`display:flex;align-items:center;gap:11px;min-width:240px;max-width:360px;padding:12px 15px;background:var(--color-bg-default);border:1px solid var(--color-border-default);border-left:3px solid ${t.accent};border-radius:10px;box-shadow:0 10px 28px rgba(0,0,0,.2);animation:lyra-rise .2s ease`)}>
          <span style={sx(`width:7px;height:7px;border-radius:9999px;background:${t.accent};flex:none`)} />
          <span style={sx('font-size:13px;font-weight:500')}>{t.msg}</span>
        </div>
      ))}
    </div>
  );
}
