import { describe, expect, it } from 'vitest';
import { screen, within } from '@testing-library/react';
import { renderApp, main, filterCount, robotIds } from './helpers.jsx';

describe('fleet overview', () => {
  it('filter chips count the fleet and filter the cards', async () => {
    const { user } = renderApp();
    const counts = ['Active', 'Charging', 'Idle', 'Fault'].map(filterCount);
    expect(counts.reduce((a, b) => a + b, 0)).toBe(filterCount('All'));
    expect(robotIds()).toHaveLength(24);

    for (const status of ['Active', 'Charging', 'Idle', 'Fault']) {
      await user.click(main().getByRole('button', { name: new RegExp(`^${status}\\s*\\d+$`) }));
      expect(robotIds()).toHaveLength(filterCount(status));
    }
  });

  it('table view groups robots by zone and collapses a group', async () => {
    const { user } = renderApp();
    await user.click(main().getByRole('button', { name: 'Table' }));
    expect(main().getByText('Current task')).toBeInTheDocument();
    expect(main().getByText('HX-201')).toBeInTheDocument();

    await user.click(main().getByText('Assembly A'));
    expect(main().queryByText('HX-201')).not.toBeInTheDocument();
    expect(main().getByText('HX-205')).toBeInTheDocument(); // Assembly B still open

    await user.click(main().getByText('Assembly A'));
    expect(main().getByText('HX-201')).toBeInTheDocument();
  });

  it('clicking a robot card opens its detail page', async () => {
    const { user } = renderApp();
    await user.click(main().getByText('HX-203'));
    expect(screen.getByRole('heading', { level: 1, name: 'HX-203' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Back to fleet' }));
    expect(screen.getByRole('heading', { level: 1, name: 'Fleet overview' })).toBeInTheDocument();
  });

  it('global E-stop halts every active unit and release resumes them', async () => {
    const { user, app } = renderApp();
    const activeBefore = filterCount('Active');
    const faultBefore = filterCount('Fault');
    expect(activeBefore).toBeGreaterThan(0);

    await user.click(screen.getByRole('button', { name: 'Global E-STOP' }));
    expect(screen.getByRole('button', { name: 'Release all' })).toBeInTheDocument();
    expect(filterCount('Active')).toBe(0);
    expect(filterCount('Fault')).toBe(faultBefore + activeBefore);
    expect(screen.getByRole('status')).toHaveTextContent('GLOBAL E-STOP engaged');

    await user.click(screen.getByRole('button', { name: 'Release all' }));
    expect(screen.getByRole('button', { name: 'Global E-STOP' })).toBeInTheDocument();
    // Units with >15% battery resume; the pre-existing maintenance fault also clears.
    const resumed = app().state.robots.filter((r) => r.safety === 'estop');
    expect(resumed).toHaveLength(0);
    expect(filterCount('Active')).toBeGreaterThanOrEqual(activeBefore);
    expect(screen.getByRole('status')).toHaveTextContent('E-stop released — fleet resuming');
  });

  it('switching plant rebuilds the fleet for that site', async () => {
    const { user } = renderApp();
    await user.click(screen.getByRole('button', { name: /Quantum/ }));
    const menu = screen.getByText('Switch site').parentElement;
    await user.click(within(menu).getByRole('button', { name: /Kite Logistics DC/ }));

    expect(screen.queryByText('Switch site')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Kite Logistics DC/ })).toBeInTheDocument();
    expect(main().getByText('48 humanoid units across 6 zones · real-time telemetry')).toBeInTheDocument();
    expect(filterCount('All')).toBe(48);
    expect(screen.getByRole('status')).toHaveTextContent('Switched to Kite Logistics DC');
  });

  it('Escape closes the plant menu', async () => {
    const { user } = renderApp();
    await user.click(screen.getByRole('button', { name: /Quantum/ }));
    expect(screen.getByText('Switch site')).toBeInTheDocument();
    await user.keyboard('{Escape}');
    expect(screen.queryByText('Switch site')).not.toBeInTheDocument();
  });
});
