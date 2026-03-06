import { useState, useMemo, useEffect, useReducer, useCallback } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area, Legend
} from "recharts";
import {
  Truck, Calendar, Building2, Users, LayoutDashboard, LogOut, Plus, Edit2,
  Trash2, Search, X, BarChart2, Eye, EyeOff, CheckCircle, AlertCircle,
  Activity, TrendingUp, Download, RefreshCw, Radio, AlertTriangle, Shield, Server
} from "lucide-react";

const T = {
  bg:       '#06101f',
  sidebar:  '#080e1c',
  card:     '#0c1524',
  cardHover:'#111e30',
  border:   'rgba(148,163,184,0.1)',
  borderHi: 'rgba(148,163,184,0.2)',
  accent:   '#f59e0b', accentBg: 'rgba(245,158,11,0.1)',
  blue:     '#60a5fa', blueBg:   'rgba(96,165,250,0.1)',
  green:    '#34d399', greenBg:  'rgba(52,211,153,0.1)',
  red:      '#fb7185', redBg:    'rgba(251,113,133,0.1)',
  amber:    '#fbbf24', amberBg:  'rgba(251,191,36,0.1)',
  purple:   '#a78bfa', purpleBg: 'rgba(167,139,250,0.1)',
  cyan:     '#22d3ee', cyanBg:   'rgba(34,211,238,0.1)',
  text:     '#e2e8f0',
  muted:    '#94a3b8',
  dim:      '#475569',
};

const VEHICLE_STATUS_COLOR = { Available: T.green, 'In Use': T.blue, Maintenance: T.red, Reserved: T.amber };
const VEHICLE_STATUS_BG    = { Available: T.greenBg, 'In Use': T.blueBg, Maintenance: T.redBg, Reserved: T.amberBg };
const SCHEDULE_STATUS_COLOR = { active: T.blue, reserved: T.amber, completed: T.green, cancelled: T.red };
const SCHEDULE_STATUS_BG    = { active: T.blueBg, reserved: T.amberBg, completed: T.greenBg, cancelled: T.redBg };
const RISK_COLOR = { LOW: T.green, MEDIUM: T.amber, HIGH: T.red, UNKNOWN: T.muted };
const RISK_BG    = { LOW: T.greenBg, MEDIUM: T.amberBg, HIGH: T.redBg, UNKNOWN: 'rgba(148,163,184,0.08)' };

const vc  = s => VEHICLE_STATUS_COLOR[s]  || T.muted;
const vb  = s => VEHICLE_STATUS_BG[s]     || 'transparent';
const sc  = s => SCHEDULE_STATUS_COLOR[s] || T.muted;
const sb  = s => SCHEDULE_STATUS_BG[s]    || 'transparent';
const rl  = l => RISK_COLOR[l] || T.muted;
const rb  = l => RISK_BG[l]    || 'transparent';

const ROLES_MAP   = { super_admin: 'Super Admin', org_admin: 'Org Admin', fleet_manager: 'Fleet Manager', driver: 'Driver' };
const ROLE_COLORS = { super_admin: T.accent, org_admin: T.blue, fleet_manager: T.green, driver: T.amber };

const nowD = new Date();
const fd   = d => new Date(d).toISOString().split('T')[0];
const ad   = n => { const d = new Date(nowD); d.setDate(d.getDate() + n); return fd(d); };

const hashPassword = pwd => btoa(pwd + ':fleet_salt');

const USERS0 = [
  { id: 1, name: 'Alex Morrison',  email: 'super@fleet.com',   passHash: hashPassword('admin123'),    role: 'super_admin',   orgId: null, initials: 'AM' },
  { id: 2, name: 'Sarah Chen',     email: 'admin@mcc.com',     passHash: hashPassword('admin123'),    role: 'org_admin',     orgId: 1,    initials: 'SC' },
  { id: 3, name: 'Mike Torres',    email: 'manager@mcc.com',   passHash: hashPassword('manager123'),  role: 'fleet_manager', orgId: 1,    initials: 'MT' },
  { id: 4, name: 'James Wilson',   email: 'driver@mcc.com',    passHash: hashPassword('driver123'),   role: 'driver',        orgId: 1,    initials: 'JW' },
  { id: 5, name: 'Priya Sharma',   email: 'admin@ntc.com',     passHash: hashPassword('admin123'),    role: 'org_admin',     orgId: 2,    initials: 'PS' },
  { id: 6, name: 'David Kim',      email: 'manager@sda.com',   passHash: hashPassword('manager123'),  role: 'fleet_manager', orgId: 3,    initials: 'DK' },
];

const ORGS0 = [
  { id: 1, name: 'Metro City Council',      code: 'MCC', status: 'active', createdAt: '2024-01-15' },
  { id: 2, name: 'Northern Transport Co.',  code: 'NTC', status: 'active', createdAt: '2024-02-20' },
  { id: 3, name: 'South District Authority',code: 'SDA', status: 'active', createdAt: '2024-03-10' },
];

const VEHICLES0 = [
  { id:  1, plate: 'MCC-001', name: 'Toyota Camry',        cat: 'Sedan', orgId: 1, status: 'Available',   year: 2022, km: 15420 },
  { id:  2, plate: 'MCC-002', name: 'Ford Ranger',         cat: 'Truck', orgId: 1, status: 'In Use',      year: 2021, km: 28100 },
  { id:  3, plate: 'MCC-003', name: 'Toyota HiAce',        cat: 'Van',   orgId: 1, status: 'Available',   year: 2023, km: 8500  },
  { id:  4, plate: 'MCC-004', name: 'Mitsubishi Pajero',   cat: 'SUV',   orgId: 1, status: 'Maintenance', year: 2020, km: 45000 },
  { id:  5, plate: 'MCC-005', name: 'Honda Civic',         cat: 'Sedan', orgId: 1, status: 'Available',   year: 2023, km: 5200  },
  { id:  6, plate: 'MCC-006', name: 'Isuzu Crosswind',     cat: 'SUV',   orgId: 1, status: 'Reserved',    year: 2022, km: 22300 },
  { id:  7, plate: 'NTC-001', name: 'Volvo FH16',          cat: 'Truck', orgId: 2, status: 'In Use',      year: 2021, km: 62000 },
  { id:  8, plate: 'NTC-002', name: 'Mercedes Sprinter',   cat: 'Van',   orgId: 2, status: 'Available',   year: 2022, km: 18700 },
  { id:  9, plate: 'NTC-003', name: 'BMW X5',              cat: 'SUV',   orgId: 2, status: 'Available',   year: 2023, km: 9100  },
  { id: 10, plate: 'SDA-001', name: 'Toyota Land Cruiser', cat: 'SUV',   orgId: 3, status: 'Available',   year: 2021, km: 35000 },
  { id: 11, plate: 'SDA-002', name: 'Nissan Urvan',        cat: 'Bus',   orgId: 3, status: 'In Use',      year: 2020, km: 55000 },
  { id: 12, plate: 'SDA-003', name: 'Ford Transit',        cat: 'Van',   orgId: 3, status: 'Maintenance', year: 2019, km: 78000 },
];

const SCHEDULES0 = [
  { id: 1, vehicleId: 2,  userId: 3, orgId: 1, purpose: 'Field inspection - North District', start: ad(-1),    end: fd(nowD), status: 'active'    },
  { id: 2, vehicleId: 6,  userId: 4, orgId: 1, purpose: 'Site visit - Construction area',   start: fd(nowD),  end: ad(1),    status: 'reserved'  },
  { id: 3, vehicleId: 1,  userId: 3, orgId: 1, purpose: 'Office supplies delivery',          start: ad(1),     end: ad(1),    status: 'reserved'  },
  { id: 4, vehicleId: 7,  userId: 5, orgId: 2, purpose: 'Cargo transport - Port',            start: ad(-3),    end: ad(-1),   status: 'completed' },
  { id: 5, vehicleId: 11, userId: 6, orgId: 3, purpose: 'Staff transport - Route 5',         start: fd(nowD),  end: ad(2),    status: 'active'    },
  { id: 6, vehicleId: 3,  userId: 3, orgId: 1, purpose: 'Equipment transport',               start: ad(3),     end: ad(4),    status: 'reserved'  },
];

const SIM_VEHICLES = [
  { id: 'VH-001', type: 'EV',     name: 'Tesla Model 3',     color: T.blue   },
  { id: 'VH-002', type: 'Petrol', name: 'Toyota Camry',      color: T.green  },
  { id: 'VH-003', type: 'Diesel', name: 'Ford Transit Van',  color: T.amber  },
  { id: 'VH-004', type: 'EV',     name: 'Tata Nexon EV',     color: T.purple },
  { id: 'VH-005', type: 'Hybrid', name: 'Honda City Hybrid', color: T.cyan   },
];

const rnd   = (a, b) => Math.random() * (b - a) + a;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

function initSimState() {
  return Object.fromEntries(
    SIM_VEHICLES.map(v => [
      v.id,
      {
        speed:             rnd(30, 80),
        temp:              rnd(70, 85),
        battery:           v.type === 'EV'  ? rnd(50, 90) : null,
        fuel:              v.type !== 'EV'  ? rnd(20, 60) : null,
        rpm:               rnd(1500, 3000),
        lat:               12.9716 + rnd(-0.05, 0.05),
        lon:               80.2709 + rnd(-0.05, 0.05),
        anomalyCountdown:  Math.round(rnd(20, 60)),
        activeAnomaly:     null,
        tick:              0,
      },
    ])
  );
}

function tickSimState(prev) {
  return Object.fromEntries(
    SIM_VEHICLES.map(v => {
      const s = { ...prev[v.id] };
      s.tick++;
      s.speed = clamp(s.speed + rnd(-5, 5), 0, 160);
      s.temp  = clamp(s.temp  + rnd(-1, 1.5), 60, 105);
      s.rpm   = clamp(s.speed * 38 + rnd(-200, 200), 800, 7000);
      s.lat  += rnd(-0.0005, 0.0005);
      s.lon  += rnd(-0.0005, 0.0005);

      if (v.type === 'EV') {
        s.battery = clamp(s.battery - s.speed * 0.0003 + rnd(-0.1, 0.2), 5, 100);
      } else {
        s.fuel = clamp(s.fuel - rnd(0.01, 0.05), 0, 60);
      }

      s.anomalyCountdown--;
      s.activeAnomaly = null;

      if (s.anomalyCountdown <= 0) {
        const pool = v.type === 'EV'
          ? ['overheat', 'overspeed', 'low_battery']
          : ['overheat', 'overspeed'];
        const anomaly = pool[Math.floor(Math.random() * pool.length)];
        if (anomaly === 'overheat')    { s.temp    = rnd(102, 110); s.activeAnomaly = 'overheat';    }
        if (anomaly === 'overspeed')   { s.speed   = rnd(135, 155); s.activeAnomaly = 'overspeed';   }
        if (anomaly === 'low_battery') { s.battery = rnd(5, 12);    s.activeAnomaly = 'low_battery'; }
        s.anomalyCountdown = Math.round(rnd(30, 80));
      }

      return [v.id, s];
    })
  );
}

