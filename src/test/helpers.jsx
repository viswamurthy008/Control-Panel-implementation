import React from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App.jsx';

/** Render the app with live telemetry off so state only changes when a test acts. */
export function renderApp(props = {}) {
  const ref = React.createRef();
  const user = userEvent.setup();
  const utils = render(<App ref={ref} liveTelemetry={false} plantName="Quantum" {...props} />);
  return { ...utils, user, app: () => ref.current };
}

export const main = () => within(screen.getByRole('main'));
export const sideNav = () => within(screen.getByRole('navigation'));

export async function goTo(user, label) {
  await user.click(sideNav().getByRole('button', { name: new RegExp('^' + label) }));
}

/** Number shown after a fleet filter chip, e.g. "Active 17" → 17. */
export function filterCount(label) {
  const btn = main().getByRole('button', { name: new RegExp(`^${label}\\s*\\d+$`) });
  return Number(btn.textContent.replace(label, ''));
}

export const robotIds = () => main().queryAllByText(/^HX-\d{3}$/);
