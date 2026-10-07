import React from 'react';
import { sx } from './sx.js';
import {
  ZC, zones, taskPool, models, plantProfiles, makePlants, workOrders, docks,
  noGoZones, parts, routing, initialRules, jobSeed,
} from './data.js';
import Sidebar from './views/Sidebar.jsx';
import Topbar from './views/Topbar.jsx';
import FleetView from './views/FleetView.jsx';
import MapView from './views/MapView.jsx';
import JobsView from './views/JobsView.jsx';
import AlertsView from './views/AlertsView.jsx';
import AnalyticsView from './views/AnalyticsView.jsx';
import RobotDetail from './views/RobotDetail.jsx';
import MaintenanceView from './views/MaintenanceView.jsx';
import RollupView from './views/RollupView.jsx';
import ChargingView from './views/ChargingView.jsx';
import IncidentView from './views/IncidentView.jsx';
import HandoverView from './views/HandoverView.jsx';
import CommandPalette from './views/CommandPalette.jsx';
import Toasts from './views/Toasts.jsx';

const allExpanded = () => zones.reduce((a, z) => (a[z.id] = true, a), {});

const SIDEBAR_KEY = 'orch.sbCollapsed';
function readSidebarCollapsed() {
  try { return localStorage.getItem(SIDEBAR_KEY) === '1'; } catch { return false; }
}
function writeSidebarCollapsed(v) {
  try { localStorage.setItem(SIDEBAR_KEY, v ? '1' : '0'); } catch { /* storage unavailable */ }
}

const HEADER_PAD_FULL = 22;

const NAV_IDS =['fleet', 'map', 'tasks', 'charge', 'alerts', 'analytics', 'maint', 'rollup', 'handover'];

export default class App extends React.Component {
  static defaultProps = { defaultTheme: 'dark', liveTelemetry: true, plantName: '' };

  constructor(props) {
    super(props);
    this.plants = makePlants(props.plantName);
    const robots = this.makeRobots(plantProfiles.mer4);
    this.state = {
      theme: props.defaultTheme === 'light' ? 'light' : 'dark',
      view: 'fleet',
      fleetView: 'cards',
      expandedZones: allExpanded(),
      selected: null,
      zoneFilter: 'all',
      plant: 'mer4',
      plantMenu: false,
      paletteOpen: false,
      paletteQuery: '',
      selectedAlert: null,
      toasts: [],
      robots,
      alerts: this.makeAlerts(robots),
      jobs: this.makeJobs(robots),
      throughput: this.makeThroughput(),
      clock: this.fmtClock(),
      estopAll: false,
      tick: 0,
      handoverNotes: '',
      hoChecks: [false, false, false],
      mapMode: 'live',
      alertTab: 'incidents',
      rules: initialRules,
      sbCollapsed: readSidebarCollapsed(),
      hw: undefined,
    };
    this.toastId = 0;
    this.headerRef = React.createRef();
  }

  rnd(a, b) { return a + Math.random() * (b - a); }
  ri(a, b) { return Math.floor(this.rnd(a, b + 1)); }
  pick(a) { return a[Math.floor(Math.random() * a.length)]; }
  fmtClock() { return new Date().toLocaleTimeString('en-GB', { hour12: false }); }

  makeRobots(profile = {}) {
    const counts = profile.counts || {};
    const idleBias = profile.idleBias != null ? profile.idleBias : 0.14;
    let n = 1; const out = [];
    zones.forEach((z) => {
      const zn = counts[z.id] != null ? counts[z.id] : z.n;
      for (let i = 0; i < zn; i++) {
        let status = 'active';
        if (z.id === 'charge') status = 'charging';
        else if (z.id === 'maint') status = i === 0 ? 'fault' : 'idle';
        else if (Math.random() < idleBias) status = 'idle';
        const pad = 3;
        out.push({
          uid: n, id: 'HX-' + String(200 + n).padStart(3, '0'), model: models[z.id], zoneId: z.id,
          status,
          battery: status === 'charging' ? this.rnd(30, 70) : this.rnd(22, 99),
          progress: status === 'active' ? this.rnd(5, 95) : (status === 'fault' ? this.rnd(20, 80) : 0),
          x: this.rnd(z.x + pad, z.x + z.w - pad),
          y: this.rnd(z.y + pad, z.y + z.h - pad),
          vx: this.rnd(-0.4, 0.4), vy: this.rnd(-0.4, 0.4),
          task: this.pick(taskPool[z.id]),
          cycleTime: this.ri(28, 74),
          uptime: this.ri(6, 190),
          temp: this.ri(34, 52),
          payload: +this.rnd(0, 14).toFixed(1),
          net: this.ri(72, 99),
          safety: status === 'fault' ? 'estop' : 'ok',
          human: false,
          cyclesDone: this.ri(40, 220),
          mtbf: this.ri(160, 920),
          nextService: this.ri(-6, 140),
          pmInterval: this.pick([120, 168, 240]),
          hist: Array.from({ length: 18 }, (_, k) => Math.max(8, Math.min(100, 60 + Math.round(Math.sin(k / 2) * 18) + this.ri(-10, 10)))),
          joints: this.makeJoints(status),
          log: this.seedLog(status),
        });
        n++;
      }
    });
    // put a human near one active pick robot
    const pr = out.find((r) => r.zoneId === 'pick' && r.status === 'active');
    if (pr) { pr.human = true; pr.safety = 'human'; }
    return out;
  }

  seedLog(status) {
    const base = [
      { time: '−2m', color: 'var(--green-500)', text: 'Cycle completed — within tolerance' },
      { time: '−9m', color: 'var(--blue-500)', text: 'Task assigned by scheduler' },
      { time: '−14m', color: 'var(--gray-400)', text: 'Path re-planned around obstacle' },
      { time: '−31m', color: 'var(--green-500)', text: 'Calibration check passed' },
      { time: '−52m', color: 'var(--blue-500)', text: 'Returned from charge dock at 98%' },
    ];
    if (status === 'fault') base.unshift({ time: 'now', color: 'var(--red-500)', text: 'FAULT — joint torque limit exceeded' });
    return base;
  }

  makeJoints(status) {
    const names = ['Neck', 'L-shoulder', 'R-shoulder', 'L-elbow', 'R-elbow', 'Torso', 'L-hip', 'R-hip'];
    return names.map((n, i) => {
      let st = 'ok';
      if (status === 'fault' && i === 1) st = 'fault'; else if (Math.random() < 0.08) st = 'warn';
      return { name: n, st, temp: this.ri(30, 54), load: this.ri(10, 88) };
    });
  }

  zoneById(id) { return zones.find((z) => z.id === id); }
  zoneName(id) { return this.zoneById(id).name; }
  sparkPoints(hist) { const n = hist.length, w = 200, h = 42; return hist.map((v, i) => `${(i / (n - 1) * w).toFixed(1)},${(h - (v / 100) * h).toFixed(1)}`).join(' '); }

