 🚛 FleetOS

**Fleet Governance & Scheduling System** — A full-featured, single-file React dashboard for managing vehicles, bookings, users, and live telemetry across multiple organizations.

![React](https://img.shields.io/badge/React-18+-61DAFB?logo=react&logoColor=black)
![Recharts](https://img.shields.io/badge/Recharts-2.x-22d3ee)
![Lucide](https://img.shields.io/badge/Lucide_Icons-0.263-a78bfa)
![License](https://img.shields.io/badge/License-MIT-34d399)

---

## ✨ Features

### 🔐 Role-Based Access Control
Four distinct roles, each with scoped views and permissions:

| Role | Access |
|---|---|
| **Super Admin** | Full platform access — all orgs, vehicles, users, reports |
| **Org Admin** | Manages their own organization's fleet and users |
| **Fleet Manager** | Manages vehicles and schedules within their org |
| **Driver** | Views their own assigned bookings |

### 📡 Live Telemetry (simulator.py mirror)
- Real-time simulation of 5 vehicles (EV, Petrol, Diesel, Hybrid) refreshing every 2 seconds
- Per-vehicle gauges for speed, temperature, battery/fuel level, and engine RPM
- Anomaly injection: overspeed, overheating, low battery
- AI anomaly analysis with risk scoring (LOW / MEDIUM / HIGH)
- Historical charts (speed, temp, battery/fuel, RPM) with configurable time range
- CSV export of telemetry history (local or via `/export/{vehicle_id}/csv` endpoint)
- Optional API connection to a live backend (`http://localhost:8000`)

### 🚗 Vehicle Management
- Full CRUD — add, edit, and delete vehicles
- Filter by category (Sedan, SUV, Van, Truck, Bus) and status (Available, In Use, Maintenance, Reserved)
- Per-vehicle status badges, mileage tracking, and org assignment

### 📅 Schedule & Booking System
- Create, activate, complete, and cancel bookings
- Conflict detection — prevents double-booking a vehicle for overlapping dates
- Assign bookings to specific drivers or self-assign
- Filter bookings by status with live counts

### 🏢 Organization Management
- Add and edit organizations with short code identifiers
- Per-org stats: vehicle count, available vehicles, user count
- Toggle org active/inactive status

### 👥 User Management
- Invite and manage users with role assignment
- Scoped to organization for Org Admins; platform-wide for Super Admin
- Avatar initials derived from user name

### 📊 Reports & Analytics
- Fleet utilization percentage by vehicle category
- Visual status distribution with progress bars
- Live average speed chart across all telemetry vehicles
- Per-org breakdown (Super Admin view)
- Booking trends over the past 6 months

---

## 🚀 Getting Started

### Prerequisites
- Node.js 16+
- A React project with the dependencies listed below

### Installation

```bash
# Clone the repository
git clone https://github.com/hemanthrajelangovan07-sudo/fleetos.git
cd fleetos

# Install dependencies
npm install recharts lucide-react
```

### Running the App

Embed `FleetOS.jsx` as your root component:

```jsx
// src/App.jsx
import FleetOS from './FleetOS';

export default function App() {
  return ;
}
```

```bash
npm run dev
# or
npm start
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🔑 Demo Accounts

| Role | Email | Password |
|---|---|---|
| Super Admin | `super@fleet.com` | `admin123` |
| Org Admin | `admin@mcc.com` | `admin123` |
| Fleet Manager | `manager@mcc.com` | `manager123` |
| Driver | `driver@mcc.com` | `driver123` |

> All demo credentials are available on the login screen via **Use** buttons.

---

## 🔌 Optional Backend API

FleetOS can connect to a live Python backend (e.g. FastAPI with `simulator.py`). When connected, telemetry is streamed from the server; otherwise the app runs in **Demo Mode** using its built-in simulator.

Expected endpoints:

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/alerts/{vehicle_id}` | AI anomaly analysis for a vehicle |
| `GET` | `/export/{vehicle_id}/csv?range={range}` | Download telemetry CSV |

Set the base URL in the Live Telemetry page's server input (default: `http://localhost:8000`).

---

## 🧰 Tech Stack

| Library | Purpose |
|---|---|
| **React** (hooks) | UI state management |
| **Recharts** | AreaChart, BarChart, PieChart visualizations |
| **Lucide React** | Icons throughout the interface |

No external CSS frameworks — all styling is inline with a custom dark theme token system (`T`).

---

## 📁 Project Structure

```
FleetOS.jsx          # Entire application — single self-contained file
│
├── Theme (T)        # Color tokens and status color helpers
├── Mock Data        # Seed data for orgs, vehicles, schedules, users
├── Telemetry Sim    # initSimState / tickSimState / buildAlerts / computeStats
├── Shared UI        # Badge, Modal, Field, Btn, StatCard, GaugeMini
├── LoginScreen      # Auth with role-based demo account quick-fill
├── Sidebar          # Role-filtered navigation
├── Dashboard        # Overview stats, live feed strip, charts
├── TelemetryPage    # Vehicle cards, gauges, charts, stats, alert analysis
├── VehiclesPage     # CRUD table with search and filters
├── SchedulesPage    # Booking management with conflict detection
├── OrgsPage         # Organization CRUD cards
├── UsersPage        # User management table
└── ReportsPage      # Analytics charts and utilization metrics
```

---

## 🎨 Design System

The UI uses a centralized theme object (`T`) with named color tokens:

- **Background layers**: `bg`, `sidebar`, `card`, `cardHover`
- **Accent colors**: amber (`accent`), blue, green, red, amber, purple, cyan
- **Text hierarchy**: `text`, `muted`, `dim`
- **Semantic helpers**: `vc()` / `vb()` for vehicle status, `sc()` / `sb()` for schedule status, `rl()` / `rb()` for risk levels

---
