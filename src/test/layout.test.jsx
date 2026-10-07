import { describe, expect, it } from 'vitest';
import { act, screen } from '@testing-library/react';
import { renderApp, goTo, sideNav } from './helpers.jsx';

const toggle = () => screen.getByRole('button', { name: 'Main navigation' });
const sidebar = () => screen.getByRole('complementary', { name: 'Sidebar' });

describe('collapsible sidebar', () => {
  it('starts expanded with labels, sections and zones', () => {
    const { container } = renderApp();
    expect(toggle()).toHaveAttribute('aria-expanded', 'true');
    expect(toggle()).toHaveAttribute('title', 'Collapse sidebar');
    expect(sideNav().getByText('Fleet overview')).toBeInTheDocument();
    expect(screen.getByText('Operations')).toBeInTheDocument();
    expect(screen.getByText('Zones')).toBeInTheDocument();
    expect(container.firstChild.style.gridTemplateColumns).toBe('236px 1fr');
  });

  it('collapses to an icon rail and expands again', async () => {
    const { user, container } = renderApp();
    await user.click(toggle());

    expect(toggle()).toHaveAttribute('aria-expanded', 'false');
    expect(toggle()).toHaveAttribute('title', 'Expand sidebar');
    expect(container.firstChild.style.gridTemplateColumns).toBe('64px 1fr');
    expect(screen.queryByText('Orchestrator')).not.toBeInTheDocument();
    expect(screen.queryByText('Operations')).not.toBeInTheDocument();
    expect(screen.queryByText('Zones')).not.toBeInTheDocument();
    // Labels are gone but every item keeps its accessible name and tooltip.
    expect(sideNav().queryByText('Fleet overview')).not.toBeInTheDocument();
    const map = sideNav().getByRole('button', { name: 'Floor map' });
    expect(map).toHaveAttribute('title', 'Floor map');

    await user.click(toggle());
    expect(toggle()).toHaveAttribute('aria-expanded', 'true');
    expect(sideNav().getByText('Fleet overview')).toBeInTheDocument();
  });

  it('still navigates while collapsed', async () => {
    const { user } = renderApp();
    await user.click(toggle());
    await goTo(user, 'Analytics');
    expect(screen.getByRole('heading', { level: 1, name: 'Analytics' })).toBeInTheDocument();
    expect(sideNav().getByRole('button', { name: 'Analytics' })).toHaveAttribute('aria-current', 'page');
  });

  it('shows a dot instead of the alert count when collapsed', async () => {
    const { user } = renderApp();
    const alerts = () => sideNav().getByRole('button', { name: /^Alerts/ });
    expect(alerts()).toHaveAccessibleName('Alerts, 3 unacknowledged');
    expect(alerts()).toHaveTextContent('3');

    await user.click(toggle());
    expect(alerts()).not.toHaveTextContent('3');
    expect(alerts().querySelector('span[aria-hidden="true"]')).toBeInTheDocument();
    expect(alerts()).toHaveAccessibleName('Alerts, 3 unacknowledged');
  });

  it('remembers the collapsed state across reloads', async () => {
    const { user, unmount } = renderApp();
    await user.click(toggle());
    expect(localStorage.getItem('orch.sbCollapsed')).toBe('1');
    unmount();

    renderApp();
    expect(toggle()).toHaveAttribute('aria-expanded', 'false');
    await user.click(toggle());
    expect(localStorage.getItem('orch.sbCollapsed')).toBe('0');
  });

  it('marks only the current screen with aria-current', async () => {
    const { user } = renderApp();
    expect(sideNav().getByRole('button', { name: 'Fleet overview' })).toHaveAttribute('aria-current', 'page');
    await goTo(user, 'Floor map');
    expect(sideNav().getByRole('button', { name: 'Floor map' })).toHaveAttribute('aria-current', 'page');
    expect(sideNav().getByRole('button', { name: 'Fleet overview' })).not.toHaveAttribute('aria-current');
  });

  it('no longer has the footer user block or theme toggle', () => {
    renderApp();
    expect(sidebar()).not.toHaveTextContent('R. Marín');
    expect(screen.queryByTitle('Toggle theme')).not.toBeInTheDocument();
  });
});

