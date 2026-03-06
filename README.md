# FleetOS

A full-stack fleet governance and scheduling dashboard built with React. Includes live telemetry simulation, multi-role access control, vehicle management, booking schedules, and analytics — all running client-side with no backend required.

---

## Screenshots

> Login → Dashboard → Live Telemetry → Vehicles → Schedules → Reports

---

## Features

- **Multi-role authentication** — Super Admin, Org Admin, Fleet Manager, Driver
- **Live telemetry simulator** — 5 vehicles streaming speed, temperature, RPM, battery/fuel every 2 seconds
- **AI anomaly detection** — rule-based alert engine with LOW / MEDIUM / HIGH risk scoring
- **Vehicle management** — full CRUD with filtering by category and status
- **Schedule & booking system** — conflict detection, status lifecycle (reserved → active → completed)
- **Organization management** — multi-tenant structure with per-org vehicle and user scoping
- **Reports & analytics** — utilization charts, fleet status breakdowns, org comparisons
- **CSV export** — download telemetry history per vehicle
- **Optional FastAPI backend** — connects to a live backend for real alert fetching and exports; falls back to Demo Mode automatically

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18 |
| Build tool | Vite |
| Charts | Recharts |
| Icons | Lucide React |
| Styling | Inline styles (no CSS framework) |
| Backend (optional) | FastAPI on `localhost:8000` |

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org) v18+
- npm v9+

### Installation

```bash
# 1. Create a Vite React project
npm create vite@latest fleetos -- --template react
cd fleetos

# 2. Install dependencies
npm install recharts lucide-react

# 3. Replace src/App.jsx with FleetOS.jsx
cp /path/to/FleetOS.jsx src/App.jsx

# 4. Start the dev server
npm run dev
```

Open **http://localhost:5173** in your browser.

---

## Demo Accounts

| Role | Email | Password |
|---|---|---|
| Super Admin | super@fleet.com | admin123 |
| Org Admin | admin@mcc.com | admin123 |
| Fleet Manager | manager@mcc.com | manager123 |
| Driver | driver@mcc.com | driver123 |

> Passwords are hashed client-side using a salted `btoa` scheme. Do not use these credentials in a production environment — integrate a real auth provider instead.

---

## Project Structure

```
fleetos/
├── src/
│   ├── App.jsx        ← entire application (FleetOS.jsx)
│   └── main.jsx       ← React entry point
├── index.html
├── package.json
└── vite.config.js
```

All application logic lives in a single `App.jsx` file, organized into the following sections:

```
Theme & color constants
Mock data (users, orgs, vehicles, schedules)
Telemetry simulator (tickSimState, toReading, buildAlerts, computeStats)
Shared UI atoms (Badge, Modal, Field, Btn, StatCard, GaugeMini)
Pages (LoginScreen, Dashboard, TelemetryPage, VehiclesPage,
        SchedulesPage, OrgsPage, UsersPage, ReportsPage)
Layout (Sidebar, TopBar)
App root (FleetApp)
```

---

## Role Permissions

| Feature | Super Admin | Org Admin | Fleet Manager | Driver |
|---|:---:|:---:|:---:|:---:|
| View all orgs | ✅ | ❌ | ❌ | ❌ |
| Manage organizations | ✅ | ❌ | ❌ | ❌ |
| Manage users | ✅ | ✅ (own org) | ❌ | ❌ |
| Add / edit vehicles | ✅ | ✅ | ✅ | ❌ |
| Create bookings | ✅ | ✅ | ✅ | ❌ |
| View own bookings | ✅ | ✅ | ✅ | ✅ |
| View telemetry | ✅ | ✅ | ✅ | ✅ |
| View reports | ✅ | ✅ | ✅ | ❌ |

---

## Telemetry Simulator

The simulator runs entirely in the browser using a `useReducer` that ticks every 2 seconds. It mirrors the logic of a `simulator.py` backend script.

Each simulated vehicle tracks:

| Metric | Unit | EV | Petrol/Diesel/Hybrid |
|---|---|:---:|:---:|
| Speed | km/h | ✅ | ✅ |
| Engine temperature | °C | ✅ | ✅ |
| Engine RPM | — | ✅ | ✅ |
| Battery level | % | ✅ | ❌ |
| Fuel level | L | ❌ | ✅ |
| GPS coordinates | lat/lon | ✅ | ✅ |

**Anomalies** are injected at random intervals:

| Anomaly | Trigger | Vehicles |
|---|---|---|
| `overspeed` | Speed forced to 135–155 km/h | All |
| `overheat` | Temperature forced to 102–110°C | All |
| `low_battery` | Battery forced to 5–12% | EV only |

**Risk scoring:**

| Level | Condition |
|---|---|
| LOW | No alerts |
| MEDIUM | Alerts present, not critical |
| HIGH | Temperature > 104°C or speed > 140 km/h |

---

## Optional Backend (FastAPI)

When a FastAPI server is running at the configured URL (default `http://localhost:8000`), the app switches from Demo Mode to Connected Mode and uses:

| Endpoint | Used for |
|---|---|
| `GET /` | Health check (ping every 10s) |
| `GET /alerts/{vehicle_id}` | Fetch AI-generated alert analysis |
| `GET /export/{vehicle_id}/csv?range=` | Download telemetry CSV |

If the backend is unavailable or unreachable, the app falls back to its built-in alert engine and client-side CSV export automatically.

---

## Deployment

### Vercel (recommended)

```bash
# Push to GitHub
git init && git add . && git commit -m "initial commit"
git remote add origin https://github.com/YOUR_USERNAME/fleetos.git
git push -u origin main
```

Then go to [vercel.com/new](https://vercel.com/new), import the repository, and deploy. Vercel auto-detects Vite — no configuration needed.

### Other platforms

Any static hosting that supports Vite builds works:

```bash
npm run build      # outputs to dist/
```

Upload the `dist/` folder to Netlify, GitHub Pages, AWS S3, Cloudflare Pages, etc.

---

## Known Limitations

- **No persistent storage** — all data (vehicles, schedules, users) resets on page refresh. Integrate a database and API to persist changes.
- **Client-side auth only** — the login system is for demonstration. Replace with a real authentication provider (e.g. Auth0, Supabase, Firebase Auth) before any production use.
- **Single-file architecture** — the entire app is in one file (~1000 lines). For a production codebase, split into separate component and page files.
- **No real GPS** — vehicle coordinates are randomly drifted from a base position in Chennai, India. Replace with a real GPS feed via the backend.

---

## License

MIT