function toReading(vehicleId, s, ts) {
  return {
    vehicle_id:  vehicleId,
    timestamp:   ts || new Date().toISOString(),
    speed:       +s.speed.toFixed(1),
    temperature: +s.temp.toFixed(1),
    battery_pct: s.battery != null ? +s.battery.toFixed(1) : null,
    fuel_level:  s.fuel    != null ? +s.fuel.toFixed(2)    : null,
    engine_rpm:  +s.rpm.toFixed(0),
    latitude:    +s.lat.toFixed(6),
    longitude:   +s.lon.toFixed(6),
    activeAnomaly: s.activeAnomaly,
  };
}

function buildAlerts(readings, vehicleId) {
  const r = readings[0];
  if (!r) return { risk_level: 'LOW', alerts: [], summary: 'No data.' };

  const alerts = [];

  if (r.speed > 130)
    alerts.push({ metric: 'speed',       issue: `Overspeed: ${r.speed} km/h`,         recommendation: 'Reduce speed immediately.' });
  if (r.temperature > 100)
    alerts.push({ metric: 'temperature', issue: `Overheating: ${r.temperature}°C`,     recommendation: 'Pull over. Check coolant.' });
  if (r.battery_pct != null && r.battery_pct < 15)
    alerts.push({ metric: 'battery_pct', issue: `Critical battery: ${r.battery_pct}%`, recommendation: 'Charge immediately.' });
  if (r.engine_rpm > 6000)
    alerts.push({ metric: 'engine_rpm',  issue: `Over-revving: ${r.engine_rpm} RPM`,   recommendation: 'Reduce throttle and upshift.' });
  if (readings.length > 3 && (readings[0].temperature - readings[3].temperature) > 8)
    alerts.push({ metric: 'temperature', issue: 'Rapid temperature spike',             recommendation: 'Monitor cooling system.' });

  const isHighRisk = r.temperature > 104 || r.speed > 140;
  const risk = alerts.length === 0 ? 'LOW' : isHighRisk ? 'HIGH' : 'MEDIUM';

  return {
    risk_level: risk,
    alerts,
    summary: alerts.length === 0
      ? 'All metrics within safe operating ranges.'
      : `${alerts.length} issue(s) detected for ${vehicleId}.`,
  };
}

function computeStats(history) {
  if (!history.length) return null;

  const defined = arr => arr.filter(v => v != null);
  const spd = defined(history.map(r => r.speed));
  const tmp = defined(history.map(r => r.temperature));
  const bat = defined(history.map(r => r.battery_pct));
  const rpm = defined(history.map(r => r.engine_rpm));
  const avg = a => a.length ? +(a.reduce((s, v) => s + v, 0) / a.length).toFixed(1) : 0;

  return {
    total_readings: history.length,
    speed_kmh:      { avg: avg(spd), max: spd.length ? +Math.max(...spd).toFixed(1) : 0, min: spd.length ? +Math.min(...spd).toFixed(1) : 0 },
    temperature_c:  { avg: avg(tmp), max: tmp.length ? +Math.max(...tmp).toFixed(1) : 0, min: tmp.length ? +Math.min(...tmp).toFixed(1) : 0 },
    battery_pct:    bat.length ? { avg: avg(bat), min: +Math.min(...bat).toFixed(1) } : null,
    engine_rpm:     { avg: avg(rpm), max: rpm.length ? +Math.max(...rpm).toFixed(0) : 0 },
    last_seen:      history[0]?.timestamp,
  };
}

function telemetryReducer(state, action) {
  const ts = action.timestamp;
  const nextSim = tickSimState(state.sim);
  const nextHistory = { ...state.history };
  SIM_VEHICLES.forEach(v => {
    const reading = toReading(v.id, nextSim[v.id], ts);
    nextHistory[v.id] = [reading, ...(state.history[v.id] || [])].slice(0, 200);
  });
  return { sim: nextSim, history: nextHistory };
}

function initTelemetry() {
  return {
    sim:     initSimState(),
    history: Object.fromEntries(SIM_VEHICLES.map(v => [v.id, []])),
  };
}

const abortableFetch = (url, timeoutMs = 2000) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  return fetch(url, { signal: controller.signal }).finally(() => clearTimeout(timer));
};

const Badge = ({ label, color, bg }) => (
  <span style={{
    display: 'inline-flex', alignItems: 'center', padding: '3px 10px',
    borderRadius: 20, fontSize: 12, fontWeight: 500, color, background: bg,
    border: `1px solid ${color}33`, whiteSpace: 'nowrap',
  }}>
    {label}
  </span>
);

const Modal = ({ title, onClose, children, wide }) => (
  <div style={{
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 1000, backdropFilter: 'blur(4px)', padding: 16,
  }}>
    <div style={{
      background: T.card, border: `1px solid ${T.borderHi}`, borderRadius: 16,
      padding: 32, width: '100%', maxWidth: wide ? 800 : 520,
      maxHeight: '92vh', overflowY: 'auto', boxShadow: '0 30px 60px rgba(0,0,0,0.6)',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ color: T.text, fontSize: 18, fontWeight: 700, margin: 0 }}>{title}</h2>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: T.muted, cursor: 'pointer', padding: 4, display: 'flex' }}>
          <X size={20} />
        </button>
      </div>
      {children}
    </div>
  </div>
);

const Field = ({ label, value, onChange, type = 'text', options, placeholder }) => (
  <div style={{ marginBottom: 16 }}>
    <label style={{ display: 'block', color: T.muted, fontSize: 13, marginBottom: 6, fontWeight: 500 }}>{label}</label>
    {options ? (
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{ width: '100%', padding: '10px 12px', background: '#0a1525', border: `1px solid ${T.border}`, borderRadius: 8, color: T.text, fontSize: 14, outline: 'none', cursor: 'pointer', boxSizing: 'border-box' }}
      >
        {options.map(o => <option key={o.value ?? o} value={o.value ?? o}>{o.label ?? o}</option>)}
      </select>
    ) : (
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder || ''}
        style={{ width: '100%', padding: '10px 12px', background: '#0a1525', border: `1px solid ${T.border}`, borderRadius: 8, color: T.text, fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
      />
    )}
  </div>
);

const BUTTON_STYLES = {
  primary:   { color: '#000', border: 'none' },
  secondary: { background: 'transparent', color: T.text, border: `1px solid ${T.border}` },
  danger:    { background: T.redBg,  color: T.red,  border: `1px solid ${T.red}33`  },
  ghost:     { background: 'transparent', color: T.muted, border: 'none' },
  cyan:      { background: T.cyanBg, color: T.cyan, border: `1px solid ${T.cyan}33` },
};

const Btn = ({ onClick, children, variant = 'primary', small, disabled }) => {
  const base = { ...BUTTON_STYLES[variant] };
  if (variant === 'primary') {
    base.background = disabled ? T.dim : `linear-gradient(135deg,${T.accent},#d97706)`;
  }
  return (
    <button
      onClick={disabled ? undefined : onClick}
      style={{
        ...base,
        padding: small ? '6px 14px' : '10px 20px',
        borderRadius: 8,
        fontSize: small ? 12 : 14,
        fontWeight: 600,
        cursor: disabled ? 'not-allowed' : 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        opacity: disabled ? 0.5 : 1,
        transition: 'opacity 0.15s',
        whiteSpace: 'nowrap',
      }}
    >
      {children}
    </button>
  );
};

const StatCard = ({ icon: Icon, label, value, color, sub, pulse }) => (
  <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 12, padding: 24, flex: 1, minWidth: 160 }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
      <div>
        <p style={{ color: T.muted, fontSize: 12, margin: '0 0 8px', fontWeight: 500, letterSpacing: '0.04em', textTransform: 'uppercase' }}>{label}</p>
        <p style={{ color: T.text, fontSize: 26, fontWeight: 800, margin: 0, letterSpacing: '-0.5px' }}>{value}</p>
        {sub && <p style={{ color: T.dim, fontSize: 12, margin: '4px 0 0' }}>{sub}</p>}
      </div>
      <div style={{ background: `${color}18`, borderRadius: 10, padding: 10, flexShrink: 0, position: 'relative' }}>
        <Icon size={20} color={color} />
        {pulse && <span style={{ position: 'absolute', top: 6, right: 6, width: 7, height: 7, borderRadius: '50%', background: color, animation: 'pulse 2s infinite' }} />}
      </div>
    </div>
  </div>
);