describe('responsive top bar', () => {
  // jsdom has no layout, so drive the measured header width directly.
  const setWidth = (app, hw) => act(() => app().setState({ hw }));
  const header = () => screen.getByRole('banner');

  it('shows everything at full width (≥1080px)', () => {
    const { app } = renderApp();
    setWidth(app, 1200);
    expect(header()).toHaveTextContent('Live');
    expect(header()).toHaveTextContent('Search or jump to…');
    expect(header()).toHaveTextContent('online');
    expect(screen.getByTitle('Account')).toHaveTextContent('R. Marín');
    expect(screen.getByRole('button', { name: 'Global E-STOP' })).toBeInTheDocument();
  });

  it('drops search text, online count and account name below 1080px', () => {
    const { app } = renderApp();
    setWidth(app, 1000);
    expect(header()).toHaveTextContent('Live');
    expect(header()).not.toHaveTextContent('Search or jump to…');
    expect(header()).not.toHaveTextContent('online');
    expect(screen.getByTitle('Account')).not.toHaveTextContent('R. Marín');
    expect(screen.getByRole('button', { name: 'Global E-STOP' })).toBeInTheDocument();
  });

  it('also drops "Live" and shortens the E-stop below 820px', () => {
    const { app } = renderApp();
    setWidth(app, 700);
    expect(header()).not.toHaveTextContent('Live');
    expect(screen.getByRole('button', { name: 'E-STOP' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Global E-STOP' })).not.toBeInTheDocument();
    expect(header().style.padding).toBe('0px 14px');
  });

  it('keeps "Release all" at any width while the E-stop is engaged', async () => {
    const { app, user } = renderApp();
    setWidth(app, 700);
    await user.click(screen.getByRole('button', { name: 'E-STOP' }));
    expect(screen.getByRole('button', { name: 'Release all' })).toBeInTheDocument();
  });
});

describe('header width observer', () => {
  // A controllable stand-in for the browser's ResizeObserver.
  function installMockObserver() {
    const observers = [];
    class MockRO {
      constructor(cb) { this.cb = cb; this.targets = new Set(); observers.push(this); }
      observe(el) { this.targets.add(el); }
      disconnect() { this.targets.clear(); }
    }
    globalThis.ResizeObserver = MockRO;
    const resize = (el, borderWidth) => {
      const live = observers.filter((o) => o.targets.has(el));
      act(() => live.forEach((o) => o.cb([{ target: el, borderBoxSize: [{ inlineSize: borderWidth }] }])));
      return live.length;
    };
    return { resize, restore: () => { delete globalThis.ResizeObserver; } };
  }

  it('keeps observing after a StrictMode remount', async () => {
    const { resize, restore } = installMockObserver();
    try {
      const React = (await import('react')).default;
      const { render } = await import('@testing-library/react');
      const App = (await import('../App.jsx')).default;
      render(<React.StrictMode><App liveTelemetry={false} /></React.StrictMode>);
      const header = screen.getByRole('banner');
      expect(resize(header, 700)).toBe(1); // exactly one live observer
      expect(screen.getByRole('button', { name: 'E-STOP' })).toBeInTheDocument();
      resize(header, 1300);
      expect(screen.getByRole('button', { name: 'Global E-STOP' })).toBeInTheDocument();
    } finally { restore(); }
  });

  it('does not flip layouts when the header padding changes (848–863px)', () => {
    const { resize, restore } = installMockObserver();
    try {
      renderApp();
      const header = screen.getByRole('banner');
      resize(header, 854);
      const first = screen.getByRole('button', { name: /E-STOP$/ }).textContent;
      // Re-measuring the same border box after the padding change must not toggle.
      for (let i = 0; i < 5; i++) {
        resize(header, 854);
        expect(screen.getByRole('button', { name: /E-STOP$/ }).textContent).toBe(first);
      }
    } finally { restore(); }
  });

  it('matches the design breakpoints at full, mid and compact widths', () => {
    const { resize, restore } = installMockObserver();
    try {
      renderApp();
      const header = screen.getByRole('banner');
      resize(header, 1194); // 1440px window
      expect(header).toHaveTextContent('Search or jump to…');
      resize(header, 1054); // 1300px window: mid
      expect(header).not.toHaveTextContent('Search or jump to…');
      expect(header).toHaveTextContent('Live');
      resize(header, 654); // 900px window: compact
      expect(header).not.toHaveTextContent('Live');
      expect(screen.getByRole('button', { name: 'E-STOP' })).toBeInTheDocument();
    } finally { restore(); }
  });
});
