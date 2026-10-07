import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import { renderApp, goTo, main } from './helpers.jsx';

const SCREENS = [
  ['Floor map', 'Floor map'],
  ['Job queue', 'Job queue'],
  ['Charging', 'Charging & docks'],
  ['Alerts', 'Alerts & incidents'],
  ['Analytics', 'Analytics'],
  ['Maintenance', 'Maintenance & reliability'],
  ['Plant rollup', 'Plant rollup'],
  ['Shift handover', 'Shift handover'],
  ['Fleet overview', 'Fleet overview'],
];

describe('navigation', () => {
  it('opens on the fleet overview with the configured plant name', () => {
    renderApp();
    expect(screen.getByRole('heading', { level: 1, name: 'Fleet overview' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Quantum/ })).toBeInTheDocument();
    expect(main().getByText('24 humanoid units across 6 zones · real-time telemetry')).toBeInTheDocument();
  });

  it.each(SCREENS)('sidebar "%s" shows the %s screen', async (nav, heading) => {
    const { user } = renderApp();
    await goTo(user, nav);
    expect(screen.getByRole('heading', { level: 1, name: heading })).toBeInTheDocument();
  });

  it('shows the signed-in supervisor in the top bar account button', () => {
    renderApp();
    const account = screen.getByTitle('Account');
    expect(account).toHaveTextContent('RM');
    expect(account).toHaveTextContent('R. Marín');
    expect(account).toHaveTextContent('Line supervisor');
  });

  it('falls back to the design default plant name', () => {
    renderApp({ plantName: '' });
    expect(screen.getByRole('button', { name: /Meridian — Building 4/ })).toBeInTheDocument();
  });

  it('toggles between dark and light themes', async () => {
    const { user, container } = renderApp();
    const root = container.firstChild;
    expect(root).toHaveClass('dark');
    await user.click(screen.getByTitle('Toggle theme'));
    expect(root).not.toHaveClass('dark');
    await user.click(screen.getByTitle('Toggle theme'));
    expect(root).toHaveClass('dark');
  });

  it('honours defaultTheme="light"', () => {
    const { container } = renderApp({ defaultTheme: 'light' });
    expect(container.firstChild).not.toHaveClass('dark');
  });
});
