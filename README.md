# Orchestrator — Control Panel

A floor-operations console for supervising a fleet of humanoid robots, built with React and Vite from a Claude Design prototype.

All data is simulated in the browser: robots move around the floor map, batteries drain and charge, jobs progress and new alerts appear on their own. There is no backend yet.

## Features

- **Fleet overview** — KPIs, a status bar, status filters, and card or zone-grouped table views
- **Floor map** — live robot positions, personnel, no-go zones and charge docks, with a congestion heatmap
- **Job queue** — queued, in-progress, blocked and done columns
- **Charging & docks** — bay occupancy, state of charge, power draw and a charge queue
- **Alerts & incidents** — acknowledge or resolve alerts, incident detail with timeline, editable alert rules and notification routing
- **Analytics** — throughput, utilization, uptime, MTBF and charge cycles
- **Robot detail** — live telemetry, joint status, commands (pause, reassign, charge, recall, emergency stop) and a teleop pad
- **Maintenance** — service schedule, work orders, spare parts and out-of-service units
- **Plant rollup** — line performance and output by shift
- **Shift handover** — carryover items, watch list, notes and sign-off checklist
- **Everywhere** — command palette (`Ctrl+K` / `⌘K`), plant switcher, global E-stop, and light/dark themes

## Getting started

Requires Node.js 20.19 or later (22.13+ also works).

```bash
npm install
npm run dev
```

Then open http://localhost:5173. The layout is designed for desktop widths (about 1000px and up).

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the dev server with hot reload |
| `npm run build` | Build a production bundle into `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm test` | Run the test suite once |
| `npm run test:watch` | Re-run tests as files change |

## Configuration

`App` takes three props, set in [`src/main.jsx`](src/main.jsx):

| Prop | Default | Description |
| --- | --- | --- |
| `plantName` | `"Meridian — Building 4"` | Name of the home site in the header |
| `defaultTheme` | `"dark"` | Starting theme, `"dark"` or `"light"` |
| `liveTelemetry` | `true` | Run the live simulation; set `false` to freeze the data |

## Project structure

```
src/
  App.jsx          State, simulation and actions; derives everything the views render
  data.js          Static fixtures: zones, plants, docks, parts, work orders, rules
  views/           One component per screen, plus sidebar, top bar, palette and toasts
  ui.jsx           Shared building blocks (cards, KPI grid, bars, icons)
  sx.js            Turns the design's CSS declaration strings into React styles and hover classes
  styles.css       Design tokens (light and dark) and animations
  test/            Vitest + Testing Library suites
```

## Testing

The suite (60 tests) drives the app the way a user would with [Vitest](https://vitest.dev) and [Testing Library](https://testing-library.com), covering navigation, filters, E-stop, plant switching, alerts and rules, robot commands, the command palette, the simulation, charging, handover and the floor map. `Math.random` is seeded in [`src/test/setup.js`](src/test/setup.js), so every run produces the same fleet.

```bash
npm test
```