  addToast(msg, kind) {
    const id = ++this.toastId;
    this.setState((s) => ({ toasts: [...s.toasts, { id, msg, kind: kind || 'info' }] }));
    setTimeout(() => this.setState((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })), 3200);
  }
  togglePalette(v) { this.setState((s) => ({ paletteOpen: v !== undefined ? v : !s.paletteOpen, paletteQuery: '' })); }
  switchPlant(p) {
    const robots = this.makeRobots(plantProfiles[p.id] || {});
    this.setState({ plant: p.id, plantMenu: false, robots, alerts: this.makeAlerts(robots), jobs: this.makeJobs(robots), throughput: this.makeThroughput(), selected: null, selectedAlert: null, zoneFilter: 'all', view: 'fleet', estopAll: false, expandedZones: allExpanded() });
    this.addToast('Switched to ' + p.name);
  }
  bumpRule(id, delta) {
    this.setState((s) => ({ rules: s.rules.map((r) => {
      if (r.id !== id) return r;
      const cap = r.id === 'temp' ? 90 : 100;
      return { ...r, value: Math.max(0, Math.min(cap, r.value + delta)) };
    }) }));
  }
  toggleRule(id) {
    const cur = this.state.rules.find((r) => r.id === id);
    this.setState((s) => ({ rules: s.rules.map((r) => r.id === id ? { ...r, enabled: !r.enabled } : r) }));
    this.addToast('Rule ' + (cur && cur.enabled ? 'disabled' : 'enabled'));
  }

  makeAlerts(robots) {
    const now = Date.now();
    const f = robots.find((r) => r.status === 'fault');
    const hz = robots.find((r) => r.human);
    const lowb = robots.slice().sort((a, b) => a.battery - b.battery)[0];
    return [
      { id: 'AL-1', sev: 'critical', robot: f ? f.id : 'HX-224', zone: 'Weld Cells', msg: 'E-stop triggered — joint torque limit exceeded', ts: now - 60000, acked: false, resolved: false },
      { id: 'AL-2', sev: 'warning', robot: hz ? hz.id : 'HX-210', zone: 'Pick / Pack', msg: 'Personnel detected in active zone — speed limited', ts: now - 240000, acked: false, resolved: false },
      { id: 'AL-3', sev: 'warning', robot: lowb ? lowb.id : 'HX-206', zone: this.zoneName(lowb ? lowb.zoneId : 'asm-a'), msg: 'Battery below 20% — schedule charge', ts: now - 420000, acked: false, resolved: false },
      { id: 'AL-4', sev: 'info', robot: 'HX-212', zone: 'Assembly A', msg: 'Cycle time 18% above target', ts: now - 900000, acked: true, resolved: false },
      { id: 'AL-5', sev: 'info', robot: 'HX-219', zone: 'Pick / Pack', msg: 'Firmware 4.2.1 applied successfully', ts: now - 1500000, acked: true, resolved: false },
    ];
  }

  makeJobs(robots) {
    const active = robots.filter((r) => r.status === 'active');
    return jobSeed.map((r, i) => {
      const robot = r[4] !== null ? r[4] : (active[i % Math.max(1, active.length)] || { id: '—' }).id;
      return {
        id: 'JOB-' + (4471 + i), title: r[0], zone: r[1], priority: r[2], status: r[3], robot,
        progress: r[3] === 'inprogress' ? this.rnd(10, 90) : (r[3] === 'done' ? 100 : 0),
        eta: r[3] === 'inprogress' ? this.ri(2, 24) + 'm' : (r[3] === 'queued' ? '—' : (r[3] === 'done' ? 'done' : 'held')),
      };
    });
  }

  makeThroughput() {
    const out = []; const now = new Date();
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 3600000);
      out.push({ label: String(d.getHours()).padStart(2, '0'), h: this.ri(42, 92), cur: i === 0 });
    }
    return out;
  }

  componentDidMount() {
    this.clockT = setInterval(() => this.setState({ clock: this.fmtClock() }), 1000);
    if (this.props.liveTelemetry !== false) this.teleT = setInterval(() => this.tick(), 1400);
    this.keyH = (e) => {
      if ((e.metaKey || e.ctrlKey) && (e.key === 'k' || e.key === 'K')) { e.preventDefault(); this.togglePalette(); }
      else if (e.key === 'Escape') this.setState({ paletteOpen: false, plantMenu: false });
    };
    window.addEventListener('keydown', this.keyH);
    this.attachHeaderObserver();
  }
  componentDidUpdate() { this.attachHeaderObserver(); }
  componentWillUnmount() {
    clearInterval(this.clockT); clearInterval(this.teleT); window.removeEventListener('keydown', this.keyH);
    if (this.ro) this.ro.disconnect();
    // Forget the element so a remount (e.g. React StrictMode in dev) re-observes it.
    this.ro = null; this.roEl = null;
  }

  // The top bar adapts to its own width (not the window's), so it reacts to
  // the sidebar collapsing as well as to window resizes.
  attachHeaderObserver() {
    const el = this.headerRef.current;
    if (!el || el === this.roEl || typeof ResizeObserver === 'undefined') return;
    if (this.ro) this.ro.disconnect();
    this.roEl = el;
    this.ro = new ResizeObserver((entries) => this.onHeaderResize(entries[0]));
    this.ro.observe(el);
  }

  // The design measures the content box, but the header's padding itself
  // changes at the 820px breakpoint (22px → 14px), so between ~848–863px the
  // layout flips on every frame. Measure the border box, which padding doesn't
  // affect, minus the full-size padding so the breakpoints stay where the
  // design puts them.
  onHeaderResize(entry) {
    const border = entry.borderBoxSize?.[0]?.inlineSize ?? entry.target.getBoundingClientRect().width;
    const w = Math.round(border - HEADER_PAD_FULL * 2);
    if (Math.abs(w - (this.state.hw || 0)) > 4) this.setState({ hw: w });
  }

  tick() {
    this.setState((s) => {
      const robots = s.robots.map((r) => {
        if (r.status === 'active') {
          let { battery, progress, x, y, vx, vy, cyclesDone, net, temp } = r;
          progress += this.rnd(2, 7);
          if (progress >= 100) { progress -= 100; cyclesDone++; }
          battery = Math.max(6, battery - 0.14);
          vx += this.rnd(-0.15, 0.15); vy += this.rnd(-0.15, 0.15);
          vx = Math.max(-0.6, Math.min(0.6, vx)); vy = Math.max(-0.6, Math.min(0.6, vy));
          x += vx; y += vy;
          const z = this.zoneById(r.zoneId), p = 2.5;
          if (x < z.x + p) { x = z.x + p; vx = Math.abs(vx); } if (x > z.x + z.w - p) { x = z.x + z.w - p; vx = -Math.abs(vx); }
          if (y < z.y + p) { y = z.y + p; vy = Math.abs(vy); } if (y > z.y + z.h - p) { y = z.y + z.h - p; vy = -Math.abs(vy); }
          net = Math.max(60, Math.min(99, net + this.ri(-2, 2)));
          temp = Math.max(32, Math.min(58, temp + this.ri(-1, 1)));
          const status = battery < 12 ? 'idle' : 'active';
          return { ...r, battery, progress, x, y, vx, vy, cyclesDone, net, temp, status };
        }
        if (r.status === 'charging') {
          const battery = Math.min(100, r.battery + 0.9);
          return { ...r, battery, status: battery >= 100 ? 'idle' : 'charging' };
        }
        return r;
      });
      let throughput = s.throughput;
      if (s.tick % 3 === 0) {
        throughput = s.throughput.slice();
        const last = throughput[throughput.length - 1];
        throughput[throughput.length - 1] = { ...last, h: Math.max(40, Math.min(95, last.h + this.ri(-4, 5))) };
      }
      const jobs = s.jobs.map((j) => j.status === 'inprogress' ? { ...j, progress: Math.min(99, j.progress + this.rnd(1, 4)) } : j);
      let alerts = s.alerts;
      if (s.tick > 0 && s.tick % 9 === 0) {
        const cand = robots.filter((r) => r.status === 'active');
        if (cand.length) {
          const r = this.pick(cand);
          const o = this.pick([
            { sev: 'info', msg: 'Cycle completed — batch milestone reached' },
            { sev: 'warning', msg: 'Gripper slip detected — retry succeeded' },
            { sev: 'info', msg: 'Path re-planned around transient obstacle' },
            { sev: 'warning', msg: 'Vibration above baseline — monitoring' },
          ]);
          alerts = [{ id: 'AL-' + Date.now(), sev: o.sev, robot: r.id, zone: this.zoneName(r.zoneId), msg: o.msg, ts: Date.now(), acked: false, resolved: false }, ...s.alerts].slice(0, 24);
        }
      }
      return { robots, throughput, jobs, alerts, tick: s.tick + 1 };
    });
  }

  // ── commands ──
  updRobot(uid, patch) { this.setState((s) => ({ robots: s.robots.map((r) => r.uid === uid ? { ...r, ...patch } : r) })); }
  logEvent(uid, text, color) { this.setState((s) => ({ robots: s.robots.map((r) => r.uid === uid ? { ...r, log: [{ time: 'now', color, text }, ...r.log].slice(0, 12) } : r) })); }
  pauseRobot(uid) {
    const was = this.state.robots.find((x) => x.uid === uid);
    this.setState((s) => ({ robots: s.robots.map((r) => r.uid !== uid ? r : { ...r, status: r.status === 'active' ? 'idle' : 'active', safety: 'ok' }) }));
    const nowActive = was && was.status !== 'active';
    this.logEvent(uid, nowActive ? 'Resumed by operator' : 'Paused by operator', 'var(--gray-400)');
    this.addToast((was ? was.id : 'Robot') + (nowActive ? ' resumed' : ' paused'));
  }
  estopRobot(uid) {
    this.updRobot(uid, { status: 'fault', safety: 'estop' });
    this.logEvent(uid, 'E-STOP engaged by operator', 'var(--red-500)');
    const r = this.state.robots.find((x) => x.uid === uid);
    this.pushAlert('critical', r ? r.id : '', r ? this.zoneName(r.zoneId) : '', 'E-stop engaged by operator');
  }
  chargeRobot(uid) {
    const z = this.zoneById('charge'); const r = this.state.robots.find((x) => x.uid === uid);
    this.updRobot(uid, { status: 'charging', zoneId: 'charge', task: 'Fast charge to 100%', x: this.rnd(z.x + 3, z.x + z.w - 3), y: this.rnd(z.y + 3, z.y + z.h - 3) });
    this.logEvent(uid, 'Dispatched to charge dock', 'var(--blue-500)');
    this.addToast((r ? r.id : 'Robot') + ' sent to charge dock');
  }
  recallRobot(uid) {
    const z = this.zoneById('maint'); const r = this.state.robots.find((x) => x.uid === uid);
    this.updRobot(uid, { status: 'idle', zoneId: 'maint', task: 'Awaiting diagnostics', safety: 'ok', x: this.rnd(z.x + 3, z.x + z.w - 3), y: this.rnd(z.y + 3, z.y + z.h - 3) });
    this.logEvent(uid, 'Recalled to maintenance bay', 'var(--gray-400)');
    this.addToast((r ? r.id : 'Robot') + ' recalled to maintenance bay');
  }
  reassignRobot(uid) {
    const r = this.state.robots.find((x) => x.uid === uid); if (!r) return;
    const t = this.pick(taskPool[r.zoneId]);
    this.updRobot(uid, { task: t, progress: 0, status: 'active', safety: 'ok' });
    this.logEvent(uid, 'New task assigned: ' + t, 'var(--blue-500)');
    this.addToast(r.id + ' reassigned: ' + t);
  }
  teleop(uid, id, dir) {
    const danger = dir === 'stop';
    this.logEvent(uid, 'Manual teleop — ' + dir, danger ? 'var(--red-500)' : 'var(--blue-500)');
    this.addToast(id + ' teleop: ' + dir, danger ? 'danger' : undefined);
  }
  pushAlert(sev, robot, zone, msg) { this.setState((s) => ({ alerts: [{ id: 'AL-' + Date.now(), sev, robot, zone, msg, ts: Date.now(), acked: false, resolved: false }, ...s.alerts].slice(0, 24) })); }
  ackAlert(id) { this.setState((s) => ({ alerts: s.alerts.map((a) => a.id === id ? { ...a, acked: true } : a) })); this.addToast('Alert acknowledged'); }
  resolveAlert(id) { this.setState((s) => ({ alerts: s.alerts.filter((a) => a.id !== id), selectedAlert: s.selectedAlert === id ? null : s.selectedAlert })); this.addToast('Alert resolved', 'success'); }
  toggleEstopAll() {
    const engaging = !this.state.estopAll;
    this.setState((s) => {
      if (!s.estopAll) return { estopAll: true, robots: s.robots.map((r) => r.status === 'active' ? { ...r, status: 'fault', safety: 'estop' } : r) };
      return { estopAll: false, robots: s.robots.map((r) => r.safety === 'estop' ? { ...r, status: r.battery > 15 ? 'active' : 'idle', safety: 'ok' } : r) };
    });
    this.addToast(engaging ? 'GLOBAL E-STOP engaged' : 'E-stop released — fleet resuming', 'danger');
  }

  // ── styling helpers ──
  navStyle(v) { const on = this.state.view === v; const c = this.state.sbCollapsed; return `position:relative;display:flex;align-items:center;justify-content:${c ? 'center' : 'flex-start'};gap:11px;width:100%;min-height:44px;padding:${c ? '0' : '0 8px'};border:none;border-radius:8px;cursor:pointer;font-family:var(--font-sans);font-size:13.5px;font-weight:${on ? 600 : 500};text-align:left;background:${on ? 'var(--color-bg-brand-subtle)' : 'transparent'};color:${on ? 'var(--color-text-brand)' : 'var(--color-text-subtle)'}`; }
  badgeStyle(status) { const map = { active: ['var(--green-500)', '#fff'], idle: ['var(--color-bg-muted)', 'var(--color-text-subtle)'], charging: ['var(--blue-500)', '#fff'], fault: ['var(--red-500)', '#fff'] }; const [bg, fg] = map[status]; return `display:inline-flex;align-items:center;padding:2px 9px;border-radius:9999px;font-size:11px;font-weight:600;letter-spacing:.01em;background:${bg};color:${fg}`; }
  battColor(b) { return b > 50 ? 'var(--green-500)' : (b >= 20 ? 'var(--yellow-500)' : 'var(--red-500)'); }
  statusLabel(s) { return { active: 'Active', idle: 'Idle', charging: 'Charging', fault: 'Fault' }[s]; }
  prioStyle(p) { const m = { High: ['var(--red-500)', 'color-mix(in srgb,var(--red-500) 14%,transparent)'], Medium: ['var(--yellow-700)', 'color-mix(in srgb,var(--yellow-500) 20%,transparent)'], Low: ['var(--color-text-subtle)', 'var(--color-bg-muted)'] }; const [fg, bg] = m[p]; return `padding:1px 8px;border-radius:9999px;font-size:10.5px;font-weight:600;background:${bg};color:${fg}`; }
  ago(ts) { const s = Math.floor((Date.now() - ts) / 1000); if (s < 60) return s + 's ago'; const m = Math.floor(s / 60); if (m < 60) return m + 'm ago'; return Math.floor(m / 60) + 'h ago'; }
  segStyle(on, pad = '6px 12px', radius = 7) { return `display:flex;align-items:center;gap:6px;min-height:44px;padding:${pad};border-radius:${radius}px;border:none;cursor:pointer;font-family:var(--font-sans);font-size:12.5px;font-weight:${on ? 600 : 500};background:${on ? 'var(--color-bg-default)' : 'transparent'};color:${on ? 'var(--color-text-default)' : 'var(--color-text-subtle)'};box-shadow:${on ? '0 1px 2px rgba(0,0,0,.08)' : 'none'}`; }

  themeSeg(on) { return `display:grid;place-items:center;width:44px;height:44px;border-radius:9999px;border:none;cursor:pointer;transition:background .12s,color .12s;background:${on ? 'var(--color-bg-default)' : 'transparent'};outline-offset:-3px;color:${on ? 'var(--color-text-brand)' : 'var(--color-text-subtle)'};box-shadow:${on ? 'inset 0 0 0 4px var(--color-bg-muted), 0 0 0 0 transparent' : 'none'}`; }

  go = (view, extra) => this.setState({ view, ...extra });
  toggleSidebar = () => this.setState((st) => { const v = !st.sbCollapsed; writeSidebarCollapsed(v); return { sbCollapsed: v }; });
  openRobot = (uid) => this.setState({ selected: uid, view: 'detail' });

  renderVals() {
    const s = this.state;
    const isDark = s.theme === 'dark';
    const robots = s.robots;
    const count = (st) => robots.filter((r) => r.status === st).length;
    const kpi = { total: robots.length, active: count('active'), idle: count('idle'), charging: count('charging'), fault: count('fault') };
    const total = robots.length || 1;
    const hw = s.hw || 1200;
    const dist = { active: kpi.active / total * 100, idle: kpi.idle / total * 100, charging: kpi.charging / total * 100, fault: kpi.fault / total * 100 };
    const avgBatt = Math.round(robots.reduce((a, r) => a + r.battery, 0) / total);
    const unitsHr = robots.filter((r) => r.status === 'active').reduce((a, r) => a + Math.round(3600 / r.cycleTime), 0);
    const oee = Math.round(kpi.active / total * 100 * 0.92);

    const zoneStats = zones.map((z) => { const c = robots.filter((r) => r.zoneId === z.id).length; return { id: z.id, name: z.name, color: z.color, count: c, pct: Math.round(c / 6 * 100) }; });

    const nav = Object.fromEntries(NAV_IDS.map((id) => [id, this.navStyle(id)]));
    const unack = s.alerts.filter((a) => !a.acked).length;

    // fleet
    const fleetKpis = [
      { label: 'Units online', value: kpi.active + '/' + kpi.total, delta: '', deltaColor: 'var(--color-text-subtle)', helper: 'active on the floor' },
      { label: 'Avg battery', value: avgBatt + '%', delta: avgBatt >= 60 ? 'nominal' : 'watch', deltaColor: avgBatt >= 60 ? 'var(--color-text-success)' : 'var(--color-text-warning)', helper: 'fleet mean charge' },
      { label: 'Throughput', value: unitsHr, delta: '+4.1%', deltaColor: 'var(--color-text-success)', helper: 'units / hour' },
      { label: 'Open faults', value: kpi.fault, delta: kpi.fault > 0 ? 'attention' : 'clear', deltaColor: kpi.fault > 0 ? 'var(--color-text-danger)' : 'var(--color-text-success)', helper: 'require action' },
    ];
    const fdef = [['all', 'All'], ['active', 'Active'], ['charging', 'Charging'], ['idle', 'Idle'], ['fault', 'Fault']];
    const filterStyle = (id) => { const on = s.zoneFilter === id; return `min-height:44px;padding:6px 14px;border-radius:9999px;border:1px solid ${on ? 'var(--color-action-primary)' : 'var(--color-border-default)'};background:${on ? 'var(--color-bg-brand-subtle)' : 'var(--color-bg-default)'};color:${on ? 'var(--color-text-brand)' : 'var(--color-text-subtle)'};font-size:12.5px;font-weight:${on ? 600 : 500};cursor:pointer;font-family:var(--font-sans)`; };
    const filters = fdef.map(([id, label]) => ({ id, label, style: filterStyle(id), count: id === 'all' ? robots.length : count(id), onClick: () => this.setState({ zoneFilter: id }) }));

    const fmtRobot = (r) => ({
      uid: r.uid, id: r.id, model: r.model, zoneName: this.zoneName(r.zoneId),
      color: ZC[r.status], pulse: r.status === 'active' ? 'animation:lyra-pulse 1.6s ease-in-out infinite' : (r.status === 'fault' ? 'animation:lyra-blink 1s step-end infinite' : ''),
      statusLabel: this.statusLabel(r.status), badge: this.badgeStyle(r.status),
      battery: Math.round(r.battery), battLabel: Math.round(r.battery) + '%', battColor: this.battColor(r.battery),
      progress: Math.round(r.progress), progLabel: Math.round(r.progress) + '%',
      task: r.task, open: () => this.openRobot(r.uid),
    });
    const filtered = s.zoneFilter === 'all' ? robots : robots.filter((r) => r.status === s.zoneFilter);
    const fleetRobots = filtered.map(fmtRobot);
    const fleetGroups = zones.map((z) => {
      const zr = filtered.filter((r) => r.zoneId === z.id); const cnt = (st) => zr.filter((r) => r.status === st).length; const exp = s.expandedZones[z.id] !== false;
      return {
        id: z.id, name: z.name, color: z.color, count: zr.length, active: cnt('active'), idle: cnt('idle'), charging: cnt('charging'), fault: cnt('fault'),
        expanded: exp, chevron: exp ? '▾' : '▸', onToggle: () => this.setState((st) => ({ expandedZones: { ...st.expandedZones, [z.id]: st.expandedZones[z.id] === false } })),
        rows: zr.map(fmtRobot),
      };
    }).filter((g) => g.count > 0);

    // map
    const zonesLayout = zones.map((z) => ({ id: z.id, name: z.name, kind: z.kind, x: z.x, y: z.y, w: z.w, h: z.h, color: z.color, border: 'color-mix(in srgb, ' + z.color + ' 40%, transparent)', fill: 'color-mix(in srgb, ' + z.color + ' 8%, transparent)' }));
    const mapRobots = robots.map((r) => ({ uid: r.uid, id: r.id, x: +r.x.toFixed(2), y: +r.y.toFixed(2), color: ZC[r.status], isFault: r.status === 'fault', pulse: r.status === 'active' ? 'animation:lyra-pulse 1.8s ease-in-out infinite' : '', open: () => this.openRobot(r.uid) }));
    const humans = robots.filter((r) => r.human).map((r) => ({ uid: r.uid, x: +(r.x + 3).toFixed(2), y: +(r.y - 4).toFixed(2) }));
    const safety = { estops: kpi.fault, estopColor: kpi.fault > 0 ? 'var(--color-text-danger)' : 'var(--color-text-default)', humans: humans.length, slowed: humans.length };
    const mapCols = 10, mapRows = 6; const heatGrid = Array.from({ length: mapCols * mapRows }, () => 0);
    robots.forEach((r) => { const c = Math.max(0, Math.min(mapCols - 1, Math.floor(r.x / 100 * mapCols))); const rw = Math.max(0, Math.min(mapRows - 1, Math.floor(r.y / 100 * mapRows))); heatGrid[rw * mapCols + c]++; });
    const maxHeat = Math.max(1, ...heatGrid);
    const heatCells = heatGrid.map((d, idx) => {
      const c = idx % mapCols, rw = Math.floor(idx / mapCols); const t = d / maxHeat;
      const hue = t > 0.66 ? 'var(--red-500)' : (t > 0.33 ? 'var(--yellow-500)' : 'var(--green-500)');
      return { idx, show: d > 0, x: +(c / mapCols * 100).toFixed(2), y: +(rw / mapRows * 100).toFixed(2), w: +(100 / mapCols).toFixed(2), h: +(100 / mapRows).toFixed(2), color: `color-mix(in srgb, ${hue} ${Math.round(24 + t * 56)}%, transparent)` };
    }).filter((cl) => cl.show);
    const chargeZ = this.zoneById('charge'); const chgN = robots.filter((r) => r.status === 'charging');
    const dockMarkers = docks.map((d, i) => {
      const col = i % 4, row = Math.floor(i / 4); const occ = d.offline ? null : chgN[i];
      return {
        id: d.id,
        x: +(chargeZ.x + (col + 0.5) * (chargeZ.w / 4)).toFixed(2), y: +(chargeZ.y + (row + 0.5) * (chargeZ.h / 2)).toFixed(2),
        color: d.offline ? 'var(--gray-400)' : (occ ? 'var(--blue-500)' : 'transparent'),
        border: d.offline ? 'var(--gray-400)' : (occ ? 'var(--blue-500)' : 'var(--green-500)'),
        title: d.id + (d.offline ? ' · offline' : (occ ? ' · ' + occ.id : ' · free')),
      };
    });

    // jobs
    const jcol = (st, title, color) => {
      const js = s.jobs.filter((j) => j.status === st).map((j) => ({ id: j.id, title: j.title, priority: j.priority, prioStyle: this.prioStyle(j.priority), robot: j.robot, meta: j.eta, showBar: st === 'inprogress', progress: Math.round(j.progress) }));
      return { id: st, title, color, count: js.length, jobs: js };
    };
    const jobColumns = [jcol('queued', 'Queued', 'var(--gray-400)'), jcol('inprogress', 'In progress', 'var(--blue-500)'), jcol('blocked', 'Blocked', 'var(--red-500)'), jcol('done', 'Done', 'var(--green-500)')];

    // alerts
    const sevCounts = { critical: s.alerts.filter((a) => a.sev === 'critical').length, warning: s.alerts.filter((a) => a.sev === 'warning').length, info: s.alerts.filter((a) => a.sev === 'info').length };
    const sevMap = { critical: ['var(--red-500)', 'color-mix(in srgb,var(--red-500) 16%,transparent)', '!'], warning: ['var(--yellow-500)', 'color-mix(in srgb,var(--yellow-500) 18%,transparent)', '!'], info: ['var(--blue-500)', 'color-mix(in srgb,var(--blue-500) 15%,transparent)', 'i'] };
    const alertList = s.alerts.map((a, i) => {
      const [tone, tint, glyph] = sevMap[a.sev];
      return {
        id: a.id, glyph, tone, tint, msg: a.msg, robot: a.robot, zone: a.zone, time: this.ago(a.ts),
        rowStyle: `display:flex;align-items:center;gap:13px;padding:14px 16px;cursor:pointer;${i > 0 ? 'border-top:1px solid var(--color-border-default);' : ''}${a.acked ? 'opacity:.62;' : ''}`,
        open: !a.acked, acked: a.acked,
        onOpen: () => this.setState({ selectedAlert: a.id, view: 'incident' }),
        onAck: (e) => { e.stopPropagation(); this.ackAlert(a.id); },
        onResolve: (e) => { e.stopPropagation(); this.resolveAlert(a.id); },
      };
    });
    const sevTone = { critical: 'var(--red-500)', warning: 'var(--yellow-500)', info: 'var(--blue-500)' };
    const sevBg = { critical: 'color-mix(in srgb,var(--red-500) 15%,transparent)', warning: 'color-mix(in srgb,var(--yellow-500) 22%,transparent)', info: 'color-mix(in srgb,var(--blue-500) 15%,transparent)' };
    const cap = (str) => str.charAt(0).toUpperCase() + str.slice(1);
    const rulesView = s.rules.map((r) => {
      const vl = r.id === 'geo' ? 'zone' : (r.unit === '%' ? r.value + '%' : (r.unit === '°C' ? r.value + '°C' : (r.unit === '×base' ? r.value + '×' : String(r.value))));
      return {
        id: r.id, name: r.name, display: r.id === 'geo' ? 'Unit enters a mapped no-go zone' : `${r.metric} ${r.op} ${vl}`, valueLabel: vl, action: r.action, enabled: r.enabled, editable: r.id !== 'geo',
        sevLabel: cap(r.sev), sevTone: sevTone[r.sev], sevBg: sevBg[r.sev],
        rowStyle: `display:flex;align-items:center;gap:14px;padding:14px 16px;border-bottom:1px solid var(--color-border-default);${r.enabled ? '' : 'opacity:.5;'}`,
        toggleStyle: `position:relative;box-sizing:content-box;width:38px;height:22px;padding:11px 3px;background-clip:content-box;border-radius:14px / 22px;border:none;cursor:pointer;flex:none;background-color:${r.enabled ? 'var(--color-action-primary)' : 'var(--color-bg-muted)'};transition:background-color .12s`,
        knobStyle: `position:absolute;top:13px;left:${r.enabled ? '21px' : '5px'};width:18px;height:18px;border-radius:9999px;background:#fff;transition:left .12s;box-shadow:0 1px 2px rgba(0,0,0,.2)`,
        dec: () => this.bumpRule(r.id, -1), inc: () => this.bumpRule(r.id, 1), toggle: () => this.toggleRule(r.id),
      };
    });
    const routingView = routing.map((rt) => ({
      channel: rt.channel, target: rt.target,
      chips: ['critical', 'warning', 'info'].map((sv) => ({ label: cap(sv), style: `padding:2px 9px;border-radius:9999px;font-size:10.5px;font-weight:600;${rt.sev.includes(sv) ? `background:${sevBg[sv]};color:${sevTone[sv]}` : 'background:var(--color-bg-muted);color:var(--color-text-placeholder);opacity:.55'}` })),
    }));

    // analytics
    const anaKpis = [
      { label: 'Units / hour', value: unitsHr, delta: '+4.1%', deltaColor: 'var(--color-text-success)', helper: 'vs last shift' },
      { label: 'OEE', value: oee + '%', delta: '+1.8%', deltaColor: 'var(--color-text-success)', helper: 'availability × perf' },
      { label: 'Avg cycle', value: Math.round(robots.reduce((a, r) => a + r.cycleTime, 0) / total) + 's', delta: '-2.3%', deltaColor: 'var(--color-text-success)', helper: 'shorter is better' },
      { label: 'Fleet uptime', value: '99.1%', delta: '+0.2%', deltaColor: 'var(--color-text-success)', helper: 'rolling 24h' },
    ];
    const throughput = s.throughput.map((b) => ({ label: b.label, h: b.h, cur: b.cur, fill: b.cur ? 'var(--color-action-primary)' : 'color-mix(in srgb,var(--color-action-primary) 32%,transparent)' }));
    const utilColors = ['var(--blue-500)', 'var(--blue-500)', 'var(--green-500)', 'var(--yellow-500)', 'var(--gray-400)', 'var(--gray-400)'];
    const utilization = zones.map((z, i) => { const zr = robots.filter((r) => r.zoneId === z.id); const act = zr.filter((r) => r.status === 'active').length; return { name: z.name, pct: zr.length ? Math.round(act / zr.length * 100) : 0, color: utilColors[i] }; });
    const days7 = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const upMin = 96, upMax = 100, upW = 280, upH = 90;
    const uptimeVals = [98.6, 99.1, 98.2, 99.4, 99.0, 97.9, 99.1];
    const uptimePts = uptimeVals.map((v, i) => `${(i / (uptimeVals.length - 1) * upW).toFixed(1)},${(upH - ((v - upMin) / (upMax - upMin)) * upH).toFixed(1)}`).join(' ');
    const uptimeArea = `0,${upH} ` + uptimePts + ` ${upW},${upH}`;
    const uptimeLast = uptimeVals[uptimeVals.length - 1].toFixed(1) + '%';
    const mg = {}; robots.forEach((r) => { (mg[r.model] = mg[r.model] || []).push(r.mtbf); });
    const mgv = Object.entries(mg).map(([m, a]) => ({ name: m, v: Math.round(a.reduce((x, y) => x + y, 0) / a.length) }));
    const mgMax = Math.max(1, ...mgv.map((x) => x.v));
    const mtbfByModel = mgv.sort((a, b) => b.v - a.v).map((x) => ({ name: x.name, mtbf: x.v + 'h', pct: Math.max(6, Math.round(x.v / mgMax * 100)) }));
    const cc = [41, 38, 44, 52, 47, 29, 36]; const ccMax = Math.max(...cc);
    const chargeCycles = cc.map((v, i) => ({ label: days7[i], v, h: Math.max(6, Math.round(v / ccMax * 100)), fill: i === cc.length - 1 ? 'var(--color-action-primary)' : 'color-mix(in srgb,var(--color-action-primary) 34%,transparent)' }));

    // detail
    let sel = null;
    const sr = robots.find((r) => r.uid === s.selected);
    if (sr) {
      sel = {
        id: sr.id, model: sr.model, zoneName: this.zoneName(sr.zoneId), uptime: sr.uptime,
        color: ZC[sr.status], pulse: sr.status === 'active' ? 'animation:lyra-pulse 1.6s ease-in-out infinite' : (sr.status === 'fault' ? 'animation:lyra-blink 1s step-end infinite' : ''),
        statusLabel: this.statusLabel(sr.status), badge: this.badgeStyle(sr.status),
        task: sr.task, progress: Math.round(sr.progress), progLabel: Math.round(sr.progress) + '%', cycleTime: sr.cycleTime,
        telemetry: [
          { label: 'Battery', value: Math.round(sr.battery) + '%' },
          { label: 'Motor temp', value: sr.temp + '°C' },
          { label: 'Payload', value: sr.payload + ' kg' },
          { label: 'Network', value: sr.net + '%' },
        ],
        log: sr.log,
        spark: this.sparkPoints(sr.hist),
        sparkLast: sr.hist[sr.hist.length - 1],
        joints: sr.joints.map((j) => ({ name: j.name, temp: j.temp + '°C', load: j.load + '%', dot: j.st === 'fault' ? 'var(--red-500)' : (j.st === 'warn' ? 'var(--yellow-500)' : 'var(--green-500)') })),
        mtbf: sr.mtbf + 'h',
        nextServiceLabel: sr.nextService <= 0 ? 'Overdue' : 'in ' + sr.nextService + 'h',
        serviceColor: sr.nextService <= 0 ? 'var(--color-text-danger)' : (sr.nextService < 24 ? 'var(--color-text-warning)' : 'var(--color-text-default)'),
        serviceBar: Math.max(4, Math.min(100, Math.round((1 - Math.min(1, Math.max(0, sr.nextService) / 140)) * 100))),
        serviceBarColor: sr.nextService <= 0 ? 'var(--red-500)' : (sr.nextService < 24 ? 'var(--yellow-500)' : 'var(--green-500)'),
        drive: (dir) => this.teleop(sr.uid, sr.id, dir),
        pauseLabel: sr.status === 'active' ? 'Pause' : 'Resume',
        cmdPause: () => this.pauseRobot(sr.uid),
        cmdReassign: () => this.reassignRobot(sr.uid),
        cmdCharge: () => this.chargeRobot(sr.uid),
        cmdRecall: () => this.recallRobot(sr.uid),
        cmdEstop: () => this.estopRobot(sr.uid),
      };
    }

    // maintenance / reliability
    const svcRank = (r) => (r.status === 'fault' ? 0 : 100) + r.nextService;
    const maintRows = robots.slice().sort((a, b) => svcRank(a) - svcRank(b)).map((r) => ({
      uid: r.uid, id: r.id,
      mtbf: r.mtbf + 'h',
      pmPct: Math.max(3, Math.min(100, Math.round((r.pmInterval - r.nextService) / r.pmInterval * 100))),
      pmLabel: Math.max(0, Math.round(r.pmInterval - r.nextService)) + '/' + r.pmInterval + 'h',
      pmColor: r.nextService <= 0 ? 'var(--red-500)' : (r.nextService < 24 ? 'var(--yellow-500)' : 'var(--color-action-primary)'),
      service: r.nextService <= 0 ? 'Overdue' : r.nextService + 'h', serviceColor: r.nextService <= 0 ? 'var(--color-text-danger)' : (r.nextService < 24 ? 'var(--color-text-warning)' : 'var(--color-text-subtle)'),
      health: r.status === 'fault' ? 'Needs service' : (r.nextService <= 0 ? 'Service due' : (r.nextService < 24 ? 'Due soon' : 'Healthy')),
      healthColor: r.status === 'fault' ? 'var(--red-500)' : (r.nextService <= 0 ? 'var(--red-500)' : (r.nextService < 24 ? 'var(--yellow-500)' : 'var(--green-500)')),
      open: () => this.openRobot(r.uid),
    }));
    const workOrdersView = workOrders.map((w) => ({
      ...w, prioStyle: this.prioStyle(w.pri),
      chipBg: w.status === 'In progress' ? 'color-mix(in srgb,var(--blue-500) 16%,transparent)' : 'var(--color-bg-muted)',
      chipColor: w.status === 'In progress' ? 'var(--color-text-brand)' : 'var(--color-text-subtle)',
    }));
    const maintKpis = [
      { label: 'Open work orders', value: workOrders.filter((w) => w.status === 'Open').length, helper: 'unassigned + queued' },
      { label: 'Service due <24h', value: robots.filter((r) => r.nextService < 24).length, helper: 'schedule now' },
      { label: 'Overdue', value: robots.filter((r) => r.nextService <= 0).length, helper: 'past interval' },
      { label: 'Fleet MTBF', value: Math.round(robots.reduce((a, r) => a + r.mtbf, 0) / total) + 'h', helper: 'mean between failures' },
    ];
    const partsView = parts.map((p) => {
      const out = p.stock === 0, low = !out && p.stock < p.min;
      return {
        ...p, state: out ? 'Out' : (low ? 'Low' : 'OK'),
        chipBg: out ? 'color-mix(in srgb,var(--red-500) 15%,transparent)' : (low ? 'color-mix(in srgb,var(--yellow-500) 22%,transparent)' : 'var(--color-bg-muted)'),
        chipColor: out ? 'var(--color-text-danger)' : (low ? 'var(--color-text-warning)' : 'var(--color-text-subtle)'),
      };
    });
    const outOfService = robots.filter((r) => r.status === 'fault' || r.nextService <= 0).map((r) => ({ uid: r.uid, id: r.id, model: r.model, zone: this.zoneName(r.zoneId), reason: r.status === 'fault' ? 'Active fault' : 'PM overdue', reasonColor: r.status === 'fault' ? 'var(--red-500)' : 'var(--yellow-500)', open: () => this.openRobot(r.uid) }));

    // plant rollup (manager)
    const rollLines = zones.filter((z) => z.id !== 'charge' && z.id !== 'maint').map((z, i) => {
      const zr = robots.filter((r) => r.zoneId === z.id); const act = zr.filter((r) => r.status === 'active').length;
      const av = zr.length ? act / zr.length : 0; const perf = 0.86 + i * 0.02; const oeeV = Math.round(av * perf * 100);
      const uh = zr.filter((r) => r.status === 'active').reduce((a, r) => a + Math.round(3600 / r.cycleTime), 0);
      return { name: z.name, color: z.color, units: zr.length, oee: oeeV, oeeColor: oeeV >= 80 ? 'var(--green-500)' : (oeeV >= 60 ? 'var(--yellow-500)' : 'var(--red-500)'), unitsHr: uh };
    });
    const shiftBars = ['A', 'B', 'C'].map((sh, i) => ({ label: 'Shift ' + sh, h: [72, 88, 54][i], fill: i === 1 ? 'var(--color-action-primary)' : 'color-mix(in srgb,var(--color-action-primary) 32%,transparent)' }));
    const rollupKpis = [
      { label: 'Plant OEE', value: oee + '%', delta: '+1.8%', deltaColor: 'var(--color-text-success)', helper: 'shift B to date' },
      { label: 'Units / shift', value: '2,140', delta: '+112', deltaColor: 'var(--color-text-success)', helper: 'projected' },
      { label: 'Cost / unit', value: '$3.18', delta: '-$0.06', deltaColor: 'var(--color-text-success)', helper: 'vs target $3.30' },
      { label: 'Labor hours saved', value: '184', delta: '+9%', deltaColor: 'var(--color-text-success)', helper: 'vs manual baseline' },
    ];

    // charging & docks
    const chgRobots = robots.filter((r) => r.status === 'charging');
    let drawKw = 0;
    const chgBays = docks.map((d, i) => {
      if (d.offline) return { id: d.id, type: d.type, offline: true };
      const occ = chgRobots[i];
      if (occ) {
        drawKw += d.kw;
        const soc = Math.round(occ.battery);
        const base = { Fast: 42, Standard: 78, Trickle: 130 }[d.type] || 60;
        const etaMin = Math.max(1, Math.round((100 - soc) / 100 * base));
        return { id: d.id, type: d.type, charging: true, robot: occ.id, soc, socLabel: soc + '%', ringColor: this.battColor(occ.battery), rate: d.kw + ' kW', eta: '~' + etaMin + 'm', open: () => this.openRobot(occ.uid) };
      }
      return { id: d.id, type: d.type, available: true };
    });
    const bayCount = docks.filter((d) => !d.offline).length;
    const occupied = chgBays.filter((b) => b.charging).length;
    const avgSoc = chgRobots.length ? Math.round(chgRobots.reduce((a, r) => a + r.battery, 0) / chgRobots.length) : 0;
    const capKw = 120;
    const chgQueue = robots.filter((r) => r.status !== 'charging' && r.battery < 45).sort((a, b) => a.battery - b.battery).slice(0, 6).map((r) => ({ uid: r.uid, id: r.id, zone: this.zoneName(r.zoneId), batt: Math.round(r.battery) + '%', battColor: this.battColor(r.battery), send: () => this.chargeRobot(r.uid) }));
    const chgKpis = [
      { label: 'Bays in use', value: occupied + '/' + bayCount, helper: 'active chargers' },
      { label: 'Avg dock SoC', value: avgSoc + '%', helper: 'units charging' },
      { label: 'In queue', value: chgQueue.length, helper: 'awaiting a bay' },
      { label: 'Power draw', value: drawKw + ' kW', helper: 'of ' + capKw + ' kW capacity' },
    ];

    // incident detail
    let inc = null;
    const inA = s.alerts.find((a) => a.id === s.selectedAlert);
    if (inA && s.view === 'incident') {
      const [tone, tint, glyph] = sevMap[inA.sev];
      const ir = robots.find((r) => r.id === inA.robot);
      const sevCap = cap(inA.sev);
      const affected = ir ? robots.filter((r) => r.zoneId === ir.zoneId && r.uid !== ir.uid).slice(0, 4) : [];
      const rec = {
        critical: 'Dispatch the on-call technician now. The unit is isolated via E-stop — do not clear the fault until the joint torque limit has been inspected.',
        warning: 'Auto-mitigation applied (zone speed limit / retry). Keep monitoring; escalate to a work order if it recurs within the shift.',
        info: 'No action required. Logged to the shift record for trend analysis.',
      }[inA.sev];
      inc = {
        tone, tint, glyph, title: inA.msg, robot: inA.robot, zone: inA.zone, time: this.ago(inA.ts),
        chip: inA.acked
          ? 'display:inline-flex;align-items:center;padding:3px 11px;border-radius:9999px;font-size:11.5px;font-weight:600;background:var(--color-bg-muted);color:var(--color-text-subtle)'
          : `display:inline-flex;align-items:center;padding:3px 11px;border-radius:9999px;font-size:11.5px;font-weight:600;background:${tint};color:${tone}`,
        chipLabel: inA.acked ? 'Acknowledged' : 'Open · ' + sevCap,
        timeline: [
          { t: this.ago(inA.ts), color: tone, text: 'Incident raised — ' + inA.msg },
          { t: '+2s', color: 'var(--blue-500)', text: 'Telemetry snapshot captured and zone speed-limited automatically' },
          { t: '+5s', color: 'var(--blue-500)', text: 'Operators in ' + inA.zone + ' notified on the floor console' },
          { t: inA.acked ? 'ack' : 'pending', color: inA.acked ? 'var(--green-500)' : 'var(--gray-400)', text: inA.acked ? 'Acknowledged by operator' : 'Awaiting operator acknowledgement' },
        ],
        recommended: rec,
        details: [
          { label: 'Robot', value: inA.robot },
          { label: 'Zone', value: inA.zone },
          { label: 'Severity', value: sevCap },
          { label: 'First seen', value: this.ago(inA.ts) },
          { label: 'Status', value: inA.acked ? 'Acknowledged' : 'Open' },
        ],
        hasRobot: !!ir,
        snapshot: ir ? [{ label: 'Battery', value: Math.round(ir.battery) + '%' }, { label: 'Motor temp', value: ir.temp + '°C' }, { label: 'Payload', value: ir.payload + ' kg' }, { label: 'Network', value: ir.net + '%' }] : [],
        affected: affected.map((r) => ({ uid: r.uid, id: r.id, model: r.model, status: this.statusLabel(r.status), badge: this.badgeStyle(r.status), open: () => this.openRobot(r.uid) })),
        openRobot: ir ? () => this.openRobot(ir.uid) : () => {},
        onAck: () => this.ackAlert(inA.id),
        onAssign: () => this.addToast('Incident assigned to on-call tech'),
        onResolve: () => { this.resolveAlert(inA.id); this.setState({ view: 'alerts' }); },
      };
    }

    // shift handover
    const openWO = workOrders.filter((w) => w.status !== 'Done');
    const blockedJobs = s.jobs.filter((j) => j.status === 'blocked');
    const unresolved = s.alerts.filter((a) => !a.acked);
    const carryover = [
      ...unresolved.filter((a) => a.sev !== 'info').map((a) => ({ key: a.id, tone: sevMap[a.sev][0], label: a.msg, meta: a.robot + ' · ' + a.zone, kind: a.sev === 'critical' ? 'Critical' : 'Warning' })),
      ...openWO.map((w) => ({ key: w.id, tone: 'var(--yellow-500)', label: w.title, meta: w.robot + ' · ' + w.pri + ' priority', kind: 'Work order' })),
      ...blockedJobs.map((j) => ({ key: j.id, tone: 'var(--red-500)', label: j.title, meta: j.robot + ' · ' + j.zone, kind: 'Blocked job' })),
    ];
    const hoWatch = robots.filter((r) => r.status === 'fault' || r.nextService < 24).sort((a, b) => svcRank(a) - svcRank(b)).slice(0, 6).map((r) => ({
      uid: r.uid, id: r.id, open: () => this.openRobot(r.uid),
      health: r.status === 'fault' ? 'Fault — needs service' : (r.nextService <= 0 ? 'Service overdue' : 'Service due soon'),
      healthColor: r.status === 'fault' || r.nextService <= 0 ? 'var(--red-500)' : 'var(--yellow-500)',
      service: r.nextService <= 0 ? 'Overdue' : 'in ' + r.nextService + 'h',
      serviceColor: r.nextService <= 0 ? 'var(--color-text-danger)' : 'var(--color-text-warning)',
    }));
    const hoKpis = [
      { label: 'Units produced', value: (unitsHr * 6).toLocaleString(), helper: 'shift B to now' },
      { label: 'Shift OEE', value: oee + '%', helper: 'availability × perf' },
      { label: 'Open incidents', value: unresolved.length, helper: 'carried to shift C' },
      { label: 'Carryover items', value: openWO.length + blockedJobs.length, helper: 'work orders + blocked' },
    ];
    const hoChecklist = ['Production log reconciled', 'Open incidents briefed to shift C', 'Charging & staging confirmed'].map((label, i) => ({
      label, done: s.hoChecks[i],
      toggle: () => this.setState((st) => { const c = st.hoChecks.slice(); c[i] = !c[i]; return { hoChecks: c }; }),
      textStyle: s.hoChecks[i] ? 'text-decoration:line-through;color:var(--color-text-subtle)' : '',
    }));

    // plant switcher
    const curPlant = this.plants.find((p) => p.id === s.plant) || this.plants[0];
    const plantList = this.plants.map((p) => ({
      id: p.id, name: p.name, line: p.line, online: p.id === s.plant ? kpi.active + '/' + kpi.total : p.online, active: p.id === s.plant,
      rowStyle: `display:flex;align-items:center;gap:10px;width:100%;min-height:44px;padding:9px 12px;border:none;background:${p.id === s.plant ? 'var(--color-bg-brand-subtle)' : 'transparent'};cursor:pointer;text-align:left;font-family:var(--font-sans);border-radius:8px;color:var(--color-text-default)`,
      onSelect: () => this.switchPlant(p),
    }));

    // command palette
    const q = (s.paletteQuery || '').toLowerCase();
    const nn = (v, label) => ({ kind: 'Navigate', label, hint: '', onSelect: () => this.setState({ view: v, paletteOpen: false }) });
    const palItems = [
      nn('fleet', 'Fleet overview'), nn('map', 'Floor map'), nn('tasks', 'Job queue'), nn('charge', 'Charging & docks'), nn('alerts', 'Alerts & incidents'), nn('analytics', 'Analytics'), nn('maint', 'Maintenance'), nn('rollup', 'Plant rollup'), nn('handover', 'Shift handover'),
      { kind: 'Action', label: 'Global E-STOP — all units', hint: '', onSelect: () => { this.setState({ paletteOpen: false }); this.toggleEstopAll(); } },
      { kind: 'Action', label: isDark ? 'Switch to light theme' : 'Switch to dark theme', hint: '', onSelect: () => this.setState((st) => ({ theme: st.theme === 'dark' ? 'light' : 'dark', paletteOpen: false })) },
      ...robots.map((r) => ({ kind: 'Robot', label: r.id + ' — ' + r.model, hint: this.zoneName(r.zoneId), onSelect: () => this.setState({ selected: r.uid, view: 'detail', paletteOpen: false }) })),
    ];
    const palette = palItems.filter((it) => !q || it.label.toLowerCase().includes(q) || it.kind.toLowerCase().includes(q)).slice(0, 8);

    return {
      rootClass: isDark ? 'lyra dark' : 'lyra',
      clock: s.clock,
      isDark,
      setLight: () => this.setState({ theme: 'light' }), setDark: () => this.setState({ theme: 'dark' }),
      themeLightStyle: this.themeSeg(!isDark), themeDarkStyle: this.themeSeg(isDark),
      // Sidebar
      sbCollapsed: !!s.sbCollapsed, toggleSidebar: this.toggleSidebar,
      gridCols: s.sbCollapsed ? '64px 1fr' : '236px 1fr',
      navCur: Object.fromEntries(NAV_IDS.map((k) => [k, s.view === k ? 'page' : undefined])),
      alertsAria: unack > 0 ? 'Alerts, ' + unack + ' unacknowledged' : 'Alerts',
      // Top bar breakpoints, by the header's own width
      headerRef: this.headerRef,
      hdrFull: hw >= 1080, hdrShowLive: hw >= 820,
      hdrGap: hw < 820 ? '10px' : (hw < 1080 ? '12px' : '16px'), hdrPad: hw < 820 ? '14px' : HEADER_PAD_FULL + 'px',
      searchSize: hw >= 1080 ? 'flex:1;min-width:180px;max-width:320px;margin:0 4px 0 6px' : 'flex:none',
      go: this.go,
      view: s.view,
      nav, unackCount: unack, hasAlerts: unack > 0, zoneStats,
      kpi, dist, fleetKpis, filters, fleetRobots, fleetGroups,
      isTable: s.fleetView === 'table',
      segCards: this.segStyle(s.fleetView !== 'table'), segTable: this.segStyle(s.fleetView === 'table'),
      goCards: () => this.setState({ fleetView: 'cards' }), goTable: () => this.setState({ fleetView: 'table' }),
      zonesLayout, mapRobots, humans, safety, heatCells, noGoZones, dockMarkers,
      isMapHeat: s.mapMode === 'heat',
      mapLiveStyle: this.segStyle(s.mapMode === 'live', '6px 13px'), mapHeatStyle: this.segStyle(s.mapMode === 'heat', '6px 13px'),
      setMapLive: () => this.setState({ mapMode: 'live' }), setMapHeat: () => this.setState({ mapMode: 'heat' }),
      jobColumns, jobCount: s.jobs.length,
      sevCounts, alertList,
      isRulesTab: s.alertTab === 'rules',
      tabIncStyle: this.segStyle(s.alertTab === 'incidents', '7px 14px', 8).replace('display:flex;align-items:center;gap:6px;', ''),
      tabRulesStyle: this.segStyle(s.alertTab === 'rules', '7px 14px', 8).replace('display:flex;align-items:center;gap:6px;', ''),
      setIncTab: () => this.setState({ alertTab: 'incidents' }), setRulesTab: () => this.setState({ alertTab: 'rules' }),
      rulesView, routing: routingView,
      anaKpis, throughput, utilization, uptimePts, uptimeArea, uptimeDays: days7, uptimeLast, mtbfByModel, chargeCycles,
      sel,
      estopStyle: `display:inline-flex;align-items:center;gap:8px;min-height:44px;padding:8px 14px;white-space:nowrap;flex:none;border-radius:8px;border:1px solid ${s.estopAll ? 'var(--red-500)' : 'var(--color-border-strong)'};background:${s.estopAll ? 'var(--red-500)' : 'transparent'};color:${s.estopAll ? '#fff' : 'var(--color-text-danger)'};font-size:12.5px;font-weight:600;cursor:pointer;font-family:var(--font-sans)`,
      estopLabel: s.estopAll ? 'Release all' : (hw < 820 ? 'E-STOP' : 'Global E-STOP'),
      estopPulse: s.estopAll ? 'animation:lyra-pulse 1s infinite' : '',
      toggleEstop: () => this.toggleEstopAll(),
      curPlantName: curPlant.name, plantList, plantMenu: s.plantMenu,
      togglePlantMenu: () => this.setState((st) => ({ plantMenu: !st.plantMenu })),
      maintRows, workOrders: workOrdersView, maintKpis, parts: partsView, outOfService,
      rollLines, shiftBars, rollupKpis,
      chg: { occupied, bayCount, draw: drawKw, drawPct: Math.round(drawKw / capKw * 100), cap: capKw }, chgKpis, chgBays, chgQueue,
      inc,
      hoKpis, carryover, hoWatch, hoChecklist, handoverNotes: s.handoverNotes,
      onHandoverNote: (e) => this.setState({ handoverNotes: e.target.value }),
      signHandover: () => this.addToast('Handover submitted to shift C', 'success'),
      palette, paletteOpen: s.paletteOpen, paletteQuery: s.paletteQuery,
      onPaletteInput: (e) => this.setState({ paletteQuery: e.target.value }),
      closePalette: () => this.setState({ paletteOpen: false }),
      openPalette: () => this.togglePalette(true),
      toasts: s.toasts.map((t) => ({ id: t.id, msg: t.msg, accent: t.kind === 'danger' ? 'var(--red-500)' : (t.kind === 'success' ? 'var(--green-500)' : 'var(--blue-500)') })),
    };
  }

  render() {
    const v = this.renderVals();
    const view = v.view;
    return (
      <div className={v.rootClass} style={sx(`min-height:100vh;display:grid;grid-template-columns:${v.gridCols};transition:grid-template-columns .18s ease;background:var(--color-bg-subtle);color:var(--color-text-default);font-size:14px`)}>
        <Sidebar v={v} />
        <div style={sx('display:flex;flex-direction:column;min-width:0')}>
          <Topbar v={v} />
          <main style={sx('flex:1;overflow:auto;padding:22px')}>
            {view === 'fleet' && <FleetView v={v} />}
            {view === 'map' && <MapView v={v} />}
            {view === 'tasks' && <JobsView v={v} />}
            {view === 'alerts' && <AlertsView v={v} />}
            {view === 'analytics' && <AnalyticsView v={v} />}
            {view === 'detail' && v.sel && <RobotDetail v={v} />}
            {view === 'maint' && <MaintenanceView v={v} />}
            {view === 'rollup' && <RollupView v={v} />}
            {view === 'charge' && <ChargingView v={v} />}
            {view === 'incident' && v.inc && <IncidentView v={v} />}
            {view === 'handover' && <HandoverView v={v} />}
          </main>
        </div>
        {v.paletteOpen && <CommandPalette v={v} />}
        <Toasts toasts={v.toasts} />
      </div>
    );
  }
}
