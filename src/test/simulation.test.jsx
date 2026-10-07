import { describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import App from '../App.jsx';
import { zones } from '../data.js';
import { renderApp, goTo, main } from './helpers.jsx';

const tick = (app, n = 1) => act(() => { for (let i = 0; i < n; i++) app().tick(); });
const zone = (id) => zones.find((z) => z.id === id);

describe('telemetry tick', () => {
  it('charges docked robots by 0.9 per tick and idles them at 100%', () => {
    const { app } = renderApp();
    const r = app().state.robots.find((x) => x.status === 'charging');
    const before = r.battery;
    tick(app);
    expect(app().state.robots.find((x) => x.uid === r.uid).battery).toBeCloseTo(before + 0.9);

    act(() => app().updRobot(r.uid, { battery: 99.5 }));
    tick(app);
    const done = app().state.robots.find((x) => x.uid === r.uid);
    expect(done.battery).toBe(100);
    expect(done.status).toBe('idle');
  });

  it('keeps active robots inside their zone and drains battery', () => {
    const { app } = renderApp();
    const start = app().state.robots.filter((r) => r.status === 'active');
    tick(app, 200);
    for (const r of app().state.robots.filter((x) => start.some((s) => s.uid === x.uid) && x.status === 'active')) {
      const z = zone(r.zoneId);
      expect(r.x).toBeGreaterThanOrEqual(z.x + 2.5);
      expect(r.x).toBeLessThanOrEqual(z.x + z.w - 2.5);
      expect(r.y).toBeGreaterThanOrEqual(z.y + 2.5);
      expect(r.y).toBeLessThanOrEqual(z.y + z.h - 2.5);
      expect(r.progress).toBeGreaterThanOrEqual(0);
      expect(r.progress).toBeLessThan(100);
    }
    const r0 = app().state.robots.find((x) => x.uid === start[0].uid);
    expect(r0.battery).toBeLessThan(start[0].battery);
  });

  it('idles an active robot whose battery drops below 12%', () => {
    const { app } = renderApp();
    const r = app().state.robots.find((x) => x.status === 'active');
    act(() => app().updRobot(r.uid, { battery: 12.05 }));
    tick(app);
    expect(app().state.robots.find((x) => x.uid === r.uid).status).toBe('idle');
  });

  it('raises a new alert every 9th tick', () => {
    const { app } = renderApp();
    const n = app().state.alerts.length;
    tick(app, 9);
    expect(app().state.alerts).toHaveLength(n);
    tick(app);
    expect(app().state.alerts).toHaveLength(n + 1);
    expect(app().state.alerts[0].acked).toBe(false);
  });

  it('never lets in-progress jobs reach 100%', () => {
    const { app } = renderApp();
    tick(app, 100);
    for (const j of app().state.jobs.filter((x) => x.status === 'inprogress')) expect(j.progress).toBeLessThanOrEqual(99);
  });

  it('runs on timers when liveTelemetry is on, and stops on unmount', () => {
    vi.useFakeTimers();
    const ref = React.createRef();
    const { unmount } = render(<App ref={ref} liveTelemetry />);
    act(() => vi.advanceTimersByTime(1400 * 3));
    expect(ref.current.state.tick).toBe(3);
    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });

  it('does not tick when liveTelemetry is off', () => {
    vi.useFakeTimers();
    const ref = React.createRef();
    render(<App ref={ref} liveTelemetry={false} />);
    act(() => vi.advanceTimersByTime(10000));
    expect(ref.current.state.tick).toBe(0);
  });
});

describe('toasts', () => {
  it('dismiss themselves after 3.2s', () => {
    vi.useFakeTimers();
    render(<App liveTelemetry={false} />);
    fireEvent.click(screen.getByRole('button', { name: 'Global E-STOP' }));
    expect(screen.getByRole('status')).toHaveTextContent('GLOBAL E-STOP engaged');
    act(() => vi.advanceTimersByTime(3199));
    expect(screen.getByRole('status')).toHaveTextContent('GLOBAL E-STOP engaged');
    act(() => vi.advanceTimersByTime(1));
    expect(screen.getByRole('status')).toBeEmptyDOMElement();
  });
});

describe('charging', () => {
  it('lists low-battery units in the queue and docks them', async () => {
    const { user, app } = renderApp();
    const r = app().state.robots.find((x) => x.status === 'active');
    act(() => app().updRobot(r.uid, { battery: 10 }));
    await goTo(user, 'Charging');
    expect(main().getByText(r.id)).toBeInTheDocument();
    expect(main().getByText('Offline · service')).toBeInTheDocument();

    // The queue is sorted by battery, so the 10% unit is first.
    await user.click(main().getAllByRole('button', { name: 'Dock' })[0]);
    expect(screen.getByRole('status')).toHaveTextContent(`${r.id} sent to charge dock`);
    expect(app().state.robots.find((x) => x.uid === r.uid).status).toBe('charging');
  });
});

describe('shift handover', () => {
  it('records notes, ticks the checklist and submits', async () => {
    const { user } = renderApp();
    await goTo(user, 'Shift handover');
    const notes = main().getByPlaceholderText(/HX-224 isolated/);
    await user.type(notes, 'Pick zone one unit short');
    expect(notes).toHaveValue('Pick zone one unit short');

    const [first] = main().getAllByRole('checkbox');
    await user.click(first);
    expect(first).toBeChecked();
    expect(main().getByText('Production log reconciled')).toHaveStyle({ textDecoration: 'line-through' });
    await user.click(first);
    expect(first).not.toBeChecked();

    await user.click(main().getByRole('button', { name: 'Complete handover' }));
    expect(screen.getByRole('status')).toHaveTextContent('Handover submitted to shift C');
  });

  it('carries unacknowledged warnings, work orders and blocked jobs', async () => {
    const { user } = renderApp();
    await goTo(user, 'Shift handover');
    expect(main().getByText('Replace shoulder actuator')).toBeInTheDocument();
    expect(main().getByText('Mount suspension arm')).toBeInTheDocument();
    expect(main().getByText('Battery below 20% — schedule charge')).toBeInTheDocument();
    expect(main().queryByText('Cycle time 18% above target')).not.toBeInTheDocument();
  });
});

describe('floor map', () => {
  it('switches between live positions and the congestion heatmap', async () => {
    const { user } = renderApp();
    await goTo(user, 'Floor map');
    expect(main().getAllByTitle(/^HX-\d{3}$/)).toHaveLength(24);
    expect(main().queryByText('high density')).not.toBeInTheDocument();

    await user.click(main().getByRole('button', { name: 'Congestion' }));
    expect(main().queryAllByTitle(/^HX-\d{3}$/)).toHaveLength(0);
    expect(main().getByText('high density')).toBeInTheDocument();
  });

  it('opens a robot when its marker is clicked', async () => {
    const { user } = renderApp();
    await goTo(user, 'Floor map');
    await user.click(main().getByTitle('HX-210'));
    expect(screen.getByRole('heading', { level: 1, name: 'HX-210' })).toBeInTheDocument();
  });
});
