import { describe, expect, it } from 'vitest';
import { fireEvent, screen } from '@testing-library/react';
import { renderApp, goTo, main, sideNav } from './helpers.jsx';

const CRITICAL_MSG = 'E-stop triggered — joint torque limit exceeded';
const alertsBadge = () => sideNav().getByRole('button', { name: /^Alerts/ }).textContent.replace('Alerts', '');
const sevCount = (label) => Number(main().getByText(label).nextSibling.textContent);

describe('alerts', () => {
  it('lists seeded alerts with severity totals and an unacknowledged badge', async () => {
    const { user } = renderApp();
    expect(alertsBadge()).toBe('3');
    await goTo(user, 'Alerts');
    expect(sevCount('Critical')).toBe(1);
    expect(sevCount('Warning')).toBe(2);
    expect(sevCount('Info')).toBe(2);
    expect(main().getAllByRole('button', { name: 'Ack' })).toHaveLength(3);
    expect(main().getAllByText('acknowledged')).toHaveLength(2);
  });

  it('Ack marks the alert acknowledged and decrements the badge', async () => {
    const { user } = renderApp();
    await goTo(user, 'Alerts');
    await user.click(main().getAllByRole('button', { name: 'Ack' })[0]);
    expect(main().getAllByRole('button', { name: 'Ack' })).toHaveLength(2);
    expect(main().getAllByText('acknowledged')).toHaveLength(3);
    expect(alertsBadge()).toBe('2');
    expect(screen.getByRole('status')).toHaveTextContent('Alert acknowledged');
    // Ack must not also open the incident.
    expect(screen.getByRole('heading', { level: 1, name: 'Alerts & incidents' })).toBeInTheDocument();
  });

  it('Resolve removes the alert', async () => {
    const { user } = renderApp();
    await goTo(user, 'Alerts');
    await user.click(main().getAllByRole('button', { name: 'Resolve' })[0]);
    expect(main().queryByText(CRITICAL_MSG)).not.toBeInTheDocument();
    expect(sevCount('Critical')).toBe(0);
    expect(alertsBadge()).toBe('2');
    expect(screen.getByRole('status')).toHaveTextContent('Alert resolved');
  });

  it('badge disappears once every alert is acknowledged', async () => {
    const { user } = renderApp();
    await goTo(user, 'Alerts');
    for (let i = 0; i < 3; i++) await user.click(main().getAllByRole('button', { name: 'Ack' })[0]);
    expect(alertsBadge()).toBe('');
  });
});

describe('incident detail', () => {
  it('opens from the list, acknowledges, and resolves back to the list', async () => {
    const { user } = renderApp();
    await goTo(user, 'Alerts');
    await user.click(main().getByText(CRITICAL_MSG));

    expect(screen.getByRole('heading', { level: 1, name: CRITICAL_MSG })).toBeInTheDocument();
    expect(main().getByText('Open · Critical')).toBeInTheDocument();
    expect(main().getByText(/Dispatch the on-call technician now/)).toBeInTheDocument();
    expect(main().getByText('Telemetry snapshot')).toBeInTheDocument();

    await user.click(main().getByRole('button', { name: 'Acknowledge' }));
    expect(main().queryByText('Open · Critical')).not.toBeInTheDocument();
    expect(main().getAllByText('Acknowledged')).toHaveLength(2); // status chip + details row
    expect(main().getByText('Acknowledged by operator')).toBeInTheDocument();

    await user.click(main().getByRole('button', { name: 'Resolve incident' }));
    expect(screen.getByRole('heading', { level: 1, name: 'Alerts & incidents' })).toBeInTheDocument();
    expect(main().queryByText(CRITICAL_MSG)).not.toBeInTheDocument();
  });

  it('"Open robot" jumps to the robot named in the incident', async () => {
    const { user, app } = renderApp();
    const faulted = app().state.robots.find((r) => r.status === 'fault');
    await goTo(user, 'Alerts');
    await user.click(main().getByText(CRITICAL_MSG));
    await user.click(main().getByRole('button', { name: 'Open robot' }));
    expect(screen.getByRole('heading', { level: 1, name: faulted.id })).toBeInTheDocument();
  });

  it('Escape keeps the incident open', async () => {
    const { user } = renderApp();
    await goTo(user, 'Alerts');
    await user.click(main().getByText(CRITICAL_MSG));
    await user.keyboard('{Escape}');
    expect(screen.getByRole('heading', { level: 1, name: CRITICAL_MSG })).toBeInTheDocument();
  });
});

describe('alert rules', () => {
  async function openRules() {
    const ctx = renderApp();
    await goTo(ctx.user, 'Alerts');
    await ctx.user.click(main().getByRole('button', { name: 'Rules & routing' }));
    return ctx;
  }

  it('steps a threshold and updates its description', async () => {
    const { user } = await openRules();
    const [battPlus] = main().getAllByRole('button', { name: '+' });
    const [battMinus] = main().getAllByRole('button', { name: '−' });
    await user.click(battPlus);
    expect(main().getByText('State of charge below 21%')).toBeInTheDocument();
    await user.click(battMinus);
    await user.click(battMinus);
    expect(main().getByText('State of charge below 19%')).toBeInTheDocument();
  });

  it('clamps thresholds to 0 and to the 90°C temperature cap', async () => {
    await openRules();
    const plus = main().getAllByRole('button', { name: '+' });
    const minus = main().getAllByRole('button', { name: '−' });
    for (let i = 0; i < 50; i++) fireEvent.click(plus[1]);
    expect(main().getByText('Any joint temp above 90°C')).toBeInTheDocument();
    for (let i = 0; i < 30; i++) fireEvent.click(minus[0]);
    expect(main().getByText('State of charge below 0%')).toBeInTheDocument();
  });

  it('geofence rule has no stepper', async () => {
    await openRules();
    expect(main().getByText('Unit enters a mapped no-go zone')).toBeInTheDocument();
    expect(main().getAllByRole('button', { name: '+' })).toHaveLength(4);
  });

  it('toggles a rule on and off', async () => {
    const { user } = await openRules();
    const toggle = main().getByRole('button', { name: 'Toggle Low battery' });
    expect(toggle).toHaveAttribute('aria-pressed', 'true');
    await user.click(toggle);
    expect(toggle).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByRole('status')).toHaveTextContent('Rule disabled');
    await user.click(toggle);
    expect(toggle).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('status')).toHaveTextContent('Rule enabled');
  });

  it('shows notification routing per channel', async () => {
    await openRules();
    expect(main().getByText('Pager — on-call')).toBeInTheDocument();
    expect(main().getByText('SMS escalation')).toBeInTheDocument();
  });
});
