import { describe, expect, it } from 'vitest';
import { screen, within } from '@testing-library/react';
import { renderApp, goTo, main } from './helpers.jsx';

const palette = () => screen.queryByRole('dialog', { name: 'Command palette' });

async function openRobot(user, id) {
  await user.keyboard('{Control>}k{/Control}');
  await user.type(within(palette()).getByRole('textbox'), id);
  await user.keyboard('{Enter}');
  expect(screen.getByRole('heading', { level: 1, name: id })).toBeInTheDocument();
}

const status = () => main().getByRole('heading', { level: 1 }).parentElement.nextSibling.textContent;
const eventLog = () => main().getByText('Event log').nextSibling;

describe('command palette', () => {
  it('opens with Ctrl+K and the search button, closes with Escape or backdrop', async () => {
    const { user } = renderApp();
    await user.keyboard('{Control>}k{/Control}');
    expect(palette()).toBeInTheDocument();
    expect(within(palette()).getByRole('textbox')).toHaveFocus();
    await user.keyboard('{Escape}');
    expect(palette()).not.toBeInTheDocument();

    await user.click(screen.getByTitle('Search (⌘K)'));
    expect(palette()).toBeInTheDocument();
    await user.click(palette().parentElement);
    expect(palette()).not.toBeInTheDocument();
  });

  it('filters by label and kind, capped at 8 results', async () => {
    const { user } = renderApp();
    await user.keyboard('{Control>}k{/Control}');
    const box = within(palette()).getByRole('textbox');
    expect(within(palette()).getAllByRole('button')).toHaveLength(8);
    await user.type(box, 'robot');
    expect(within(palette()).getAllByRole('button').every((b) => b.textContent.startsWith('Robot'))).toBe(true);
    await user.clear(box);
    await user.type(box, 'analytics');
    expect(within(palette()).getAllByRole('button')).toHaveLength(1);
  });

  it('runs navigation and theme actions', async () => {
    const { user, container } = renderApp();
    await user.keyboard('{Control>}k{/Control}');
    await user.click(within(palette()).getByRole('button', { name: /Floor map/ }));
    expect(screen.getByRole('heading', { level: 1, name: 'Floor map' })).toBeInTheDocument();
    expect(palette()).not.toBeInTheDocument();

    await user.keyboard('{Control>}k{/Control}');
    await user.type(within(palette()).getByRole('textbox'), 'theme');
    await user.click(within(palette()).getByRole('button', { name: /Switch to light theme/ }));
    expect(container.firstChild).not.toHaveClass('dark');
  });
});

describe('robot detail commands', () => {
  it('Send to charge moves the robot to the charge dock', async () => {
    const { user } = renderApp();
    await openRobot(user, 'HX-201');
    await user.click(main().getByRole('button', { name: 'Send to charge' }));
    expect(status()).toBe('Charging');
    expect(main().getByText(/· Charging · uptime/)).toBeInTheDocument();
    expect(within(eventLog()).getByText('Dispatched to charge dock')).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('HX-201 sent to charge dock');
  });

  it('Recall sends the robot to the maintenance bay as idle', async () => {
    const { user } = renderApp();
    await openRobot(user, 'HX-201');
    await user.click(main().getByRole('button', { name: 'Recall to bay' }));
    expect(status()).toBe('Idle');
    expect(main().getByText(/· Maintenance · uptime/)).toBeInTheDocument();
    expect(main().getByText('Awaiting diagnostics')).toBeInTheDocument();
  });

  it('Reassign gives an active robot a new task, then Pause/Resume toggles it', async () => {
    const { user } = renderApp();
    await openRobot(user, 'HX-201');
    await user.click(main().getByRole('button', { name: 'Reassign task' }));
    expect(status()).toBe('Active');
    expect(main().getByText('0% complete')).toBeInTheDocument();

    await user.click(main().getByRole('button', { name: 'Pause' }));
    expect(status()).toBe('Idle');
    expect(screen.getByRole('status')).toHaveTextContent('HX-201 paused');

    await user.click(main().getByRole('button', { name: 'Resume' }));
    expect(status()).toBe('Active');
    expect(screen.getByRole('status')).toHaveTextContent('HX-201 resumed');
    expect(within(eventLog()).getByText('Resumed by operator')).toBeInTheDocument();
  });

  it('Emergency stop faults the robot and raises a critical alert', async () => {
    const { user } = renderApp();
    await openRobot(user, 'HX-201');
    await user.click(main().getByRole('button', { name: 'Emergency stop' }));
    expect(status()).toBe('Fault');
    expect(within(eventLog()).getByText('E-STOP engaged by operator')).toBeInTheDocument();

    await goTo(user, 'Alerts');
    expect(main().getByText('E-stop engaged by operator')).toBeInTheDocument();
    expect(Number(main().getByText('Critical').nextSibling.textContent)).toBe(2);
  });

  it('teleop pad logs each manual move', async () => {
    const { user } = renderApp();
    await openRobot(user, 'HX-201');
    for (const [btn, text] of [['Forward', 'forward'], ['Reverse', 'reverse'], ['Rotate left', 'rotate left'], ['Rotate right', 'rotate right'], ['Stop', 'stop']]) {
      await user.click(main().getByRole('button', { name: btn }));
      expect(within(eventLog()).getAllByText(`Manual teleop — ${text}`)[0]).toBeInTheDocument();
    }
    expect(screen.getByRole('status')).toHaveTextContent('HX-201 teleop: stop');
  });

  it('shows telemetry, joints and service info', async () => {
    const { user } = renderApp();
    await openRobot(user, 'HX-201');
    for (const label of ['Battery', 'Motor temp', 'Payload', 'Network']) expect(main().getByText(label)).toBeInTheDocument();
    for (const joint of ['Neck', 'L-shoulder', 'R-hip']) expect(main().getByText(joint)).toBeInTheDocument();
    expect(main().getByText(/^MTBF \d+h$/)).toBeInTheDocument();
  });
});