const GaugeMini = ({ value, max, color, label, unit, warn, danger }) => {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  const c = value >= danger ? T.red : value >= warn ? T.amber : color;
  return (
    <div style={{ background: T.bg, borderRadius: 10, padding: '12px 14px', flex: 1, minWidth: 110 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, alignItems: 'baseline' }}>
        <span style={{ color: T.muted, fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</span>
        <span style={{ color: c, fontSize: 15, fontWeight: 800 }}>
          {value != null ? value : '—'}
          <span style={{ fontSize: 10, color: T.dim, fontWeight: 400 }}>{unit}</span>
        </span>
      </div>
      <div style={{ height: 5, background: T.border, borderRadius: 3, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: c, borderRadius: 3, transition: 'width 0.5s ease' }} />
      </div>
    </div>
  );
};

const LoginScreen = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [pass,  setPass]  = useState('');
  const [show,  setShow]  = useState(false);
  const [err,   setErr]   = useState('');

  const handle = () => {
    const u = USERS0.find(u => u.email === email && u.passHash === hashPassword(pass));
    if (u) onLogin(u);
    else setErr('Invalid credentials');
  };

  const demos = [
    ['Super Admin',   'super@fleet.com',   'admin123'   ],
    ['Org Admin',     'admin@mcc.com',     'admin123'   ],
    ['Fleet Manager', 'manager@mcc.com',   'manager123' ],
    ['Driver',        'driver@mcc.com',    'driver123'  ],
  ];

  return (
    <div style={{
      minHeight: '100vh', background: T.bg, display: 'flex', alignItems: 'center',
      justifyContent: 'center', fontFamily: '"Outfit",system-ui,sans-serif', padding: 16,
      backgroundImage: `radial-gradient(ellipse at 20% 50%,rgba(245,158,11,0.06) 0%,transparent 55%),radial-gradient(ellipse at 80% 20%,rgba(96,165,250,0.06) 0%,transparent 50%)`,
    }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
            <div style={{ width: 46, height: 46, background: `linear-gradient(135deg,${T.accent},#d97706)`, borderRadius: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 8px 24px ${T.accent}44` }}>
              <Truck size={24} color="#000" />
            </div>
            <span style={{ fontSize: 26, fontWeight: 800, color: T.text, letterSpacing: '-1px' }}>FleetOS</span>
          </div>
          <p style={{ color: T.muted, fontSize: 14, margin: 0 }}>Fleet Governance & Scheduling System</p>
        </div>

        <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 16, padding: 32, boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }}>
          <h2 style={{ color: T.text, fontSize: 20, fontWeight: 700, margin: '0 0 22px' }}>Sign in</h2>
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', color: T.muted, fontSize: 13, marginBottom: 6, fontWeight: 500 }}>Email</label>
            <input
              type="email"
              value={email}
              onChange={e => { setEmail(e.target.value); setErr(''); }}
              placeholder="you@example.com"
              onKeyDown={e => e.key === 'Enter' && handle()}
              style={{ width: '100%', padding: '11px 14px', background: '#0a1525', border: `1px solid ${err ? T.red : T.border}`, borderRadius: 8, color: T.text, fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
            />
          </div>
          <div style={{ marginBottom: err ? 8 : 20, position: 'relative' }}>
            <label style={{ display: 'block', color: T.muted, fontSize: 13, marginBottom: 6, fontWeight: 500 }}>Password</label>
            <input
              type={show ? 'text' : 'password'}
              value={pass}
              onChange={e => { setPass(e.target.value); setErr(''); }}
              placeholder="••••••••"
              onKeyDown={e => e.key === 'Enter' && handle()}
              style={{ width: '100%', padding: '11px 40px 11px 14px', background: '#0a1525', border: `1px solid ${err ? T.red : T.border}`, borderRadius: 8, color: T.text, fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
            />
            <button onClick={() => setShow(s => !s)} style={{ position: 'absolute', right: 12, top: 34, background: 'none', border: 'none', color: T.muted, cursor: 'pointer', display: 'flex', padding: 0 }}>
              {show ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {err && <p style={{ color: T.red, fontSize: 13, margin: '0 0 16px' }}>{err}</p>}
          <button
            onClick={handle}
            style={{ width: '100%', padding: '12px', background: `linear-gradient(135deg,${T.accent},#d97706)`, border: 'none', borderRadius: 8, color: '#000', fontSize: 15, fontWeight: 700, cursor: 'pointer', boxShadow: `0 4px 16px ${T.accent}44` }}
          >
            Sign In
          </button>
        </div>

        <div style={{ marginTop: 16, background: 'rgba(96,165,250,0.05)', border: `1px solid ${T.blue}22`, borderRadius: 12, padding: 16 }}>
          <p style={{ color: T.blue, fontSize: 11, fontWeight: 700, margin: '0 0 10px', letterSpacing: '0.08em' }}>DEMO ACCOUNTS</p>
          {demos.map(([role, e, p]) => (
            <div key={role} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: `1px solid ${T.border}` }}>
              <div>
                <span style={{ color: T.text, fontSize: 13, fontWeight: 500 }}>{role}</span>
                <span style={{ color: T.dim, fontSize: 12, marginLeft: 8 }}>{e}</span>
              </div>
              <button onClick={() => { setEmail(e); setPass(p); setErr(''); }} style={{ background: 'none', border: `1px solid ${T.border}`, color: T.muted, fontSize: 11, padding: '3px 10px', borderRadius: 4, cursor: 'pointer' }}>
                Use
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const NAV = [
  { id: 'dashboard',     icon: LayoutDashboard, label: 'Dashboard',     roles: ['super_admin', 'org_admin', 'fleet_manager', 'driver'] },
  { id: 'telemetry',     icon: Radio,           label: 'Live Telemetry',roles: ['super_admin', 'org_admin', 'fleet_manager', 'driver'], live: true },
  { id: 'vehicles',      icon: Truck,           label: 'Vehicles',      roles: ['super_admin', 'org_admin', 'fleet_manager', 'driver'] },
  { id: 'schedules',     icon: Calendar,        label: 'Schedules',     roles: ['super_admin', 'org_admin', 'fleet_manager', 'driver'] },
  { id: 'organizations', icon: Building2,       label: 'Organizations', roles: ['super_admin'] },
  { id: 'users',         icon: Users,           label: 'Users',         roles: ['super_admin', 'org_admin'] },
  { id: 'reports',       icon: BarChart2,       label: 'Reports',       roles: ['super_admin', 'org_admin', 'fleet_manager'] },
];

const Sidebar = ({ user, page, setPage, onLogout }) => (
  <div style={{ width: 224, background: T.sidebar, borderRight: `1px solid ${T.border}`, display: 'flex', flexDirection: 'column', flexShrink: 0, height: '100vh', position: 'sticky', top: 0 }}>
    <div style={{ padding: '22px 20px 18px', borderBottom: `1px solid ${T.border}` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 34, height: 34, background: `linear-gradient(135deg,${T.accent},#d97706)`, borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Truck size={18} color="#000" />
        </div>
        <span style={{ fontSize: 20, fontWeight: 800, color: T.text, letterSpacing: '-0.5px' }}>FleetOS</span>
      </div>
    </div>
    <nav style={{ flex: 1, padding: '10px', overflowY: 'auto' }}>
      {NAV.filter(n => n.roles.includes(user.role)).map(({ id, icon: Icon, label, live }) => {
        const active = page === id;
        return (
          <button
            key={id}
            onClick={() => setPage(id)}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'space-between',
              padding: '10px 12px', borderRadius: 8, border: 'none', cursor: 'pointer', marginBottom: 2,
              textAlign: 'left', background: active ? T.accentBg : 'transparent',
              color: active ? T.accent : T.muted, transition: 'all 0.12s',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Icon size={17} />
              <span style={{ fontSize: 14, fontWeight: active ? 600 : 400 }}>{label}</span>
            </div>
            {live && (
              <span style={{ fontSize: 9, fontWeight: 700, color: T.red, background: T.redBg, padding: '2px 6px', borderRadius: 4, letterSpacing: '0.05em', animation: 'pulse 2s infinite' }}>
                LIVE
              </span>
            )}
          </button>
        );
      })}
    </nav>
    <div style={{ padding: 12, borderTop: `1px solid ${T.border}` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 8, background: T.card, marginBottom: 8 }}>
        <div style={{ width: 32, height: 32, borderRadius: '50%', background: `linear-gradient(135deg,${ROLE_COLORS[user.role]},${T.accent})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
          {user.initials}
        </div>
        <div style={{ overflow: 'hidden', flex: 1 }}>
          <p style={{ color: T.text, fontSize: 13, fontWeight: 600, margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.name}</p>
          <p style={{ color: T.dim, fontSize: 11, margin: 0 }}>{ROLES_MAP[user.role]}</p>
        </div>
      </div>
      <button onClick={onLogout} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '9px 12px', background: 'none', border: `1px solid ${T.border}`, borderRadius: 8, color: T.muted, cursor: 'pointer', fontSize: 13 }}>
        <LogOut size={15} /> Sign out
      </button>
    </div>
  </div>
);

const Dashboard = ({ user, vehicles, schedules, orgs, simState }) => {
  const mv = user.role === 'super_admin' ? vehicles : vehicles.filter(v => v.orgId === user.orgId);
  const ms = user.role === 'super_admin'
    ? schedules
    : user.role === 'driver'
      ? schedules.filter(s => s.userId === user.id)
      : schedules.filter(s => s.orgId === user.orgId);

  const statusData = [
    { name: 'Available',   value: mv.filter(v => v.status === 'Available').length,   color: T.green },
    { name: 'In Use',      value: mv.filter(v => v.status === 'In Use').length,      color: T.blue  },
    { name: 'Maintenance', value: mv.filter(v => v.status === 'Maintenance').length, color: T.red   },
    { name: 'Reserved',    value: mv.filter(v => v.status === 'Reserved').length,    color: T.amber },
  ].filter(d => d.value > 0);

  const catData    = ['Sedan', 'SUV', 'Van', 'Truck', 'Bus'].map(c => ({ name: c, count: mv.filter(v => v.cat === c).length })).filter(d => d.count > 0);
  const monthData  = [{ m: 'Oct', b: 8 }, { m: 'Nov', b: 12 }, { m: 'Dec', b: 10 }, { m: 'Jan', b: 15 }, { m: 'Feb', b: 18 }, { m: 'Mar', b: ms.length }];
  const activeCount = ms.filter(s => s.status === 'active' || s.status === 'reserved').length;
  const liveAlerts  = Object.values(simState).filter(s => s.activeAnomaly).length;

  return (
    <div style={{ padding: 32 }}>
      <div style={{ marginBottom: 26 }}>
        <h1 style={{ color: T.text, fontSize: 24, fontWeight: 800, margin: '0 0 4px', letterSpacing: '-0.5px' }}>Dashboard</h1>
        <p style={{ color: T.muted, fontSize: 14, margin: 0 }}>
          Welcome back, {user.name.split(' ')[0]} · {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
      </div>

      <div style={{ display: 'flex', gap: 14, marginBottom: 22, flexWrap: 'wrap' }}>
        <StatCard icon={Truck}         label="Total Vehicles"   value={mv.length}                          color={T.blue}   sub={`${mv.filter(v => v.status === 'Available').length} available`} />
        <StatCard icon={Calendar}      label="Active Bookings"  value={activeCount}                        color={T.accent} />
        <StatCard icon={Radio}         label="Live Vehicles"    value={`${SIM_VEHICLES.length} online`}    color={T.green}  pulse sub="Telemetry streaming" />
        {liveAlerts > 0 && <StatCard icon={AlertTriangle} label="Live Alerts" value={liveAlerts} color={T.red} pulse sub="Needs attention" />}
        {user.role === 'super_admin' && <StatCard icon={Building2} label="Organizations" value={orgs.length} color={T.purple} />}
      </div>

      <div style={{ background: T.card, border: `1px solid ${T.green}33`, borderRadius: 12, padding: 18, marginBottom: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: T.green, display: 'inline-block', boxShadow: `0 0 8px ${T.green}`, animation: 'pulse 2s infinite' }} />
            <span style={{ color: T.text, fontSize: 13, fontWeight: 700 }}>Live Vehicle Feed</span>
          </div>
          <span style={{ color: T.muted, fontSize: 11 }}>Refreshes every 2s</span>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {SIM_VEHICLES.map(v => {
            const s = simState[v.id];
            const hasAlert = s.activeAnomaly;
            return (
              <div key={v.id} style={{ flex: 1, minWidth: 130, background: hasAlert ? T.redBg : T.bg, border: `1px solid ${hasAlert ? T.red : T.border}`, borderRadius: 8, padding: '10px 12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <span style={{ color: v.color, fontSize: 11, fontWeight: 700, fontFamily: 'monospace' }}>{v.id}</span>
                  {hasAlert && <AlertTriangle size={11} color={T.red} />}
                </div>
                <p style={{ color: T.text, fontSize: 12, fontWeight: 600, margin: '0 0 4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{v.name}</p>
                <div style={{ display: 'flex', gap: 8 }}>
                  <span style={{ color: T.muted, fontSize: 11 }}>{s.speed.toFixed(0)} km/h</span>
                  <span style={{ color: s.temp > 100 ? T.red : T.muted, fontSize: 11 }}>{s.temp.toFixed(0)}°C</span>
                  {s.battery != null && <span style={{ color: s.battery < 15 ? T.red : T.muted, fontSize: 11 }}>{s.battery.toFixed(0)}%</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 14, marginBottom: 14 }}>
        <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 12, padding: 24 }}>
          <h3 style={{ color: T.text, fontSize: 14, fontWeight: 700, margin: '0 0 18px' }}>Booking Trends</h3>
          <ResponsiveContainer width="100%" height={175}>
            <AreaChart data={monthData}>
              <defs>
                <linearGradient id="ag" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={T.accent} stopOpacity={0.35} />
                  <stop offset="95%" stopColor={T.accent} stopOpacity={0}    />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={T.border} />
              <XAxis dataKey="m" tick={{ fill: T.muted, fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: T.muted, fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 8, color: T.text, fontSize: 13 }} />
              <Area type="monotone" dataKey="b" stroke={T.accent} fill="url(#ag)" strokeWidth={2.5} name="Bookings" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 12, padding: 24 }}>
          <h3 style={{ color: T.text, fontSize: 14, fontWeight: 700, margin: '0 0 16px' }}>Vehicle Status</h3>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <PieChart width={140} height={140}>
              <Pie data={statusData} cx={65} cy={65} innerRadius={42} outerRadius={62} dataKey="value" paddingAngle={3}>
                {statusData.map((e, i) => <Cell key={`cell-${i}`} fill={e.color} />)}
              </Pie>
            </PieChart>
            <div style={{ width: '100%', marginTop: 8 }}>
              {statusData.map(d => (
                <div key={d.name} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: d.color }} />
                    <span style={{ color: T.muted, fontSize: 12 }}>{d.name}</span>
                  </div>
                  <span style={{ color: T.text, fontSize: 13, fontWeight: 700 }}>{d.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr', gap: 14 }}>
        <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 12, padding: 24 }}>
          <h3 style={{ color: T.text, fontSize: 14, fontWeight: 700, margin: '0 0 16px' }}>By Category</h3>
          <ResponsiveContainer width="100%" height={150}>
            <BarChart data={catData} barSize={22}>
              <CartesianGrid strokeDasharray="3 3" stroke={T.border} vertical={false} />
              <XAxis dataKey="name" tick={{ fill: T.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: T.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 8, color: T.text, fontSize: 13 }} />
              <Bar dataKey="count" fill={T.blue} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 12, padding: 24 }}>
          <h3 style={{ color: T.text, fontSize: 14, fontWeight: 700, margin: '0 0 14px' }}>Recent Activity</h3>
          {ms.slice(0, 4).map(s => {
            const v = vehicles.find(vv => vv.id === s.vehicleId);
            return (
              <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: T.bg, borderRadius: 8, border: `1px solid ${T.border}`, gap: 10, marginBottom: 8 }}>
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <p style={{ color: T.text, fontSize: 13, fontWeight: 500, margin: '0 0 2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.purpose}</p>
                  <p style={{ color: T.muted, fontSize: 12, margin: 0 }}>{v?.plate} · {s.start}</p>
                </div>
                <Badge label={s.status} color={sc(s.status)} bg={sb(s.status)} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const TelemetryPage = ({ simState, history, apiUrl, setApiUrl, connected }) => {
  const [selVid,       setSelVid]       = useState(null);
  const [tab,          setTab]          = useState('charts');
  const [alertData,    setAlertData]    = useState({});
  const [loadingAlert, setLoadingAlert] = useState({});
  const [range,        setRange]        = useState('1h');

  const selVehicle  = SIM_VEHICLES.find(v => v.id === selVid);
  const selHistory  = selVid ? history[selVid] || [] : [];
  const stats       = selVid ? computeStats(selHistory) : null;
  const alertResult = selVid ? alertData[selVid] : null;

  const runAlerts = useCallback(async vid => {
    setLoadingAlert(p => ({ ...p, [vid]: true }));
    try {
      if (connected) {
        const res = await abortableFetch(`${apiUrl}/alerts/${vid}`);
        const d = await res.json();
        setAlertData(p => ({ ...p, [vid]: d }));
      } else {
        await new Promise(r => setTimeout(r, 400));
        setAlertData(p => ({ ...p, [vid]: buildAlerts(history[vid] || [], vid) }));
      }
    } catch {
      setAlertData(p => ({ ...p, [vid]: buildAlerts(history[vid] || [], vid) }));
    } finally {
      setLoadingAlert(p => ({ ...p, [vid]: false }));
    }
  }, [connected, apiUrl, history]);

  const exportCSV = vid => {
    const rows  = history[vid] || [];
    const lines = [['Timestamp', 'Speed (km/h)', 'Temp (°C)', 'Battery (%)', 'Fuel (L)', 'RPM', 'Lat', 'Lon'].join(',')];
    rows.forEach(r => lines.push([r.timestamp, r.speed, r.temperature, r.battery_pct ?? '', r.fuel_level ?? '', r.engine_rpm, r.latitude, r.longitude].join(',')));
    const blob = new Blob([lines.join('\n')], { type: 'text/csv' });
    const a    = document.createElement('a');
    a.href     = URL.createObjectURL(blob);
    a.download = `${vid}_telemetry.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const chartData = selHistory.slice(0, 50).reverse();

  return (
    <div style={{ padding: 32 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 22, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ color: T.text, fontSize: 24, fontWeight: 800, margin: '0 0 4px', letterSpacing: '-0.5px' }}>Live Telemetry</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: T.green, display: 'inline-block', animation: 'pulse 2s infinite', boxShadow: `0 0 8px ${T.green}` }} />
            <span style={{ color: T.muted, fontSize: 13 }}>5 vehicles streaming · 2s interval</span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: T.card, border: `1px solid ${T.border}`, borderRadius: 10, padding: '8px 14px' }}>
          <Server size={14} color={connected ? T.green : T.muted} />
          <input
            value={apiUrl}
            onChange={e => setApiUrl(e.target.value)}
            style={{ background: 'none', border: 'none', color: T.text, fontSize: 12, outline: 'none', width: 170 }}
            placeholder="http://localhost:8000"
          />
          <span style={{ color: connected ? T.green : T.dim, fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap' }}>
            {connected ? '● Connected' : '○ Demo Mode'}
          </span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(255px,1fr))', gap: 14, marginBottom: 20 }}>
        {SIM_VEHICLES.map(v => {
          const s        = simState[v.id];
          const r        = toReading(v.id, s, new Date().toISOString());
          const isEV     = v.type === 'EV';
          const sel      = selVid === v.id;
          const hasAlert = s.activeAnomaly;
          return (
            <div
              key={v.id}
              onClick={() => setSelVid(sel ? null : v.id)}
              style={{
                background: T.card,
                border: `2px solid ${sel ? v.color : hasAlert ? T.red : T.border}`,
                borderRadius: 14, padding: 20, cursor: 'pointer', transition: 'all 0.15s',
                boxShadow: sel ? `0 0 20px ${v.color}22` : hasAlert ? `0 0 12px ${T.red}22` : 'none',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                    <span style={{ color: v.color, fontSize: 13, fontWeight: 800, fontFamily: 'monospace' }}>{v.id}</span>
                    <span style={{ color: T.dim, fontSize: 11, background: `${v.color}14`, padding: '1px 6px', borderRadius: 4 }}>{v.type}</span>
                  </div>
                  <p style={{ color: T.text, fontSize: 14, fontWeight: 700, margin: 0 }}>{v.name}</p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                  {hasAlert && <span style={{ background: T.redBg, color: T.red, fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 4, textTransform: 'uppercase' }}>⚠ {s.activeAnomaly.replace('_', ' ')}</span>}
                  <span style={{ background: T.greenBg, color: T.green, fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 4 }}>● LIVE</span>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <GaugeMini value={r.speed}       max={160} color={T.blue}  label="Speed"   unit=" km/h" warn={110} danger={130} />
                <GaugeMini value={r.temperature} max={120} color={T.amber} label="Temp"    unit="°C"    warn={90}  danger={100} />
                {isEV
                  ? <GaugeMini value={r.battery_pct} max={100} color={T.green} label="Battery" unit="%" warn={25} danger={15} />
                  : <GaugeMini value={r.fuel_level}  max={60}  color={T.cyan}  label="Fuel"    unit="L" warn={15} danger={8}  />
                }
                <GaugeMini value={Math.round(r.engine_rpm)} max={7000} color={T.purple} label="RPM" unit="" warn={5000} danger={6000} />
              </div>
              <div style={{ marginTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: T.dim, fontSize: 11 }}>📍 {r.latitude?.toFixed(4)}, {r.longitude?.toFixed(4)}</span>
              </div>
            </div>
          );
        })}
      </div>

      {selVehicle && (
        <div style={{ background: T.card, border: `1px solid ${selVehicle.color}33`, borderRadius: 14, overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 24px', borderBottom: `1px solid ${T.border}`, background: `${selVehicle.color}06` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: `${selVehicle.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Truck size={20} color={selVehicle.color} />
              </div>
              <div>
                <h3 style={{ color: T.text, fontSize: 16, fontWeight: 700, margin: '0 0 2px' }}>{selVehicle.name}</h3>
                <span style={{ color: selVehicle.color, fontSize: 12, fontFamily: 'monospace', fontWeight: 600 }}>{selVehicle.id}</span>
                <span style={{ color: T.dim, fontSize: 12, marginLeft: 8 }}>· {selVehicle.type}</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <select value={range} onChange={e => setRange(e.target.value)} style={{ padding: '6px 10px', background: T.bg, border: `1px solid ${T.border}`, borderRadius: 7, color: T.text, fontSize: 12, outline: 'none', cursor: 'pointer' }}>
                {['10m', '30m', '1h', '6h', '24h', '7d'].map(r => <option key={r} value={r}>{r}</option>)}
              </select>
              <Btn onClick={() => exportCSV(selVid)} small variant="secondary"><Download size={12} />CSV</Btn>
              <Btn onClick={() => { setTab('alerts'); runAlerts(selVid); }} small variant="cyan">
                <Shield size={12} />{loadingAlert[selVid] ? 'Analyzing…' : 'AI Alerts'}
              </Btn>
              <button onClick={() => setSelVid(null)} style={{ background: 'none', border: 'none', color: T.muted, cursor: 'pointer', display: 'flex', padding: 4 }}>
                <X size={16} />
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', borderBottom: `1px solid ${T.border}` }}>
            {['charts', 'stats', 'alerts'].map(t => (
              <button
                key={t}
                onClick={() => { setTab(t); if (t === 'alerts') runAlerts(selVid); }}
                style={{
                  padding: '12px 22px', background: 'none', border: 'none', cursor: 'pointer',
                  borderBottom: `2px solid ${tab === t ? selVehicle.color : 'transparent'}`,
                  color: tab === t ? T.text : T.muted,
                  fontSize: 14, fontWeight: tab === t ? 600 : 400, textTransform: 'capitalize', transition: 'all 0.12s',
                }}
              >
                {t}
              </button>
            ))}
          </div>

          <div style={{ padding: 24 }}>
            {tab === 'charts' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                {[
                  { key: 'speed',       label: 'Speed (km/h)',    color: T.blue,   domain: [0, 160]  },
                  { key: 'temperature', label: 'Temperature (°C)', color: T.amber, domain: [60, 115] },
                  { key: selVehicle.type === 'EV' ? 'battery_pct' : 'fuel_level', label: selVehicle.type === 'EV' ? 'Battery (%)' : 'Fuel Level (L)', color: T.green, domain: [0, 100] },
                  { key: 'engine_rpm',  label: 'Engine RPM',      color: T.purple, domain: [0, 7500] },
                ].map(({ key, label, color, domain }) => (
                  <div key={key} style={{ background: T.bg, borderRadius: 10, padding: 16 }}>
                    <p style={{ color: T.muted, fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 10px' }}>{label}</p>
                    <ResponsiveContainer width="100%" height={130}>
                      <AreaChart data={chartData}>
                        <defs>
                          <linearGradient id={`g-${key}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%"  stopColor={color} stopOpacity={0.3} />
                            <stop offset="95%" stopColor={color} stopOpacity={0}   />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke={T.border} vertical={false} />
                        <XAxis dataKey="timestamp" tickFormatter={v => new Date(v).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })} tick={{ fill: T.dim, fontSize: 9 }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                        <YAxis tick={{ fill: T.dim, fontSize: 10 }} axisLine={false} tickLine={false} domain={domain} />
                        <Tooltip contentStyle={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 8, color: T.text, fontSize: 12 }} labelFormatter={v => new Date(v).toLocaleTimeString()} />
                        <Area type="monotone" dataKey={key} stroke={color} fill={`url(#g-${key})`} strokeWidth={2} dot={false} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                ))}
              </div>
            )}

            {tab === 'stats' && stats && (
              <div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 16 }}>
                  {[
                    { label: 'Avg Speed',      value: `${stats.speed_kmh.avg} km/h`,    sub: `Max ${stats.speed_kmh.max} · Min ${stats.speed_kmh.min}`, color: T.blue  },
                    { label: 'Avg Temp',        value: `${stats.temperature_c.avg}°C`,   sub: `Max ${stats.temperature_c.max} · Min ${stats.temperature_c.min}`, color: T.amber },
                    { label: 'Total Readings',  value: stats.total_readings,              sub: 'Current session', color: T.green },
                    ...(stats.battery_pct ? [{ label: 'Min Battery', value: `${stats.battery_pct.min}%`, sub: `Avg ${stats.battery_pct.avg}%`, color: T.green }] : []),
                    { label: 'Max RPM',        value: stats.engine_rpm.max,              sub: `Avg ${stats.engine_rpm.avg}`, color: T.purple },
                    { label: 'Last Seen',      value: stats.last_seen ? new Date(stats.last_seen).toLocaleTimeString() : '—', sub: 'Latest timestamp', color: T.cyan },
                  ].map((s, i) => (
                    <div key={i} style={{ background: T.bg, borderRadius: 10, padding: '14px 16px', border: `1px solid ${s.color}22` }}>
                      <p style={{ color: T.muted, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 6px', fontWeight: 600 }}>{s.label}</p>
                      <p style={{ color: s.color, fontSize: 20, fontWeight: 800, margin: '0 0 3px' }}>{s.value}</p>
                      <p style={{ color: T.dim, fontSize: 11, margin: 0 }}>{s.sub}</p>
                    </div>
                  ))}
                </div>
                <div style={{ background: T.bg, borderRadius: 10, overflow: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 580 }}>
                    <thead>
                      <tr style={{ borderBottom: `1px solid ${T.border}` }}>
                        {['Time', 'Speed', 'Temp', 'Battery/Fuel', 'RPM', 'Location'].map(h => (
                          <th key={h} style={{ padding: '10px 14px', textAlign: 'left', color: T.dim, fontSize: 11, fontWeight: 700, letterSpacing: '0.05em' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {selHistory.slice(0, 15).map((r, i) => (
                        <tr key={i} style={{ borderBottom: `1px solid ${T.border}` }}>
                          <td style={{ padding: '9px 14px', color: T.muted, fontSize: 12, fontFamily: 'monospace' }}>{new Date(r.timestamp).toLocaleTimeString()}</td>
                          <td style={{ padding: '9px 14px', color: r.speed > 130 ? T.red : T.text, fontSize: 13, fontWeight: r.speed > 130 ? 700 : 400 }}>{r.speed}</td>
                          <td style={{ padding: '9px 14px', color: r.temperature > 100 ? T.red : T.text, fontSize: 13, fontWeight: r.temperature > 100 ? 700 : 400 }}>{r.temperature}°C</td>
                          <td style={{ padding: '9px 14px', color: T.text, fontSize: 13 }}>{r.battery_pct != null ? `${r.battery_pct}%` : r.fuel_level != null ? `${r.fuel_level}L` : '—'}</td>
                          <td style={{ padding: '9px 14px', color: r.engine_rpm > 6000 ? T.red : T.muted, fontSize: 12 }}>{r.engine_rpm}</td>
                          <td style={{ padding: '9px 14px', color: T.dim, fontSize: 11, fontFamily: 'monospace' }}>{r.latitude?.toFixed(4)},{r.longitude?.toFixed(4)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {tab === 'alerts' && (
              <div>
                {!alertResult && !loadingAlert[selVid] && (
                  <div style={{ textAlign: 'center', padding: 40 }}>
                    <button onClick={() => runAlerts(selVid)} style={{ background: `linear-gradient(135deg,${T.cyan},${T.blue})`, border: 'none', color: '#000', padding: '12px 28px', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                      <Shield size={16} /> Run AI Anomaly Analysis
                    </button>
                    <p style={{ color: T.muted, fontSize: 13, marginTop: 12 }}>Checks last 20 readings against safety thresholds</p>
                  </div>
                )}
                {loadingAlert[selVid] && (
                  <div style={{ textAlign: 'center', padding: 32, color: T.muted, fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                    <RefreshCw size={16} color={T.cyan} /> Analyzing telemetry data…
                  </div>
                )}
                {alertResult && !loadingAlert[selVid] && (
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ padding: '8px 20px', borderRadius: 8, background: rb(alertResult.risk_level), border: `1px solid ${rl(alertResult.risk_level)}33` }}>
                          <span style={{ color: rl(alertResult.risk_level), fontSize: 18, fontWeight: 800 }}>
                            {alertResult.risk_level === 'LOW' ? '✓ ' : alertResult.risk_level === 'HIGH' ? '🔴 ' : '⚠ '}
                            {alertResult.risk_level} RISK
                          </span>
                        </div>
                        <p style={{ color: T.muted, fontSize: 13, margin: 0, maxWidth: 380 }}>{alertResult.summary}</p>
                      </div>
                      <Btn onClick={() => runAlerts(selVid)} small variant="secondary"><RefreshCw size={12} /> Re-analyze</Btn>
                    </div>
                    {alertResult.alerts.length === 0 && (
                      <div style={{ background: T.greenBg, border: `1px solid ${T.green}33`, borderRadius: 10, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 10, color: T.green }}>
                        <CheckCircle size={18} />
                        <span style={{ fontSize: 14, fontWeight: 500 }}>All metrics within safe operating ranges.</span>
                      </div>
                    )}
                    {alertResult.alerts.map((a, i) => (
                      <div key={i} style={{ background: T.redBg, border: `1px solid ${T.red}33`, borderRadius: 10, padding: '16px 20px', marginBottom: 10 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                          <AlertTriangle size={15} color={T.red} />
                          <span style={{ color: T.red, fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{a.metric.replace('_', ' ')}</span>
                        </div>
                        <p style={{ color: T.text, fontSize: 14, fontWeight: 500, margin: '0 0 6px' }}>{a.issue}</p>
                        <p style={{ color: T.muted, fontSize: 13, margin: 0 }}>💡 {a.recommendation}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const VEHICLE_CATS = ['Sedan', 'SUV', 'Van', 'Truck', 'Bus', 'Motorcycle'];

const VehiclesPage = ({ user, vehicles, setVehicles, orgs }) => {
  const [search, setSearch] = useState('');
  const [catF,   setCatF]   = useState('');
  const [statF,  setStatF]  = useState('');
  const [modal,  setModal]  = useState(null);
  const [form,   setForm]   = useState({});

  const mv      = user.role === 'super_admin' ? vehicles : vehicles.filter(v => v.orgId === user.orgId);
  const canEdit = ['super_admin', 'org_admin', 'fleet_manager'].includes(user.role);

  const filtered = useMemo(() =>
    mv.filter(v => {
      const s = search.toLowerCase();
      return (
        (!s    || v.name.toLowerCase().includes(s) || v.plate.toLowerCase().includes(s)) &&
        (!catF  || v.cat    === catF)  &&
        (!statF || v.status === statF)
      );
    }),
    [mv, search, catF, statF]
  );

  const openAdd  = () => { setForm({ plate: '', name: '', cat: 'Sedan', orgId: user.orgId || 1, status: 'Available', year: String(new Date().getFullYear()), km: '0' }); setModal('add'); };
  const openEdit = v => { setForm({ ...v, year: String(v.year), km: String(v.km) }); setModal('edit'); };
  const save     = () => {
    if (!form.plate || !form.name) return;
    const v = { ...form, year: +form.year, km: +form.km, orgId: +form.orgId };
    if (modal === 'add') setVehicles(p => [...p, { ...v, id: Date.now() }]);
    else setVehicles(p => p.map(x => x.id === form.id ? v : x));
    setModal(null);
  };
  const del = id => setVehicles(p => p.filter(v => v.id !== id));

  const TH = ({ c }) => <th style={{ padding: '12px 16px', textAlign: 'left', color: T.dim, fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>{c}</th>;

  return (
    <div style={{ padding: 32 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 22, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ color: T.text, fontSize: 24, fontWeight: 800, margin: '0 0 4px', letterSpacing: '-0.5px' }}>Vehicles</h1>
          <p style={{ color: T.muted, fontSize: 14, margin: 0 }}>{filtered.length} of {mv.length}</p>
        </div>
        {canEdit && <Btn onClick={openAdd}><Plus size={15} /> Add Vehicle</Btn>}
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 18, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 200, position: 'relative' }}>
          <Search size={14} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: T.muted }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search plate or name…" style={{ width: '100%', padding: '9px 9px 9px 34px', background: T.card, border: `1px solid ${T.border}`, borderRadius: 8, color: T.text, fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
        </div>
        <select value={catF}  onChange={e => setCatF(e.target.value)}  style={{ padding: '9px 12px', background: T.card, border: `1px solid ${T.border}`, borderRadius: 8, color: catF  ? T.text : T.muted, fontSize: 13, outline: 'none', cursor: 'pointer' }}>
          <option value="">All Categories</option>
          {VEHICLE_CATS.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={statF} onChange={e => setStatF(e.target.value)} style={{ padding: '9px 12px', background: T.card, border: `1px solid ${T.border}`, borderRadius: 8, color: statF ? T.text : T.muted, fontSize: 13, outline: 'none', cursor: 'pointer' }}>
          <option value="">All Statuses</option>
          {['Available', 'In Use', 'Maintenance', 'Reserved'].map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 12, overflow: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 700 }}>
          <thead style={{ borderBottom: `1px solid ${T.border}` }}>
            <tr>{['PLATE', 'VEHICLE', 'CAT', 'ORG', 'STATUS', 'YEAR', 'KM', ''].map(c => <TH key={c} c={c} />)}</tr>
          </thead>
          <tbody>
            {filtered.map((v, i) => {
              const org = orgs.find(o => o.id === v.orgId);
              return (
                <tr key={v.id} style={{ borderBottom: i < filtered.length - 1 ? `1px solid ${T.border}` : 'none' }} onMouseEnter={e => e.currentTarget.style.background = T.cardHover} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <td style={{ padding: '13px 16px', color: T.accent, fontSize: 13, fontWeight: 700, fontFamily: 'monospace' }}>{v.plate}</td>
                  <td style={{ padding: '13px 16px', color: T.text,   fontSize: 14, fontWeight: 500 }}>{v.name}</td>
                  <td style={{ padding: '13px 16px', color: T.muted,  fontSize: 13 }}>{v.cat}</td>
                  <td style={{ padding: '13px 16px' }}><span style={{ background: T.accentBg, color: T.accent, padding: '2px 8px', borderRadius: 4, fontSize: 12, fontWeight: 600 }}>{org?.code || '—'}</span></td>
                  <td style={{ padding: '13px 16px' }}><Badge label={v.status} color={vc(v.status)} bg={vb(v.status)} /></td>
                  <td style={{ padding: '13px 16px', color: T.muted, fontSize: 13 }}>{v.year}</td>
                  <td style={{ padding: '13px 16px', color: T.muted, fontSize: 13 }}>{v.km.toLocaleString()}</td>
                  <td style={{ padding: '13px 16px' }}>
                    {canEdit && (
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button onClick={() => openEdit(v)} style={{ background: T.blueBg, border: 'none', color: T.blue, padding: '5px 10px', borderRadius: 6, cursor: 'pointer', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}><Edit2 size={12} /> Edit</button>
                        <button onClick={() => del(v.id)}   style={{ background: T.redBg,  border: 'none', color: T.red,  padding: '5px 8px',  borderRadius: 6, cursor: 'pointer', display: 'flex', alignItems: 'center' }}><Trash2 size={13} /></button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr><td colSpan={8} style={{ padding: 48, textAlign: 'center', color: T.muted, fontSize: 14 }}>No vehicles found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {modal && (
        <Modal title={modal === 'add' ? 'Add Vehicle' : 'Edit Vehicle'} onClose={() => setModal(null)}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="Plate"        value={form.plate} onChange={v => setForm(f => ({ ...f, plate: v }))} placeholder="MCC-007" />
            <Field label="Vehicle Name" value={form.name}  onChange={v => setForm(f => ({ ...f, name: v }))}  placeholder="Toyota Camry" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="Category" value={form.cat}    onChange={v => setForm(f => ({ ...f, cat: v }))}    options={VEHICLE_CATS} />
            <Field label="Status"   value={form.status} onChange={v => setForm(f => ({ ...f, status: v }))} options={['Available', 'In Use', 'Maintenance', 'Reserved']} />
          </div>
          {user.role === 'super_admin' && (
            <Field label="Organization" value={form.orgId} onChange={v => setForm(f => ({ ...f, orgId: v }))} options={orgs.map(o => ({ value: o.id, label: o.name }))} />
          )}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="Year"         value={form.year} onChange={v => setForm(f => ({ ...f, year: v }))} type="number" />
            <Field label="Mileage (km)" value={form.km}   onChange={v => setForm(f => ({ ...f, km: v }))}   type="number" />
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
            <Btn onClick={() => setModal(null)} variant="secondary">Cancel</Btn>
            <Btn onClick={save} disabled={!form.plate || !form.name}><CheckCircle size={14} /> Save</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
};

const SchedulesPage = ({ user, schedules, setSchedules, vehicles, users }) => {
  const [modal,    setModal]    = useState(false);
  const [statF,    setStatF]    = useState('');
  const [conflict, setConflict] = useState(false);
  const [form,     setForm]     = useState({ vehicleId: '', userId: '', purpose: '', start: fd(nowD), end: fd(nowD) });

  const ms = user.role === 'super_admin'
    ? schedules
    : user.role === 'driver'
      ? schedules.filter(s => s.userId === user.id)
      : schedules.filter(s => s.orgId === user.orgId);

  const mv       = user.role === 'super_admin' ? vehicles : vehicles.filter(v => v.orgId === user.orgId);
  const mu       = user.role === 'super_admin' ? users    : users.filter(u => u.orgId === user.orgId);
  const filtered = statF ? ms.filter(s => s.status === statF) : ms;
  const canAdd   = ['super_admin', 'org_admin', 'fleet_manager'].includes(user.role);

  const checkConflict = (vid, start, end) =>
    schedules.some(s => s.vehicleId === +vid && s.status !== 'cancelled' && s.status !== 'completed' && start <= s.end && end >= s.start);

  const upd = (field, val) => {
    const nf = { ...form, [field]: val };
    setForm(nf);
    if (nf.vehicleId && nf.start && nf.end) setConflict(checkConflict(nf.vehicleId, nf.start, nf.end));
  };

  const save = () => {
    if (!form.vehicleId || !form.purpose || conflict) return;
    const orgId = user.role === 'super_admin'
      ? vehicles.find(v => v.id === +form.vehicleId)?.orgId
      : user.orgId;
    setSchedules(p => [...p, {
      id: Date.now(), vehicleId: +form.vehicleId,
      userId: form.userId ? +form.userId : user.id,
      orgId, purpose: form.purpose, start: form.start, end: form.end, status: 'reserved',
    }]);
    setModal(false);
    setConflict(false);
  };

  const updStatus = (id, status) => setSchedules(p => p.map(s => s.id === id ? { ...s, status } : s));

  return (
    <div style={{ padding: 32 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 22, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ color: T.text, fontSize: 24, fontWeight: 800, margin: '0 0 4px', letterSpacing: '-0.5px' }}>Schedules</h1>
          <p style={{ color: T.muted, fontSize: 14, margin: 0 }}>{filtered.length} bookings</p>
        </div>
        {canAdd && <Btn onClick={() => setModal(true)}><Plus size={15} /> New Booking</Btn>}
      </div>

      <div style={{ display: 'flex', gap: 6, marginBottom: 20, flexWrap: 'wrap' }}>
        {['', ...['active', 'reserved', 'completed', 'cancelled']].map(s => (
          <button
            key={s}
            onClick={() => setStatF(s)}
            style={{
              padding: '7px 16px', borderRadius: 20, cursor: 'pointer', fontSize: 13,
              border: `1px solid ${statF === s ? (sc(s) || T.accent) : T.border}`,
              fontWeight: statF === s ? 600 : 400,
              background: statF === s ? (sb(s) || T.accentBg) : 'transparent',
              color: statF === s ? (sc(s) || T.accent) : T.muted,
              textTransform: 'capitalize',
            }}
          >
            {s || 'All'} {s && `(${ms.filter(x => x.status === s).length})`}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {filtered.sort((a, b) => b.start.localeCompare(a.start)).map(s => {
          const v = vehicles.find(vv => vv.id === s.vehicleId);
          const u = users.find(uu => uu.id === s.userId);
          return (
            <div key={s.id} style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 12, padding: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: 200 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <Badge label={s.status} color={sc(s.status)} bg={sb(s.status)} />
                  <span style={{ color: T.dim, fontSize: 11 }}>#{s.id}</span>
                </div>
                <p style={{ color: T.text, fontSize: 15, fontWeight: 600, margin: '0 0 6px' }}>{s.purpose}</p>
                <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                  <span style={{ color: T.muted, fontSize: 12 }}>🚗 {v?.name} · <span style={{ color: T.accent, fontFamily: 'monospace' }}>{v?.plate}</span></span>
                  <span style={{ color: T.muted, fontSize: 12 }}>👤 {u?.name}</span>
                  <span style={{ color: T.muted, fontSize: 12 }}>📅 {s.start} → {s.end}</span>
                </div>
              </div>
              {user.role !== 'driver' && (
                <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                  {s.status === 'reserved' && (
                    <>
                      <Btn onClick={() => updStatus(s.id, 'active')}    small variant="secondary"><Activity size={12} /> Activate</Btn>
                      <Btn onClick={() => updStatus(s.id, 'cancelled')} small variant="danger"><X size={12} /> Cancel</Btn>
                    </>
                  )}
                  {s.status === 'active' && (
                    <Btn onClick={() => updStatus(s.id, 'completed')} small><CheckCircle size={12} /> Complete</Btn>
                  )}
                </div>
              )}
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div style={{ padding: 56, textAlign: 'center', color: T.muted, background: T.card, borderRadius: 12, border: `1px solid ${T.border}`, fontSize: 14 }}>
            No schedules found
          </div>
        )}
      </div>

      {modal && (
        <Modal title="Create Booking" onClose={() => { setModal(false); setConflict(false); }}>
          <Field label="Vehicle" value={form.vehicleId} onChange={v => upd('vehicleId', v)} options={[{ value: '', label: '— Select vehicle —' }, ...mv.filter(v => v.status === 'Available' || v.status === 'Reserved').map(v => ({ value: v.id, label: `${v.name} (${v.plate})` }))]} />
          <Field label="Purpose"   value={form.purpose} onChange={v => upd('purpose', v)} placeholder="Trip description…" />
          <Field label="Assign To" value={form.userId}  onChange={v => upd('userId', v)}  options={[{ value: '', label: `Self (${user.name})` }, ...mu.filter(u => u.id !== user.id).map(u => ({ value: u.id, label: `${u.name} — ${ROLES_MAP[u.role]}` }))]} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="Start" value={form.start} onChange={v => upd('start', v)} type="date" />
            <Field label="End"   value={form.end}   onChange={v => upd('end',   v)} type="date" />
          </div>
          {conflict && (
            <div style={{ background: T.redBg, border: `1px solid ${T.red}33`, borderRadius: 8, padding: '10px 14px', marginBottom: 12, color: T.red, fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}>
              <AlertCircle size={15} /> Conflict: vehicle already booked for these dates.
            </div>
          )}
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <Btn onClick={() => setModal(false)} variant="secondary">Cancel</Btn>
            <Btn onClick={save} disabled={!form.vehicleId || !form.purpose || conflict}><CheckCircle size={14} /> Confirm</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
};

const OrgsPage = ({ orgs, setOrgs, vehicles, users }) => {
  const [modal, setModal] = useState(null);
  const [form,  setForm]  = useState({ name: '', code: '', status: 'active' });

  const save = () => {
    if (!form.name || !form.code) return;
    if (modal === 'add') setOrgs(p => [...p, { ...form, id: Date.now(), createdAt: fd(nowD) }]);
    else setOrgs(p => p.map(o => o.id === form.id ? form : o));
    setModal(null);
  };

  return (
    <div style={{ padding: 32 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ color: T.text, fontSize: 24, fontWeight: 800, margin: '0 0 4px', letterSpacing: '-0.5px' }}>Organizations</h1>
          <p style={{ color: T.muted, fontSize: 14, margin: 0 }}>{orgs.length} organizations</p>
        </div>
        <Btn onClick={() => { setForm({ name: '', code: '', status: 'active' }); setModal('add'); }}><Plus size={15} /> Add</Btn>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 16 }}>
        {orgs.map(o => {
          const vehicleCount = vehicles.filter(v => v.orgId === o.id).length;
          const userCount    = users.filter(u => u.orgId === o.id).length;
          const availCount   = vehicles.filter(v => v.orgId === o.id && v.status === 'Available').length;
          return (
            <div key={o.id} style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 12, padding: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 }}>
                <div style={{ width: 46, height: 46, background: T.accentBg, borderRadius: 11, display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.accent, fontSize: 15, fontWeight: 800 }}>{o.code}</div>
                <Badge label={o.status} color={o.status === 'active' ? T.green : T.red} bg={o.status === 'active' ? T.greenBg : T.redBg} />
              </div>
              <h3 style={{ color: T.text, fontSize: 16, fontWeight: 700, margin: '0 0 4px' }}>{o.name}</h3>
              <p style={{ color: T.dim, fontSize: 12, margin: '0 0 18px' }}>Since {o.createdAt}</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 18, background: T.bg, borderRadius: 8, padding: 12 }}>
                {[['Vehicles', vehicleCount, T.blue], ['Available', availCount, T.green], ['Users', userCount, T.amber]].map(([l, v, c]) => (
                  <div key={l} style={{ textAlign: 'center' }}>
                    <p style={{ color: c, fontSize: 20, fontWeight: 800, margin: '0 0 2px' }}>{v}</p>
                    <p style={{ color: T.dim, fontSize: 11, margin: 0 }}>{l}</p>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => { setForm({ ...o }); setModal('edit'); }} style={{ flex: 1, padding: '8px', background: T.blueBg, border: 'none', color: T.blue, borderRadius: 7, cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
                  <Edit2 size={13} /> Edit
                </button>
                <button onClick={() => setOrgs(p => p.filter(x => x.id !== o.id))} style={{ padding: '8px 12px', background: T.redBg, border: 'none', color: T.red, borderRadius: 7, cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {modal && (
        <Modal title={modal === 'add' ? 'Add Organization' : 'Edit Organization'} onClose={() => setModal(null)}>
          <Field label="Name"   value={form.name}   onChange={v => setForm(f => ({ ...f, name: v }))} placeholder="West Coast Authority" />
          <Field label="Code"   value={form.code}   onChange={v => setForm(f => ({ ...f, code: v.toUpperCase().slice(0, 5) }))} placeholder="WCA" />
          <Field label="Status" value={form.status} onChange={v => setForm(f => ({ ...f, status: v }))} options={['active', 'inactive']} />
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <Btn onClick={() => setModal(null)} variant="secondary">Cancel</Btn>
            <Btn onClick={save} disabled={!form.name || !form.code}><CheckCircle size={14} /> Save</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
};

const UsersPage = ({ user, users, setUsers, orgs }) => {
  const [modal,  setModal]  = useState(null);
  const [form,   setForm]   = useState({});
  const [search, setSearch] = useState('');

  const mu       = user.role === 'super_admin' ? users : users.filter(u => u.orgId === user.orgId);
  const filtered = search
    ? mu.filter(u => u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()))
    : mu;

  const save = () => {
    if (!form.name || !form.email) return;
    const initials = form.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    const entry    = { ...form, initials, passHash: form.passHash || hashPassword('password') };
    if (modal === 'add') setUsers(p => [...p, { ...entry, id: Date.now() }]);
    else setUsers(p => p.map(u => u.id === form.id ? entry : u));
    setModal(null);
  };

  const TH = ({ c }) => <th style={{ padding: '12px 16px', textAlign: 'left', color: T.dim, fontSize: 11, fontWeight: 700, letterSpacing: '0.06em' }}>{c}</th>;

  return (
    <div style={{ padding: 32 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 22, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ color: T.text, fontSize: 24, fontWeight: 800, margin: '0 0 4px', letterSpacing: '-0.5px' }}>Users</h1>
          <p style={{ color: T.muted, fontSize: 14, margin: 0 }}>{filtered.length} users</p>
        </div>
        <Btn onClick={() => { setForm({ name: '', email: '', role: 'driver', orgId: user.orgId || 1 }); setModal('add'); }}>
          <Plus size={15} /> Add User
        </Btn>
      </div>

      <div style={{ position: 'relative', marginBottom: 18, maxWidth: 320 }}>
        <Search size={14} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: T.muted }} />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search…" style={{ width: '100%', padding: '9px 9px 9px 34px', background: T.card, border: `1px solid ${T.border}`, borderRadius: 8, color: T.text, fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
      </div>

      <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 12, overflow: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 600 }}>
          <thead style={{ borderBottom: `1px solid ${T.border}` }}>
            <tr>{['USER', 'EMAIL', 'ROLE', 'ORGANIZATION', ''].map(c => <TH key={c} c={c} />)}</tr>
          </thead>
          <tbody>
            {filtered.map((u, i) => {
              const org = orgs.find(o => o.id === u.orgId);
              const rc  = ROLE_COLORS[u.role] || T.muted;
              return (
                <tr key={u.id} style={{ borderBottom: i < filtered.length - 1 ? `1px solid ${T.border}` : 'none' }} onMouseEnter={e => e.currentTarget.style.background = T.cardHover} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <td style={{ padding: '13px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 34, height: 34, borderRadius: '50%', background: `${rc}18`, border: `2px solid ${rc}33`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: rc, fontSize: 12, fontWeight: 700 }}>{u.initials}</div>
                      <div>
                        <p style={{ color: T.text, fontSize: 14, fontWeight: 600, margin: 0 }}>{u.name}</p>
                        {u.id === user.id && <span style={{ color: T.accent, fontSize: 11 }}>● You</span>}
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '13px 16px', color: T.muted,  fontSize: 13 }}>{u.email}</td>
                  <td style={{ padding: '13px 16px' }}><Badge label={ROLES_MAP[u.role]} color={rc} bg={`${rc}14`} /></td>
                  <td style={{ padding: '13px 16px', color: T.muted,  fontSize: 13 }}>{org?.name || <span style={{ color: T.dim, fontStyle: 'italic' }}>Platform</span>}</td>
                  <td style={{ padding: '13px 16px' }}>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button onClick={() => { setForm({ ...u }); setModal('edit'); }} style={{ background: T.blueBg, border: 'none', color: T.blue, padding: '5px 10px', borderRadius: 6, cursor: 'pointer', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}><Edit2 size={12} /> Edit</button>
                      {u.id !== user.id && <button onClick={() => setUsers(p => p.filter(x => x.id !== u.id))} style={{ background: T.redBg, border: 'none', color: T.red, padding: '5px 8px', borderRadius: 6, cursor: 'pointer', display: 'flex', alignItems: 'center' }}><Trash2 size={13} /></button>}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {modal && (
        <Modal title={modal === 'add' ? 'Add User' : 'Edit User'} onClose={() => setModal(null)}>
          <Field label="Full Name" value={form.name}  onChange={v => setForm(f => ({ ...f, name: v }))}  placeholder="John Smith" />
          <Field label="Email"     value={form.email} onChange={v => setForm(f => ({ ...f, email: v }))} type="email" />
          <Field label="Role"      value={form.role}  onChange={v => setForm(f => ({ ...f, role: v }))}
            options={Object.entries(ROLES_MAP).filter(([k]) => user.role === 'super_admin' || k !== 'super_admin').map(([value, label]) => ({ value, label }))}
          />
          {user.role === 'super_admin' && (
            <Field label="Organization" value={form.orgId || ''} onChange={v => setForm(f => ({ ...f, orgId: +v || null }))}
              options={[{ value: '', label: 'None (Platform Admin)' }, ...orgs.map(o => ({ value: o.id, label: o.name }))]}
            />
          )}
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <Btn onClick={() => setModal(null)} variant="secondary">Cancel</Btn>
            <Btn onClick={save} disabled={!form.name || !form.email}><CheckCircle size={14} /> Save</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
};

const ReportsPage = ({ user, vehicles, schedules, orgs, history }) => {
  const mv = user.role === 'super_admin' ? vehicles : vehicles.filter(v => v.orgId === user.orgId);
  const ms = user.role === 'super_admin' ? schedules : schedules.filter(s => s.orgId === user.orgId);

  const utilData = VEHICLE_CATS.map(cat => {
    const total = mv.filter(v => v.cat === cat).length;
    const used  = mv.filter(v => v.cat === cat && (v.status === 'In Use' || v.status === 'Reserved')).length;
    return { cat, total, pct: total ? Math.round(used / total * 100) : 0 };
  }).filter(d => d.total > 0);

  const statusDist = [
    { s: 'Available',   count: mv.filter(v => v.status === 'Available').length,   color: T.green },
    { s: 'In Use',      count: mv.filter(v => v.status === 'In Use').length,      color: T.blue  },
    { s: 'Maintenance', count: mv.filter(v => v.status === 'Maintenance').length, color: T.red   },
    { s: 'Reserved',    count: mv.filter(v => v.status === 'Reserved').length,    color: T.amber },
  ];

  const orgData = user.role === 'super_admin'
    ? orgs.map(o => ({
        org:       o.code,
        vehicles:  vehicles.filter(v => v.orgId === o.id).length,
        active:    schedules.filter(s => s.orgId === o.id && (s.status === 'active' || s.status === 'reserved')).length,
        completed: schedules.filter(s => s.orgId === o.id && s.status === 'completed').length,
      }))
    : [];

  const liveSpeedData = SIM_VEHICLES.map(v => {
    const h   = history[v.id] || [];
    const avg = h.length ? +(h.slice(0, 10).reduce((s, r) => s + (r.speed || 0), 0) / Math.min(10, h.length)).toFixed(1) : 0;
    return { name: v.id, avg, color: v.color };
  });

  const utilPct = mv.length ? Math.round(mv.filter(v => v.status === 'In Use' || v.status === 'Reserved').length / mv.length * 100) : 0;

  return (
    <div style={{ padding: 32 }}>
      <div style={{ marginBottom: 26 }}>
        <h1 style={{ color: T.text, fontSize: 24, fontWeight: 800, margin: '0 0 4px', letterSpacing: '-0.5px' }}>Reports</h1>
        <p style={{ color: T.muted, fontSize: 14, margin: 0 }}>Fleet performance & telemetry analytics</p>
      </div>

      <div style={{ display: 'flex', gap: 14, marginBottom: 22, flexWrap: 'wrap' }}>
        <StatCard icon={TrendingUp}   label="Fleet Utilization"  value={`${utilPct}%`}                              color={T.blue}  />
        <StatCard icon={CheckCircle}  label="Completed Trips"    value={ms.filter(s => s.status === 'completed').length} color={T.green} sub={`of ${ms.length} total`} />
        <StatCard icon={AlertCircle}  label="In Maintenance"     value={mv.filter(v => v.status === 'Maintenance').length} color={T.red}  />
        <StatCard icon={Activity}     label="Live Telemetry"     value={SIM_VEHICLES.length}                        color={T.cyan}  pulse sub="Vehicles online" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
        <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 12, padding: 24 }}>
          <h3 style={{ color: T.text, fontSize: 14, fontWeight: 700, margin: '0 0 18px' }}>Utilization by Category</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={utilData}>
              <CartesianGrid strokeDasharray="3 3" stroke={T.border} vertical={false} />
              <XAxis dataKey="cat" tick={{ fill: T.muted, fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: T.muted, fontSize: 12 }} axisLine={false} tickLine={false} domain={[0, 100]} unit="%" />
              <Tooltip contentStyle={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 8, color: T.text, fontSize: 13 }} formatter={v => [`${v}%`, 'Utilization']} />
              <Bar dataKey="pct" fill={T.accent} radius={[4, 4, 0, 0]} barSize={26} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 12, padding: 24 }}>
          <h3 style={{ color: T.text, fontSize: 14, fontWeight: 700, margin: '0 0 20px' }}>Fleet Status</h3>
          {statusDist.map(d => (
            <div key={d.s} style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ color: T.muted, fontSize: 13 }}>{d.s}</span>
                <span style={{ color: T.text, fontSize: 13, fontWeight: 700 }}>{d.count}</span>
              </div>
              <div style={{ height: 7, background: T.bg, borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ height: '100%', background: d.color, borderRadius: 4, width: `${mv.length ? d.count / mv.length * 100 : 0}%`, transition: 'width 0.5s' }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ background: T.card, border: `1px solid ${T.cyan}33`, borderRadius: 12, padding: 24, marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: T.cyan, display: 'inline-block', animation: 'pulse 2s infinite' }} />
          <h3 style={{ color: T.text, fontSize: 14, fontWeight: 700, margin: 0 }}>Live Avg Speed — Telemetry Vehicles</h3>
        </div>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={liveSpeedData}>
            <CartesianGrid strokeDasharray="3 3" stroke={T.border} vertical={false} />
            <XAxis dataKey="name" tick={{ fill: T.muted, fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: T.muted, fontSize: 12 }} axisLine={false} tickLine={false} unit=" km/h" />
            <Tooltip contentStyle={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 8, color: T.text, fontSize: 13 }} formatter={v => [`${v} km/h`, 'Avg Speed']} />
            <Bar dataKey="avg" radius={[5, 5, 0, 0]} barSize={36}>
              {liveSpeedData.map((e, i) => <Cell key={`speed-${i}`} fill={e.color} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {user.role === 'super_admin' && (
        <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 12, padding: 24 }}>
          <h3 style={{ color: T.text, fontSize: 14, fontWeight: 700, margin: '0 0 18px' }}>Organization Comparison</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={orgData} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke={T.border} vertical={false} />
              <XAxis dataKey="org" tick={{ fill: T.muted, fontSize: 13 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: T.muted, fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 8, color: T.text, fontSize: 13 }} />
              <Legend wrapperStyle={{ color: T.muted, fontSize: 12 }} />
              <Bar dataKey="vehicles"  fill={T.blue}  radius={[4, 4, 0, 0]} barSize={22} name="Vehicles"  />
              <Bar dataKey="active"    fill={T.accent} radius={[4, 4, 0, 0]} barSize={22} name="Active"    />
              <Bar dataKey="completed" fill={T.green} radius={[4, 4, 0, 0]} barSize={22} name="Completed" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

const PAGE_TITLES = {
  dashboard: 'Dashboard', telemetry: 'Live Telemetry', vehicles: 'Vehicles',
  schedules: 'Schedules', organizations: 'Organizations', users: 'Users', reports: 'Reports',
};

const TopBar = ({ page, user, alerts }) => (
  <div style={{ height: 60, borderBottom: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px', background: T.bg, position: 'sticky', top: 0, zIndex: 10 }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <span style={{ color: T.dim, fontSize: 13 }}>FleetOS</span>
      <span style={{ color: T.border }}>›</span>
      <span style={{ color: T.text, fontSize: 13, fontWeight: 600 }}>{PAGE_TITLES[page]}</span>
    </div>
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{ background: T.greenBg, color: T.green, padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 500, border: `1px solid ${T.green}33` }}>● System Online</div>
      {alerts > 0 && (
        <div style={{ background: T.redBg, color: T.red, padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600, border: `1px solid ${T.red}33`, animation: 'pulse 2s infinite' }}>
          <AlertTriangle size={11} style={{ marginRight: 4, display: 'inline' }} />
          {alerts} Alert{alerts > 1 ? 's' : ''}
        </div>
      )}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 12px', background: T.card, border: `1px solid ${T.border}`, borderRadius: 8 }}>
        <div style={{ width: 24, height: 24, borderRadius: '50%', background: `linear-gradient(135deg,${ROLE_COLORS[user.role]},${T.accent})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: '#fff' }}>{user.initials}</div>
        <span style={{ color: T.text, fontSize: 13, fontWeight: 500 }}>{user.name.split(' ')[0]}</span>
      </div>
    </div>
  </div>
);

export default function FleetApp() {
  useEffect(() => {
    const link  = document.createElement('link');
    link.href   = 'https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap';
    link.rel    = 'stylesheet';
    document.head.appendChild(link);
    return () => document.head.removeChild(link);
  }, []);

  const [currentUser, setCurrentUser] = useState(null);
  const [page,        setPage]        = useState('dashboard');
  const [orgs,        setOrgs]        = useState(ORGS0);
  const [vehicles,    setVehicles]    = useState(VEHICLES0);
  const [schedules,   setSchedules]   = useState(SCHEDULES0);
  const [users,       setUsers]       = useState(USERS0);
  const [apiUrl,      setApiUrl]      = useState('http://localhost:8000');
  const [connected,   setConnected]   = useState(false);
  const [telemetry,   dispatch]       = useReducer(telemetryReducer, undefined, initTelemetry);

  useEffect(() => {
    const ping = async () => {
      try {
        const r = await abortableFetch(`${apiUrl}/`);
        setConnected(r.ok);
      } catch {
        setConnected(false);
      }
    };
    ping();
    const t = setInterval(ping, 10000);
    return () => clearInterval(t);
  }, [apiUrl]);

  useEffect(() => {
    const t = setInterval(() => {
      dispatch({ timestamp: new Date().toISOString() });
    }, 2000);
    return () => clearInterval(t);
  }, []);

  const liveAlerts = Object.values(telemetry.sim).filter(s => s.activeAnomaly).length;

  if (!currentUser) {
    return <LoginScreen onLogin={u => { setCurrentUser(u); setPage('dashboard'); }} />;
  }

  const sharedProps = { user: currentUser, orgs, vehicles, schedules, users, setOrgs, setVehicles, setSchedules, setUsers };

  const PAGES = {
    dashboard:     <Dashboard    {...sharedProps} simState={telemetry.sim} />,
    telemetry:     <TelemetryPage simState={telemetry.sim} history={telemetry.history} apiUrl={apiUrl} setApiUrl={setApiUrl} connected={connected} />,
    vehicles:      <VehiclesPage  {...sharedProps} />,
    schedules:     <SchedulesPage {...sharedProps} />,
    organizations: <OrgsPage      {...sharedProps} />,
    users:         <UsersPage     {...sharedProps} />,
    reports:       <ReportsPage   {...sharedProps} history={telemetry.history} />,
  };

  return (
    <div style={{ display: 'flex', height: '100vh', background: T.bg, fontFamily: '"Outfit",system-ui,sans-serif', color: T.text, overflow: 'hidden' }}>
      <style>{`@keyframes pulse { 0%,100% { opacity:1 } 50% { opacity:0.5 } }`}</style>
      <Sidebar user={currentUser} page={page} setPage={setPage} onLogout={() => setCurrentUser(null)} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <TopBar page={page} user={currentUser} alerts={liveAlerts} />
        <main style={{ flex: 1, overflowY: 'auto' }}>{PAGES[page] || PAGES.dashboard}</main>
      </div>
    </div>
  );
}
