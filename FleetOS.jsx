import { useState, useMemo, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from "recharts";
import { Truck, Calendar, Building2, Users, LayoutDashboard, LogOut, Plus, Edit2, Trash2, Search, X, BarChart2, Eye, EyeOff, CheckCircle, AlertCircle, Activity, TrendingUp, Bell } from "lucide-react";

// ── THEME ─────────────────────────────────────────────────────────────
const T = {
  bg:'#06101f', sidebar:'#080e1c', card:'#0c1524', cardHover:'#111e30',
  border:'rgba(148,163,184,0.1)', borderHi:'rgba(148,163,184,0.2)',
  accent:'#f59e0b', accentBg:'rgba(245,158,11,0.1)',
  blue:'#60a5fa',  blueBg:'rgba(96,165,250,0.1)',
  green:'#34d399', greenBg:'rgba(52,211,153,0.1)',
  red:'#fb7185',   redBg:'rgba(251,113,133,0.1)',
  amber:'#fbbf24', amberBg:'rgba(251,191,36,0.1)',
  text:'#e2e8f0',  muted:'#94a3b8', dim:'#475569',
};

const vc=(s)=>({Available:T.green,'In Use':T.blue,Maintenance:T.red,Reserved:T.amber}[s]||T.muted);
const vb=(s)=>({Available:T.greenBg,'In Use':T.blueBg,Maintenance:T.redBg,Reserved:T.amberBg}[s]||'transparent');
const sc=(s)=>({active:T.blue,reserved:T.amber,completed:T.green,cancelled:T.red}[s]||T.muted);
const sb=(s)=>({active:T.blueBg,reserved:T.amberBg,completed:T.greenBg,cancelled:T.redBg}[s]||'transparent');

// ── MOCK DATA ──────────────────────────────────────────────────────────
const now = new Date();
const fd = d => new Date(d).toISOString().split('T')[0];
const ad = n => { const d=new Date(now); d.setDate(d.getDate()+n); return fd(d); };

const USERS0 = [
  {id:1,name:"Alex Morrison",email:"super@fleet.com",pass:"admin123",role:"super_admin",orgId:null,initials:"AM"},
  {id:2,name:"Sarah Chen",email:"admin@mcc.com",pass:"admin123",role:"org_admin",orgId:1,initials:"SC"},
  {id:3,name:"Mike Torres",email:"manager@mcc.com",pass:"manager123",role:"fleet_manager",orgId:1,initials:"MT"},
  {id:4,name:"James Wilson",email:"driver@mcc.com",pass:"driver123",role:"driver",orgId:1,initials:"JW"},
  {id:5,name:"Priya Sharma",email:"admin@ntc.com",pass:"admin123",role:"org_admin",orgId:2,initials:"PS"},
  {id:6,name:"David Kim",email:"manager@sda.com",pass:"manager123",role:"fleet_manager",orgId:3,initials:"DK"},
];

const ORGS0 = [
  {id:1,name:"Metro City Council",code:"MCC",status:"active",createdAt:"2024-01-15"},
  {id:2,name:"Northern Transport Co.",code:"NTC",status:"active",createdAt:"2024-02-20"},
  {id:3,name:"South District Authority",code:"SDA",status:"active",createdAt:"2024-03-10"},
];

const VEHICLES0 = [
  {id:1,plate:"MCC-001",name:"Toyota Camry",cat:"Sedan",orgId:1,status:"Available",year:2022,km:15420},
  {id:2,plate:"MCC-002",name:"Ford Ranger",cat:"Truck",orgId:1,status:"In Use",year:2021,km:28100},
  {id:3,plate:"MCC-003",name:"Toyota HiAce",cat:"Van",orgId:1,status:"Available",year:2023,km:8500},
  {id:4,plate:"MCC-004",name:"Mitsubishi Pajero",cat:"SUV",orgId:1,status:"Maintenance",year:2020,km:45000},
  {id:5,plate:"MCC-005",name:"Honda Civic",cat:"Sedan",orgId:1,status:"Available",year:2023,km:5200},
  {id:6,plate:"MCC-006",name:"Isuzu Crosswind",cat:"SUV",orgId:1,status:"Reserved",year:2022,km:22300},
  {id:7,plate:"NTC-001",name:"Volvo FH16",cat:"Truck",orgId:2,status:"In Use",year:2021,km:62000},
  {id:8,plate:"NTC-002",name:"Mercedes Sprinter",cat:"Van",orgId:2,status:"Available",year:2022,km:18700},
  {id:9,plate:"NTC-003",name:"BMW X5",cat:"SUV",orgId:2,status:"Available",year:2023,km:9100},
  {id:10,plate:"SDA-001",name:"Toyota Land Cruiser",cat:"SUV",orgId:3,status:"Available",year:2021,km:35000},
  {id:11,plate:"SDA-002",name:"Nissan Urvan",cat:"Bus",orgId:3,status:"In Use",year:2020,km:55000},
  {id:12,plate:"SDA-003",name:"Ford Transit",cat:"Van",orgId:3,status:"Maintenance",year:2019,km:78000},
];

const SCHEDULES0 = [
  {id:1,vehicleId:2,userId:3,orgId:1,purpose:"Field inspection - North District",start:ad(-1),end:fd(now),status:"active"},
  {id:2,vehicleId:6,userId:4,orgId:1,purpose:"Site visit - Construction area",start:fd(now),end:ad(1),status:"reserved"},
  {id:3,vehicleId:1,userId:3,orgId:1,purpose:"Office supplies delivery",start:ad(1),end:ad(1),status:"reserved"},
  {id:4,vehicleId:7,userId:5,orgId:2,purpose:"Cargo transport - Port",start:ad(-3),end:ad(-1),status:"completed"},
  {id:5,vehicleId:11,userId:6,orgId:3,purpose:"Staff transport - Route 5",start:fd(now),end:ad(2),status:"active"},
  {id:6,vehicleId:3,userId:3,orgId:1,purpose:"Equipment transport",start:ad(3),end:ad(4),status:"reserved"},
  {id:7,vehicleId:9,userId:5,orgId:2,purpose:"Executive transport",start:ad(2),end:ad(3),status:"reserved"},
];

const CATS = ["Sedan","SUV","Van","Truck","Bus","Motorcycle"];
const ROLES = {super_admin:"Super Admin",org_admin:"Org Admin",fleet_manager:"Fleet Manager",driver:"Driver"};
const ROLE_COLORS = {super_admin:T.accent,org_admin:T.blue,fleet_manager:T.green,driver:T.amber};

// ── SHARED UI ──────────────────────────────────────────────────────────
const Badge = ({label,color,bg})=>(
  <span style={{display:'inline-flex',alignItems:'center',padding:'3px 10px',borderRadius:20,
    fontSize:12,fontWeight:500,color,background:bg,border:`1px solid ${color}33`,whiteSpace:'nowrap'}}>
    {label}
  </span>
);

const Modal = ({title,onClose,children})=>(
  <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.75)',display:'flex',
    alignItems:'center',justifyContent:'center',zIndex:1000,backdropFilter:'blur(4px)',padding:16}}>
    <div style={{background:T.card,border:`1px solid ${T.borderHi}`,borderRadius:16,padding:32,
      width:'100%',maxWidth:520,maxHeight:'90vh',overflowY:'auto',
      boxShadow:'0 30px 60px rgba(0,0,0,0.6)'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:24}}>
        <h2 style={{color:T.text,fontSize:18,fontWeight:700,margin:0}}>{title}</h2>
        <button onClick={onClose} style={{background:'none',border:'none',color:T.muted,cursor:'pointer',padding:4,display:'flex'}}>
          <X size={20}/>
        </button>
      </div>
      {children}
    </div>
  </div>
);

const Field = ({label,value,onChange,type='text',options,placeholder})=>(
  <div style={{marginBottom:16}}>
    <label style={{display:'block',color:T.muted,fontSize:13,marginBottom:6,fontWeight:500}}>{label}</label>
    {options ? (
      <select value={value} onChange={e=>onChange(e.target.value)}
        style={{width:'100%',padding:'10px 12px',background:'#0a1525',border:`1px solid ${T.border}`,
          borderRadius:8,color:T.text,fontSize:14,outline:'none',cursor:'pointer',boxSizing:'border-box'}}>
        {options.map(o=><option key={o.value??o} value={o.value??o}>{o.label??o}</option>)}
      </select>
    ):(
      <input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder||''}
        style={{width:'100%',padding:'10px 12px',background:'#0a1525',border:`1px solid ${T.border}`,
          borderRadius:8,color:T.text,fontSize:14,outline:'none',boxSizing:'border-box'}}/>
    )}
  </div>
);

const Btn = ({onClick,children,variant='primary',small,disabled})=>{
  const s = {
    primary:{background:disabled?T.dim:`linear-gradient(135deg,${T.accent},#d97706)`,color:'#000',border:'none'},
    secondary:{background:'transparent',color:T.text,border:`1px solid ${T.border}`},
    danger:{background:T.redBg,color:T.red,border:`1px solid ${T.red}33`},
    ghost:{background:'transparent',color:T.muted,border:'none'},
  };
  return (
    <button onClick={disabled?undefined:onClick} style={{
      ...s[variant],padding:small?'6px 14px':'10px 20px',borderRadius:8,
      fontSize:small?12:14,fontWeight:600,cursor:disabled?'not-allowed':'pointer',
      display:'inline-flex',alignItems:'center',gap:6,opacity:disabled?0.5:1,
      transition:'opacity 0.15s',whiteSpace:'nowrap'
    }}>{children}</button>
  );
};

const StatCard = ({icon:Icon,label,value,color,sub})=>(
  <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:12,padding:24,flex:1,minWidth:160}}>
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:12}}>
      <div>
        <p style={{color:T.muted,fontSize:12,margin:'0 0 8px',fontWeight:500,letterSpacing:'0.04em',textTransform:'uppercase'}}>{label}</p>
        <p style={{color:T.text,fontSize:26,fontWeight:800,margin:0,letterSpacing:'-0.5px'}}>{value}</p>
        {sub&&<p style={{color:T.dim,fontSize:12,margin:'4px 0 0'}}>{sub}</p>}
      </div>
      <div style={{background:`${color}18`,borderRadius:10,padding:10,flexShrink:0}}>
        <Icon size={20} color={color}/>
      </div>
    </div>
  </div>
);

// ── LOGIN ──────────────────────────────────────────────────────────────
const LoginScreen = ({onLogin})=>{
  const [email,setEmail]=useState('');
  const [pass,setPass]=useState('');
  const [showPass,setShowPass]=useState(false);
  const [error,setError]=useState('');

  const handle=()=>{
    const u=USERS0.find(u=>u.email===email&&u.pass===pass);
    if(u) onLogin(u); else setError('Invalid email or password');
  };

  const demo = [
    ['Super Admin','super@fleet.com','admin123'],
    ['Org Admin','admin@mcc.com','admin123'],
    ['Fleet Manager','manager@mcc.com','manager123'],
    ['Driver','driver@mcc.com','driver123'],
  ];

  return (
    <div style={{minHeight:'100vh',background:T.bg,display:'flex',alignItems:'center',justifyContent:'center',
      fontFamily:'"Outfit",system-ui,sans-serif',padding:16,
      backgroundImage:`radial-gradient(ellipse at 20% 50%,rgba(245,158,11,0.06) 0%,transparent 55%),
        radial-gradient(ellipse at 80% 20%,rgba(96,165,250,0.06) 0%,transparent 50%)`}}>
      <div style={{width:'100%',maxWidth:420}}>
        {/* Brand */}
        <div style={{textAlign:'center',marginBottom:36}}>
          <div style={{display:'inline-flex',alignItems:'center',gap:12,marginBottom:10}}>
            <div style={{width:46,height:46,background:`linear-gradient(135deg,${T.accent},#d97706)`,
              borderRadius:13,display:'flex',alignItems:'center',justifyContent:'center',
              boxShadow:`0 8px 24px ${T.accent}44`}}>
              <Truck size={24} color="#000"/>
            </div>
            <span style={{fontSize:26,fontWeight:800,color:T.text,letterSpacing:'-1px'}}>FleetOS</span>
          </div>
          <p style={{color:T.muted,fontSize:14,margin:0}}>Fleet Governance & Scheduling System</p>
        </div>

        {/* Card */}
        <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:16,padding:32,
          boxShadow:'0 20px 40px rgba(0,0,0,0.4)'}}>
          <h2 style={{color:T.text,fontSize:20,fontWeight:700,margin:'0 0 22px'}}>Sign in</h2>
          <div style={{marginBottom:14}}>
            <label style={{display:'block',color:T.muted,fontSize:13,marginBottom:6,fontWeight:500}}>Email</label>
            <input type="email" value={email} onChange={e=>{setEmail(e.target.value);setError('');}}
              placeholder="you@example.com" onKeyDown={e=>e.key==='Enter'&&handle()}
              style={{width:'100%',padding:'11px 14px',background:'#0a1525',
                border:`1px solid ${error?T.red:T.border}`,borderRadius:8,color:T.text,
                fontSize:14,outline:'none',boxSizing:'border-box'}}/>
          </div>
          <div style={{marginBottom:error?8:20,position:'relative'}}>
            <label style={{display:'block',color:T.muted,fontSize:13,marginBottom:6,fontWeight:500}}>Password</label>
            <input type={showPass?'text':'password'} value={pass} onChange={e=>{setPass(e.target.value);setError('');}}
              placeholder="••••••••" onKeyDown={e=>e.key==='Enter'&&handle()}
              style={{width:'100%',padding:'11px 40px 11px 14px',background:'#0a1525',
                border:`1px solid ${error?T.red:T.border}`,borderRadius:8,color:T.text,
                fontSize:14,outline:'none',boxSizing:'border-box'}}/>
            <button onClick={()=>setShowPass(!showPass)} style={{position:'absolute',right:12,top:34,
              background:'none',border:'none',color:T.muted,cursor:'pointer',display:'flex',padding:0}}>
              {showPass?<EyeOff size={16}/>:<Eye size={16}/>}
            </button>
          </div>
          {error&&<p style={{color:T.red,fontSize:13,margin:'0 0 16px'}}>{error}</p>}
          <button onClick={handle} style={{width:'100%',padding:'12px',
            background:`linear-gradient(135deg,${T.accent},#d97706)`,border:'none',borderRadius:8,
            color:'#000',fontSize:15,fontWeight:700,cursor:'pointer',
            boxShadow:`0 4px 16px ${T.accent}44`}}>
            Sign In
          </button>
        </div>

        {/* Demo creds */}
        <div style={{marginTop:16,background:'rgba(96,165,250,0.05)',border:`1px solid ${T.blue}22`,
          borderRadius:12,padding:16}}>
          <p style={{color:T.blue,fontSize:11,fontWeight:700,margin:'0 0 10px',letterSpacing:'0.08em'}}>DEMO ACCOUNTS</p>
          {demo.map(([role,e,p])=>(
            <div key={role} style={{display:'flex',justifyContent:'space-between',alignItems:'center',
              padding:'6px 0',borderBottom:`1px solid ${T.border}`}}>
              <div>
                <span style={{color:T.text,fontSize:13,fontWeight:500}}>{role}</span>
                <span style={{color:T.dim,fontSize:12,marginLeft:8}}>{e}</span>
              </div>
              <button onClick={()=>{setEmail(e);setPass(p);setError('');}} style={{
                background:'none',border:`1px solid ${T.border}`,color:T.muted,
                fontSize:11,padding:'3px 10px',borderRadius:4,cursor:'pointer',fontWeight:500}}>
                Use
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ── SIDEBAR ────────────────────────────────────────────────────────────
const NAV=[
  {id:'dashboard',icon:LayoutDashboard,label:'Dashboard',roles:['super_admin','org_admin','fleet_manager','driver']},
  {id:'vehicles',icon:Truck,label:'Vehicles',roles:['super_admin','org_admin','fleet_manager','driver']},
  {id:'schedules',icon:Calendar,label:'Schedules',roles:['super_admin','org_admin','fleet_manager','driver']},
  {id:'organizations',icon:Building2,label:'Organizations',roles:['super_admin']},
  {id:'users',icon:Users,label:'Users',roles:['super_admin','org_admin']},
  {id:'reports',icon:BarChart2,label:'Reports',roles:['super_admin','org_admin','fleet_manager']},
];

const Sidebar=({user,page,setPage,onLogout})=>(
  <div style={{width:220,background:T.sidebar,borderRight:`1px solid ${T.border}`,
    display:'flex',flexDirection:'column',flexShrink:0,height:'100vh',position:'sticky',top:0}}>
    <div style={{padding:'22px 20px 18px',borderBottom:`1px solid ${T.border}`}}>
      <div style={{display:'flex',alignItems:'center',gap:10}}>
        <div style={{width:34,height:34,background:`linear-gradient(135deg,${T.accent},#d97706)`,
          borderRadius:9,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
          <Truck size={18} color="#000"/>
        </div>
        <span style={{fontSize:20,fontWeight:800,color:T.text,letterSpacing:'-0.5px'}}>FleetOS</span>
      </div>
    </div>

    <nav style={{flex:1,padding:'10px 10px',overflowY:'auto'}}>
      {NAV.filter(n=>n.roles.includes(user.role)).map(({id,icon:Icon,label})=>{
        const active=page===id;
        return (
          <button key={id} onClick={()=>setPage(id)} style={{
            width:'100%',display:'flex',alignItems:'center',gap:10,
            padding:'10px 12px',borderRadius:8,border:'none',cursor:'pointer',
            marginBottom:2,textAlign:'left',background:active?T.accentBg:'transparent',
            color:active?T.accent:T.muted,transition:'all 0.12s'}}>
            <Icon size={17}/><span style={{fontSize:14,fontWeight:active?600:400}}>{label}</span>
          </button>
        );
      })}
    </nav>

    <div style={{padding:12,borderTop:`1px solid ${T.border}`}}>
      <div style={{display:'flex',alignItems:'center',gap:10,padding:'10px 12px',
        borderRadius:8,background:T.card,marginBottom:8}}>
        <div style={{width:32,height:32,borderRadius:'50%',
          background:`linear-gradient(135deg,${ROLE_COLORS[user.role]},${T.accent})`,
          display:'flex',alignItems:'center',justifyContent:'center',
          fontSize:12,fontWeight:700,color:'#fff',flexShrink:0}}>{user.initials}</div>
        <div style={{overflow:'hidden',flex:1}}>
          <p style={{color:T.text,fontSize:13,fontWeight:600,margin:0,
            whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{user.name}</p>
          <p style={{color:T.dim,fontSize:11,margin:0}}>{ROLES[user.role]}</p>
        </div>
      </div>
      <button onClick={onLogout} style={{width:'100%',display:'flex',alignItems:'center',
        gap:8,padding:'9px 12px',background:'none',border:`1px solid ${T.border}`,
        borderRadius:8,color:T.muted,cursor:'pointer',fontSize:13}}>
        <LogOut size={15}/>Sign out
      </button>
    </div>
  </div>
);

// ── DASHBOARD ──────────────────────────────────────────────────────────
const Dashboard=({user,vehicles,schedules,users,orgs})=>{
  const mv=user.role==='super_admin'?vehicles:vehicles.filter(v=>v.orgId===user.orgId);
  const ms=user.role==='super_admin'?schedules:user.role==='driver'?schedules.filter(s=>s.userId===user.id):schedules.filter(s=>s.orgId===user.orgId);

  const statusData=[
    {name:'Available',value:mv.filter(v=>v.status==='Available').length,color:T.green},
    {name:'In Use',value:mv.filter(v=>v.status==='In Use').length,color:T.blue},
    {name:'Maintenance',value:mv.filter(v=>v.status==='Maintenance').length,color:T.red},
    {name:'Reserved',value:mv.filter(v=>v.status==='Reserved').length,color:T.amber},
  ].filter(d=>d.value>0);

  const catData=CATS.map(c=>({name:c,count:mv.filter(v=>v.cat===c).length})).filter(d=>d.count>0);
  const monthData=[{m:'Oct',b:8},{m:'Nov',b:12},{m:'Dec',b:10},{m:'Jan',b:15},{m:'Feb',b:18},{m:'Mar',b:ms.length}];
  const activeCount=ms.filter(s=>s.status==='active'||s.status==='reserved').length;

  return (
    <div style={{padding:32}}>
      <div style={{marginBottom:26}}>
        <h1 style={{color:T.text,fontSize:24,fontWeight:800,margin:'0 0 4px',letterSpacing:'-0.5px'}}>Dashboard</h1>
        <p style={{color:T.muted,fontSize:14,margin:0}}>Welcome back, {user.name.split(' ')[0]} · {new Date().toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric'})}</p>
      </div>

      {/* Stats Row */}
      <div style={{display:'flex',gap:14,marginBottom:22,flexWrap:'wrap'}}>
        <StatCard icon={Truck} label="Total Vehicles" value={mv.length} color={T.blue} sub={`${mv.filter(v=>v.status==='Available').length} available now`}/>
        <StatCard icon={Calendar} label="Active Bookings" value={activeCount} color={T.accent} sub="Current + upcoming"/>
        {user.role==='super_admin'&&<StatCard icon={Building2} label="Organizations" value={orgs.length} color={T.green} sub="All active"/>}
        <StatCard icon={Users} label="Users" value={user.role==='super_admin'?users.length:users.filter(u=>u.orgId===user.orgId).length} color={T.amber} sub="Registered"/>
      </div>

      {/* Charts Row 1 */}
      <div style={{display:'grid',gridTemplateColumns:'1.5fr 1fr',gap:14,marginBottom:14}}>
        <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:12,padding:24}}>
          <h3 style={{color:T.text,fontSize:14,fontWeight:700,margin:'0 0 18px',letterSpacing:'-0.2px'}}>Booking Trends</h3>
          <ResponsiveContainer width="100%" height={175}>
            <AreaChart data={monthData}>
              <defs>
                <linearGradient id="ag" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={T.accent} stopOpacity={0.35}/>
                  <stop offset="95%" stopColor={T.accent} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={T.border}/>
              <XAxis dataKey="m" tick={{fill:T.muted,fontSize:12}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fill:T.muted,fontSize:12}} axisLine={false} tickLine={false}/>
              <Tooltip contentStyle={{background:T.card,border:`1px solid ${T.border}`,borderRadius:8,color:T.text,fontSize:13}}/>
              <Area type="monotone" dataKey="b" stroke={T.accent} fill="url(#ag)" strokeWidth={2.5} name="Bookings"/>
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:12,padding:24}}>
          <h3 style={{color:T.text,fontSize:14,fontWeight:700,margin:'0 0 16px'}}>Vehicle Status</h3>
          <div style={{display:'flex',flexDirection:'column',alignItems:'center'}}>
            <PieChart width={140} height={140}>
              <Pie data={statusData} cx={65} cy={65} innerRadius={42} outerRadius={62} dataKey="value" paddingAngle={3}>
                {statusData.map((e,i)=><Cell key={i} fill={e.color}/>)}
              </Pie>
            </PieChart>
            <div style={{width:'100%',marginTop:8}}>
              {statusData.map(d=>(
                <div key={d.name} style={{display:'flex',justifyContent:'space-between',marginBottom:6,alignItems:'center'}}>
                  <div style={{display:'flex',alignItems:'center',gap:6}}>
                    <div style={{width:8,height:8,borderRadius:'50%',background:d.color,flexShrink:0}}/>
                    <span style={{color:T.muted,fontSize:12}}>{d.name}</span>
                  </div>
                  <span style={{color:T.text,fontSize:13,fontWeight:700}}>{d.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div style={{display:'grid',gridTemplateColumns:'1fr 1.3fr',gap:14}}>
        <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:12,padding:24}}>
          <h3 style={{color:T.text,fontSize:14,fontWeight:700,margin:'0 0 16px'}}>Vehicles by Category</h3>
          <ResponsiveContainer width="100%" height={150}>
            <BarChart data={catData} barSize={22}>
              <CartesianGrid strokeDasharray="3 3" stroke={T.border} vertical={false}/>
              <XAxis dataKey="name" tick={{fill:T.muted,fontSize:11}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fill:T.muted,fontSize:11}} axisLine={false} tickLine={false}/>
              <Tooltip contentStyle={{background:T.card,border:`1px solid ${T.border}`,borderRadius:8,color:T.text,fontSize:13}}/>
              <Bar dataKey="count" fill={T.blue} radius={[4,4,0,0]} name="Vehicles"/>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:12,padding:24}}>
          <h3 style={{color:T.text,fontSize:14,fontWeight:700,margin:'0 0 14px'}}>Recent Activity</h3>
          <div style={{display:'flex',flexDirection:'column',gap:8}}>
            {ms.slice(0,4).map(s=>{
              const v=vehicles.find(vv=>vv.id===s.vehicleId);
              return (
                <div key={s.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',
                  padding:'10px 12px',background:T.bg,borderRadius:8,border:`1px solid ${T.border}`,gap:10}}>
                  <div style={{flex:1,overflow:'hidden'}}>
                    <p style={{color:T.text,fontSize:13,fontWeight:500,margin:'0 0 2px',
                      whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{s.purpose}</p>
                    <p style={{color:T.muted,fontSize:12,margin:0}}>{v?.plate} · {s.start}</p>
                  </div>
                  <Badge label={s.status} color={sc(s.status)} bg={sb(s.status)}/>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

// ── VEHICLES ───────────────────────────────────────────────────────────
const VehiclesPage=({user,vehicles,setVehicles,orgs})=>{
  const [search,setSearch]=useState('');
  const [catF,setCatF]=useState('');
  const [statF,setStatF]=useState('');
  const [modal,setModal]=useState(null);
  const [form,setForm]=useState({});

  const mv=user.role==='super_admin'?vehicles:vehicles.filter(v=>v.orgId===user.orgId);
  const canEdit=['super_admin','org_admin','fleet_manager'].includes(user.role);

  const filtered=useMemo(()=>mv.filter(v=>{
    const s=search.toLowerCase();
    return(!s||v.name.toLowerCase().includes(s)||v.plate.toLowerCase().includes(s))&&
      (!catF||v.cat===catF)&&(!statF||v.status===statF);
  }),[mv,search,catF,statF]);

  const openAdd=()=>{
    setForm({plate:'',name:'',cat:'Sedan',orgId:user.orgId||1,status:'Available',year:String(new Date().getFullYear()),km:'0'});
    setModal('add');
  };
  const openEdit=v=>{setForm({...v,year:String(v.year),km:String(v.km)});setModal('edit');};
  const save=()=>{
    if(!form.plate||!form.name)return;
    const v={...form,year:+form.year,km:+form.km,orgId:+form.orgId};
    if(modal==='add'){setVehicles(p=>[...p,{...v,id:Date.now()}]);}
    else{setVehicles(p=>p.map(x=>x.id===form.id?v:x));}
    setModal(null);
  };
  const del=id=>setVehicles(p=>p.filter(v=>v.id!==id));

  const TH=({c})=><th style={{padding:'12px 16px',textAlign:'left',color:T.dim,fontSize:11,fontWeight:700,letterSpacing:'0.06em',whiteSpace:'nowrap'}}>{c}</th>;

  return (
    <div style={{padding:32}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:22,flexWrap:'wrap',gap:12}}>
        <div>
          <h1 style={{color:T.text,fontSize:24,fontWeight:800,margin:'0 0 4px',letterSpacing:'-0.5px'}}>Vehicles</h1>
          <p style={{color:T.muted,fontSize:14,margin:0}}>{filtered.length} of {mv.length} vehicles</p>
        </div>
        {canEdit&&<Btn onClick={openAdd}><Plus size={15}/>Add Vehicle</Btn>}
      </div>

      {/* Filters */}
      <div style={{display:'flex',gap:10,marginBottom:18,flexWrap:'wrap'}}>
        <div style={{flex:1,minWidth:200,position:'relative'}}>
          <Search size={14} style={{position:'absolute',left:11,top:'50%',transform:'translateY(-50%)',color:T.muted}}/>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search plate or name..."
            style={{width:'100%',padding:'9px 9px 9px 34px',background:T.card,border:`1px solid ${T.border}`,
              borderRadius:8,color:T.text,fontSize:13,outline:'none',boxSizing:'border-box'}}/>
        </div>
        <select value={catF} onChange={e=>setCatF(e.target.value)} style={{padding:'9px 12px',background:T.card,
          border:`1px solid ${T.border}`,borderRadius:8,color:catF?T.text:T.muted,fontSize:13,outline:'none',cursor:'pointer'}}>
          <option value="">All Categories</option>
          {CATS.map(c=><option key={c} value={c}>{c}</option>)}
        </select>
        <select value={statF} onChange={e=>setStatF(e.target.value)} style={{padding:'9px 12px',background:T.card,
          border:`1px solid ${T.border}`,borderRadius:8,color:statF?T.text:T.muted,fontSize:13,outline:'none',cursor:'pointer'}}>
          <option value="">All Statuses</option>
          {['Available','In Use','Maintenance','Reserved'].map(s=><option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:12,overflow:'auto'}}>
        <table style={{width:'100%',borderCollapse:'collapse',minWidth:700}}>
          <thead style={{borderBottom:`1px solid ${T.border}`}}>
            <tr>{['PLATE','VEHICLE','CAT','ORG','STATUS','YEAR','KM',''].map(c=><TH key={c} c={c}/>)}</tr>
          </thead>
          <tbody>
            {filtered.map((v,i)=>{
              const org=orgs.find(o=>o.id===v.orgId);
              return (
                <tr key={v.id} style={{borderBottom:i<filtered.length-1?`1px solid ${T.border}`:'none'}}
                  onMouseEnter={e=>e.currentTarget.style.background=T.cardHover}
                  onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                  <td style={{padding:'13px 16px',color:T.accent,fontSize:13,fontWeight:700,fontFamily:'monospace'}}>{v.plate}</td>
                  <td style={{padding:'13px 16px',color:T.text,fontSize:14,fontWeight:500}}>{v.name}</td>
                  <td style={{padding:'13px 16px',color:T.muted,fontSize:13}}>{v.cat}</td>
                  <td style={{padding:'13px 16px'}}><span style={{background:T.accentBg,color:T.accent,padding:'2px 8px',borderRadius:4,fontSize:12,fontWeight:600}}>{org?.code||'—'}</span></td>
                  <td style={{padding:'13px 16px'}}><Badge label={v.status} color={vc(v.status)} bg={vb(v.status)}/></td>
                  <td style={{padding:'13px 16px',color:T.muted,fontSize:13}}>{v.year}</td>
                  <td style={{padding:'13px 16px',color:T.muted,fontSize:13}}>{v.km.toLocaleString()}</td>
                  <td style={{padding:'13px 16px'}}>
                    {canEdit&&(
                      <div style={{display:'flex',gap:6}}>
                        <button onClick={()=>openEdit(v)} style={{background:T.blueBg,border:'none',color:T.blue,
                          padding:'5px 10px',borderRadius:6,cursor:'pointer',fontSize:12,display:'flex',alignItems:'center',gap:4}}>
                          <Edit2 size={12}/>Edit
                        </button>
                        <button onClick={()=>del(v.id)} style={{background:T.redBg,border:'none',color:T.red,
                          padding:'5px 8px',borderRadius:6,cursor:'pointer',display:'flex',alignItems:'center'}}>
                          <Trash2 size={13}/>
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
            {filtered.length===0&&(
              <tr><td colSpan={8} style={{padding:48,textAlign:'center',color:T.muted,fontSize:14}}>No vehicles found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {modal&&(
        <Modal title={modal==='add'?'Add Vehicle':'Edit Vehicle'} onClose={()=>setModal(null)}>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
            <Field label="Plate Number" value={form.plate} onChange={v=>setForm(f=>({...f,plate:v}))} placeholder="e.g. MCC-007"/>
            <Field label="Vehicle Name" value={form.name} onChange={v=>setForm(f=>({...f,name:v}))} placeholder="e.g. Toyota Camry"/>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
            <Field label="Category" value={form.cat} onChange={v=>setForm(f=>({...f,cat:v}))} options={CATS}/>
            <Field label="Status" value={form.status} onChange={v=>setForm(f=>({...f,status:v}))} options={['Available','In Use','Maintenance','Reserved']}/>
          </div>
          {user.role==='super_admin'&&(
            <Field label="Organization" value={form.orgId} onChange={v=>setForm(f=>({...f,orgId:v}))}
              options={orgs.map(o=>({value:o.id,label:o.name}))}/>
          )}
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
            <Field label="Year" value={form.year} onChange={v=>setForm(f=>({...f,year:v}))} type="number"/>
            <Field label="Mileage (km)" value={form.km} onChange={v=>setForm(f=>({...f,km:v}))} type="number"/>
          </div>
          <div style={{display:'flex',gap:10,justifyContent:'flex-end',marginTop:8}}>
            <Btn onClick={()=>setModal(null)} variant="secondary">Cancel</Btn>
            <Btn onClick={save} disabled={!form.plate||!form.name}><CheckCircle size={14}/>Save Vehicle</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
};

// ── SCHEDULES ──────────────────────────────────────────────────────────
const SchedulesPage=({user,schedules,setSchedules,vehicles,users})=>{
  const [modal,setModal]=useState(false);
  const [statF,setStatF]=useState('');
  const [form,setForm]=useState({vehicleId:'',userId:'',purpose:'',start:fd(now),end:fd(now)});
  const [conflict,setConflict]=useState(false);

  const ms=user.role==='super_admin'?schedules:user.role==='driver'?schedules.filter(s=>s.userId===user.id):schedules.filter(s=>s.orgId===user.orgId);
  const mv=user.role==='super_admin'?vehicles:vehicles.filter(v=>v.orgId===user.orgId);
  const mu=user.role==='super_admin'?users:users.filter(u=>u.orgId===user.orgId);
  const filtered=statF?ms.filter(s=>s.status===statF):ms;
  const canAdd=['super_admin','org_admin','fleet_manager'].includes(user.role);

  const checkConflict=(vid,start,end)=>schedules.some(s=>
    s.vehicleId===+vid&&s.status!=='cancelled'&&s.status!=='completed'&&start<=s.end&&end>=s.start);

  const upd=(field,val)=>{
    const nf={...form,[field]:val};
    setForm(nf);
    if(nf.vehicleId&&nf.start&&nf.end) setConflict(checkConflict(nf.vehicleId,nf.start,nf.end));
  };

  const save=()=>{
    if(!form.vehicleId||!form.purpose||conflict)return;
    const orgId=user.role==='super_admin'?vehicles.find(v=>v.id===+form.vehicleId)?.orgId:user.orgId;
    setSchedules(p=>[...p,{id:Date.now(),vehicleId:+form.vehicleId,
      userId:form.userId?+form.userId:user.id,orgId,purpose:form.purpose,
      start:form.start,end:form.end,status:'reserved'}]);
    setModal(false);
    setForm({vehicleId:'',userId:'',purpose:'',start:fd(now),end:fd(now)});
    setConflict(false);
  };

  const updStatus=(id,status)=>setSchedules(p=>p.map(s=>s.id===id?{...s,status}:s));

  return (
    <div style={{padding:32}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:22,flexWrap:'wrap',gap:12}}>
        <div>
          <h1 style={{color:T.text,fontSize:24,fontWeight:800,margin:'0 0 4px',letterSpacing:'-0.5px'}}>Schedules</h1>
          <p style={{color:T.muted,fontSize:14,margin:0}}>{filtered.length} bookings</p>
        </div>
        {canAdd&&<Btn onClick={()=>setModal(true)}><Plus size={15}/>New Booking</Btn>}
      </div>

      {/* Status Tabs */}
      <div style={{display:'flex',gap:6,marginBottom:20,flexWrap:'wrap'}}>
        {['',...['active','reserved','completed','cancelled']].map(s=>(
          <button key={s} onClick={()=>setStatF(s)} style={{
            padding:'7px 16px',borderRadius:20,cursor:'pointer',fontSize:13,
            border:`1px solid ${statF===s?(sc(s)||T.accent):T.border}`,fontWeight:statF===s?600:400,
            background:statF===s?(sb(s)||T.accentBg):'transparent',
            color:statF===s?(sc(s)||T.accent):T.muted,textTransform:'capitalize'}}>
            {s||'All'} {s&&`(${ms.filter(x=>x.status===s).length})`}
          </button>
        ))}
      </div>

      <div style={{display:'flex',flexDirection:'column',gap:10}}>
        {filtered.sort((a,b)=>b.start.localeCompare(a.start)).map(s=>{
          const v=vehicles.find(vv=>vv.id===s.vehicleId);
          const u=users.find(uu=>uu.id===s.userId);
          const canManage=user.role!=='driver';
          return (
            <div key={s.id} style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:12,
              padding:20,display:'flex',justifyContent:'space-between',alignItems:'center',gap:16,flexWrap:'wrap'}}>
              <div style={{flex:1,minWidth:200}}>
                <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:6}}>
                  <Badge label={s.status} color={sc(s.status)} bg={sb(s.status)}/>
                  <span style={{color:T.dim,fontSize:11}}>ID #{s.id}</span>
                </div>
                <p style={{color:T.text,fontSize:15,fontWeight:600,margin:'0 0 6px'}}>{s.purpose}</p>
                <div style={{display:'flex',gap:14,flexWrap:'wrap'}}>
                  <span style={{color:T.muted,fontSize:12}}>🚗 {v?.name||'Unknown'} · <span style={{color:T.accent,fontFamily:'monospace'}}>{v?.plate}</span></span>
                  <span style={{color:T.muted,fontSize:12}}>👤 {u?.name||'Unknown'}</span>
                  <span style={{color:T.muted,fontSize:12}}>📅 {s.start} → {s.end}</span>
                </div>
              </div>
              {canManage&&(
                <div style={{display:'flex',gap:8,flexShrink:0}}>
                  {s.status==='reserved'&&<>
                    <Btn onClick={()=>updStatus(s.id,'active')} small variant="secondary"><Activity size={12}/>Activate</Btn>
                    <Btn onClick={()=>updStatus(s.id,'cancelled')} small variant="danger"><X size={12}/>Cancel</Btn>
                  </>}
                  {s.status==='active'&&<Btn onClick={()=>updStatus(s.id,'completed')} small><CheckCircle size={12}/>Complete</Btn>}
                </div>
              )}
            </div>
          );
        })}
        {filtered.length===0&&(
          <div style={{padding:56,textAlign:'center',color:T.muted,background:T.card,
            borderRadius:12,border:`1px solid ${T.border}`,fontSize:14}}>No schedules found</div>
        )}
      </div>

      {modal&&(
        <Modal title="Create New Booking" onClose={()=>{setModal(false);setConflict(false);}}>
          <Field label="Vehicle" value={form.vehicleId} onChange={v=>upd('vehicleId',v)}
            options={[{value:'',label:'— Select vehicle —'},...mv.filter(v=>v.status==='Available'||v.status==='Reserved').map(v=>({value:v.id,label:`${v.name} (${v.plate})`}))]}/>
          <Field label="Purpose / Trip Description" value={form.purpose} onChange={v=>upd('purpose',v)} placeholder="e.g. Field inspection - South District"/>
          <Field label="Assign To" value={form.userId} onChange={v=>upd('userId',v)}
            options={[{value:'',label:`Self (${user.name})`},...mu.filter(u=>u.id!==user.id).map(u=>({value:u.id,label:`${u.name} — ${ROLES[u.role]}`}))]}/>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
            <Field label="Start Date" value={form.start} onChange={v=>upd('start',v)} type="date"/>
            <Field label="End Date" value={form.end} onChange={v=>upd('end',v)} type="date"/>
          </div>
          {conflict&&(
            <div style={{background:T.redBg,border:`1px solid ${T.red}33`,borderRadius:8,
              padding:'10px 14px',marginBottom:12,color:T.red,fontSize:13,display:'flex',alignItems:'center',gap:8}}>
              <AlertCircle size={15}/> Scheduling conflict: vehicle already booked for these dates.
            </div>
          )}
          <div style={{display:'flex',gap:10,justifyContent:'flex-end'}}>
            <Btn onClick={()=>setModal(false)} variant="secondary">Cancel</Btn>
            <Btn onClick={save} disabled={!form.vehicleId||!form.purpose||conflict}><CheckCircle size={14}/>Confirm Booking</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
};

// ── ORGANIZATIONS ──────────────────────────────────────────────────────
const OrgsPage=({user,orgs,setOrgs,vehicles,users})=>{
  const [modal,setModal]=useState(null);
  const [form,setForm]=useState({name:'',code:'',status:'active'});
  const save=()=>{
    if(!form.name||!form.code)return;
    if(modal==='add')setOrgs(p=>[...p,{...form,id:Date.now(),createdAt:fd(now)}]);
    else setOrgs(p=>p.map(o=>o.id===form.id?form:o));
    setModal(null);
  };
  const del=id=>setOrgs(p=>p.filter(o=>o.id!==id));

  return (
    <div style={{padding:32}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:24,flexWrap:'wrap',gap:12}}>
        <div>
          <h1 style={{color:T.text,fontSize:24,fontWeight:800,margin:'0 0 4px',letterSpacing:'-0.5px'}}>Organizations</h1>
          <p style={{color:T.muted,fontSize:14,margin:0}}>{orgs.length} organizations in system</p>
        </div>
        <Btn onClick={()=>{setForm({name:'',code:'',status:'active'});setModal('add');}}><Plus size={15}/>Add Organization</Btn>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(290px,1fr))',gap:16}}>
        {orgs.map(o=>{
          const vc2=vehicles.filter(v=>v.orgId===o.id).length;
          const uc=users.filter(u=>u.orgId===o.id).length;
          const avail=vehicles.filter(v=>v.orgId===o.id&&v.status==='Available').length;
          return (
            <div key={o.id} style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:12,padding:24}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:18}}>
                <div style={{width:46,height:46,background:T.accentBg,borderRadius:11,
                  display:'flex',alignItems:'center',justifyContent:'center',
                  color:T.accent,fontSize:15,fontWeight:800,letterSpacing:'-0.5px'}}>{o.code}</div>
                <Badge label={o.status} color={o.status==='active'?T.green:T.red} bg={o.status==='active'?T.greenBg:T.redBg}/>
              </div>
              <h3 style={{color:T.text,fontSize:16,fontWeight:700,margin:'0 0 4px'}}>{o.name}</h3>
              <p style={{color:T.dim,fontSize:12,margin:'0 0 18px'}}>Since {o.createdAt}</p>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:8,marginBottom:18,
                background:T.bg,borderRadius:8,padding:12}}>
                {[['Vehicles',vc2,T.blue],['Available',avail,T.green],['Users',uc,T.amber]].map(([l,v,c])=>(
                  <div key={l} style={{textAlign:'center'}}>
                    <p style={{color:c,fontSize:20,fontWeight:800,margin:'0 0 2px'}}>{v}</p>
                    <p style={{color:T.dim,fontSize:11,margin:0}}>{l}</p>
                  </div>
                ))}
              </div>
              <div style={{display:'flex',gap:8}}>
                <button onClick={()=>{setForm({...o});setModal('edit');}} style={{flex:1,padding:'8px',
                  background:T.blueBg,border:'none',color:T.blue,borderRadius:7,cursor:'pointer',
                  fontSize:13,display:'flex',alignItems:'center',justifyContent:'center',gap:5,fontWeight:500}}>
                  <Edit2 size={13}/>Edit
                </button>
                <button onClick={()=>del(o.id)} style={{padding:'8px 12px',background:T.redBg,border:'none',
                  color:T.red,borderRadius:7,cursor:'pointer',display:'flex',alignItems:'center'}}>
                  <Trash2 size={14}/>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {modal&&(
        <Modal title={modal==='add'?'Add Organization':'Edit Organization'} onClose={()=>setModal(null)}>
          <Field label="Organization Name" value={form.name} onChange={v=>setForm(f=>({...f,name:v}))} placeholder="e.g. West Coast Authority"/>
          <Field label="Short Code" value={form.code} onChange={v=>setForm(f=>({...f,code:v.toUpperCase().slice(0,5)}))} placeholder="e.g. WCA"/>
          <Field label="Status" value={form.status} onChange={v=>setForm(f=>({...f,status:v}))} options={['active','inactive']}/>
          <div style={{display:'flex',gap:10,justifyContent:'flex-end'}}>
            <Btn onClick={()=>setModal(null)} variant="secondary">Cancel</Btn>
            <Btn onClick={save} disabled={!form.name||!form.code}><CheckCircle size={14}/>Save</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
};

// ── USERS ──────────────────────────────────────────────────────────────
const UsersPage=({user,users,setUsers,orgs})=>{
  const [modal,setModal]=useState(null);
  const [form,setForm]=useState({});
  const [search,setSearch]=useState('');

  const mu=user.role==='super_admin'?users:users.filter(u=>u.orgId===user.orgId);
  const filtered=search?mu.filter(u=>u.name.toLowerCase().includes(search.toLowerCase())||u.email.toLowerCase().includes(search.toLowerCase())):mu;

  const save=()=>{
    if(!form.name||!form.email)return;
    const initials=form.name.split(' ').map(n=>n[0]).join('').toUpperCase().slice(0,2);
    if(modal==='add')setUsers(p=>[...p,{...form,id:Date.now(),initials}]);
    else setUsers(p=>p.map(u=>u.id===form.id?{...form,initials}:u));
    setModal(null);
  };
  const del=id=>{if(id===user.id)return;setUsers(p=>p.filter(u=>u.id!==id));};

  const TH=({c})=><th style={{padding:'12px 16px',textAlign:'left',color:T.dim,fontSize:11,fontWeight:700,letterSpacing:'0.06em'}}>{c}</th>;

  return (
    <div style={{padding:32}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:22,flexWrap:'wrap',gap:12}}>
        <div>
          <h1 style={{color:T.text,fontSize:24,fontWeight:800,margin:'0 0 4px',letterSpacing:'-0.5px'}}>Users</h1>
          <p style={{color:T.muted,fontSize:14,margin:0}}>{filtered.length} users</p>
        </div>
        <Btn onClick={()=>{setForm({name:'',email:'',pass:'password',role:'driver',orgId:user.orgId||1});setModal('add');}}><Plus size={15}/>Add User</Btn>
      </div>

      <div style={{position:'relative',marginBottom:18,maxWidth:320}}>
        <Search size={14} style={{position:'absolute',left:11,top:'50%',transform:'translateY(-50%)',color:T.muted}}/>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search name or email..."
          style={{width:'100%',padding:'9px 9px 9px 34px',background:T.card,border:`1px solid ${T.border}`,
            borderRadius:8,color:T.text,fontSize:13,outline:'none',boxSizing:'border-box'}}/>
      </div>

      <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:12,overflow:'auto'}}>
        <table style={{width:'100%',borderCollapse:'collapse',minWidth:600}}>
          <thead style={{borderBottom:`1px solid ${T.border}`}}>
            <tr>{['USER','EMAIL','ROLE','ORGANIZATION',''].map(c=><TH key={c} c={c}/>)}</tr>
          </thead>
          <tbody>
            {filtered.map((u,i)=>{
              const org=orgs.find(o=>o.id===u.orgId);
              const rc=ROLE_COLORS[u.role]||T.muted;
              return (
                <tr key={u.id} style={{borderBottom:i<filtered.length-1?`1px solid ${T.border}`:'none'}}
                  onMouseEnter={e=>e.currentTarget.style.background=T.cardHover}
                  onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                  <td style={{padding:'13px 16px'}}>
                    <div style={{display:'flex',alignItems:'center',gap:10}}>
                      <div style={{width:34,height:34,borderRadius:'50%',background:`${rc}18`,
                        border:`2px solid ${rc}33`,display:'flex',alignItems:'center',justifyContent:'center',
                        color:rc,fontSize:12,fontWeight:700,flexShrink:0}}>{u.initials}</div>
                      <div>
                        <p style={{color:T.text,fontSize:14,fontWeight:600,margin:0}}>{u.name}</p>
                        {u.id===user.id&&<span style={{color:T.accent,fontSize:11,fontWeight:500}}>● You</span>}
                      </div>
                    </div>
                  </td>
                  <td style={{padding:'13px 16px',color:T.muted,fontSize:13}}>{u.email}</td>
                  <td style={{padding:'13px 16px'}}><Badge label={ROLES[u.role]} color={rc} bg={`${rc}14`}/></td>
                  <td style={{padding:'13px 16px',color:T.muted,fontSize:13}}>{org?.name||<span style={{color:T.dim,fontStyle:'italic'}}>Platform</span>}</td>
                  <td style={{padding:'13px 16px'}}>
                    <div style={{display:'flex',gap:6}}>
                      <button onClick={()=>{setForm({...u});setModal('edit');}} style={{background:T.blueBg,border:'none',
                        color:T.blue,padding:'5px 10px',borderRadius:6,cursor:'pointer',fontSize:12,
                        display:'flex',alignItems:'center',gap:4}}>
                        <Edit2 size={12}/>Edit
                      </button>
                      {u.id!==user.id&&(
                        <button onClick={()=>del(u.id)} style={{background:T.redBg,border:'none',color:T.red,
                          padding:'5px 8px',borderRadius:6,cursor:'pointer',display:'flex',alignItems:'center'}}>
                          <Trash2 size={13}/>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {modal&&(
        <Modal title={modal==='add'?'Add User':'Edit User'} onClose={()=>setModal(null)}>
          <Field label="Full Name" value={form.name} onChange={v=>setForm(f=>({...f,name:v}))} placeholder="e.g. John Smith"/>
          <Field label="Email Address" value={form.email} onChange={v=>setForm(f=>({...f,email:v}))} type="email"/>
          <Field label="Password" value={form.pass} onChange={v=>setForm(f=>({...f,pass:v}))} type="password"/>
          <Field label="Role" value={form.role} onChange={v=>setForm(f=>({...f,role:v}))}
            options={Object.entries(ROLES).filter(([k])=>user.role==='super_admin'||k!=='super_admin').map(([value,label])=>({value,label}))}/>
          {user.role==='super_admin'&&(
            <Field label="Organization" value={form.orgId||''} onChange={v=>setForm(f=>({...f,orgId:+v||null}))}
              options={[{value:'',label:'None (Platform Admin)'},...orgs.map(o=>({value:o.id,label:o.name}))]}/>
          )}
          <div style={{display:'flex',gap:10,justifyContent:'flex-end'}}>
            <Btn onClick={()=>setModal(null)} variant="secondary">Cancel</Btn>
            <Btn onClick={save} disabled={!form.name||!form.email}><CheckCircle size={14}/>Save User</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
};

// ── REPORTS ────────────────────────────────────────────────────────────
const ReportsPage=({user,vehicles,schedules,orgs})=>{
  const mv=user.role==='super_admin'?vehicles:vehicles.filter(v=>v.orgId===user.orgId);
  const ms=user.role==='super_admin'?schedules:schedules.filter(s=>s.orgId===user.orgId);

  const utilData=CATS.map(cat=>{
    const total=mv.filter(v=>v.cat===cat).length;
    const used=mv.filter(v=>v.cat===cat&&(v.status==='In Use'||v.status==='Reserved')).length;
    return {cat,total,used,pct:total?Math.round(used/total*100):0};
  }).filter(d=>d.total>0);

  const statusDist=[
    {s:'Available',count:mv.filter(v=>v.status==='Available').length,color:T.green},
    {s:'In Use',count:mv.filter(v=>v.status==='In Use').length,color:T.blue},
    {s:'Maintenance',count:mv.filter(v=>v.status==='Maintenance').length,color:T.red},
    {s:'Reserved',count:mv.filter(v=>v.status==='Reserved').length,color:T.amber},
  ];

  const orgData=user.role==='super_admin'?orgs.map(o=>({
    org:o.code,
    vehicles:vehicles.filter(v=>v.orgId===o.id).length,
    active:schedules.filter(s=>s.orgId===o.id&&(s.status==='active'||s.status==='reserved')).length,
    completed:schedules.filter(s=>s.orgId===o.id&&s.status==='completed').length,
  })):[];

  const completed=ms.filter(s=>s.status==='completed').length;
  const utilPct=mv.length?Math.round(mv.filter(v=>v.status==='In Use'||v.status==='Reserved').length/mv.length*100):0;

  return (
    <div style={{padding:32}}>
      <div style={{marginBottom:26}}>
        <h1 style={{color:T.text,fontSize:24,fontWeight:800,margin:'0 0 4px',letterSpacing:'-0.5px'}}>Reports</h1>
        <p style={{color:T.muted,fontSize:14,margin:0}}>Fleet performance analytics</p>
      </div>

      <div style={{display:'flex',gap:14,marginBottom:22,flexWrap:'wrap'}}>
        <StatCard icon={TrendingUp} label="Fleet Utilization" value={`${utilPct}%`} color={T.blue} sub="In use or reserved"/>
        <StatCard icon={CheckCircle} label="Completed Trips" value={completed} color={T.green} sub={`of ${ms.length} total`}/>
        <StatCard icon={AlertCircle} label="In Maintenance" value={mv.filter(v=>v.status==='Maintenance').length} color={T.red} sub="Currently unavailable"/>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14,marginBottom:14}}>
        {/* Utilization by category */}
        <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:12,padding:24}}>
          <h3 style={{color:T.text,fontSize:14,fontWeight:700,margin:'0 0 18px'}}>Utilization by Category</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={utilData}>
              <CartesianGrid strokeDasharray="3 3" stroke={T.border} vertical={false}/>
              <XAxis dataKey="cat" tick={{fill:T.muted,fontSize:12}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fill:T.muted,fontSize:12}} axisLine={false} tickLine={false} domain={[0,100]} unit="%"/>
              <Tooltip contentStyle={{background:T.card,border:`1px solid ${T.border}`,borderRadius:8,color:T.text,fontSize:13}}
                formatter={v=>[`${v}%`,'Utilization']}/>
              <Bar dataKey="pct" fill={T.accent} radius={[4,4,0,0]} barSize={26} name="Utilization %"/>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Status distribution */}
        <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:12,padding:24}}>
          <h3 style={{color:T.text,fontSize:14,fontWeight:700,margin:'0 0 20px'}}>Fleet Status Breakdown</h3>
          <div style={{display:'flex',flexDirection:'column',gap:14}}>
            {statusDist.map(d=>(
              <div key={d.s}>
                <div style={{display:'flex',justifyContent:'space-between',marginBottom:6}}>
                  <span style={{color:T.muted,fontSize:13}}>{d.s}</span>
                  <span style={{color:T.text,fontSize:13,fontWeight:700}}>{d.count} <span style={{color:T.dim,fontWeight:400}}>vehicles</span></span>
                </div>
                <div style={{height:7,background:T.bg,borderRadius:4,overflow:'hidden'}}>
                  <div style={{height:'100%',background:d.color,borderRadius:4,
                    width:`${mv.length?d.count/mv.length*100:0}%`,transition:'width 0.5s'}}/>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Org comparison — super admin */}
      {user.role==='super_admin'&&(
        <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:12,padding:24}}>
          <h3 style={{color:T.text,fontSize:14,fontWeight:700,margin:'0 0 18px'}}>Organization Comparison</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={orgData} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke={T.border} vertical={false}/>
              <XAxis dataKey="org" tick={{fill:T.muted,fontSize:13}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fill:T.muted,fontSize:12}} axisLine={false} tickLine={false}/>
              <Tooltip contentStyle={{background:T.card,border:`1px solid ${T.border}`,borderRadius:8,color:T.text,fontSize:13}}/>
              <Bar dataKey="vehicles" fill={T.blue} radius={[4,4,0,0]} barSize={24} name="Vehicles"/>
              <Bar dataKey="active" fill={T.accent} radius={[4,4,0,0]} barSize={24} name="Active/Reserved"/>
              <Bar dataKey="completed" fill={T.green} radius={[4,4,0,0]} barSize={24} name="Completed"/>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

// ── TOPBAR ─────────────────────────────────────────────────────────────
const TopBar=({page,user})=>{
  const titles={dashboard:'Dashboard',vehicles:'Vehicles',schedules:'Schedules',organizations:'Organizations',users:'Users',reports:'Reports'};
  return (
    <div style={{height:60,borderBottom:`1px solid ${T.border}`,display:'flex',alignItems:'center',
      justifyContent:'space-between',padding:'0 32px',background:T.bg,position:'sticky',top:0,zIndex:10}}>
      <div style={{display:'flex',alignItems:'center',gap:8}}>
        <span style={{color:T.dim,fontSize:13}}>FleetOS</span>
        <span style={{color:T.border}}>›</span>
        <span style={{color:T.text,fontSize:13,fontWeight:600}}>{titles[page]}</span>
      </div>
      <div style={{display:'flex',alignItems:'center',gap:12}}>
        <div style={{background:T.greenBg,color:T.green,padding:'3px 10px',borderRadius:20,fontSize:12,fontWeight:500,border:`1px solid ${T.green}33`}}>
          ● System Online
        </div>
        <button style={{background:'none',border:`1px solid ${T.border}`,color:T.muted,
          borderRadius:8,padding:'6px 8px',cursor:'pointer',display:'flex',alignItems:'center'}}>
          <Bell size={16}/>
        </button>
        <div style={{display:'flex',alignItems:'center',gap:8,padding:'5px 12px',
          background:T.card,border:`1px solid ${T.border}`,borderRadius:8}}>
          <div style={{width:24,height:24,borderRadius:'50%',
            background:`linear-gradient(135deg,${ROLE_COLORS[user.role]},${T.accent})`,
            display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,fontWeight:700,color:'#fff'}}>
            {user.initials}
          </div>
          <span style={{color:T.text,fontSize:13,fontWeight:500}}>{user.name.split(' ')[0]}</span>
        </div>
      </div>
    </div>
  );
};

// ── APP ────────────────────────────────────────────────────────────────
export default function FleetApp(){
  useEffect(()=>{
    const l=document.createElement('link');
    l.href='https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap';
    l.rel='stylesheet';
    document.head.appendChild(l);
  },[]);

  const [currentUser,setCurrentUser]=useState(null);
  const [page,setPage]=useState('dashboard');
  const [orgs,setOrgs]=useState(ORGS0);
  const [vehicles,setVehicles]=useState(VEHICLES0);
  const [schedules,setSchedules]=useState(SCHEDULES0);
  const [users,setUsers]=useState(USERS0);

  if(!currentUser) return <LoginScreen onLogin={u=>{setCurrentUser(u);setPage('dashboard');}}/>;

  const props={user:currentUser,orgs,vehicles,schedules,users,setOrgs,setVehicles,setSchedules,setUsers};

  const PAGES={
    dashboard:<Dashboard {...props}/>,
    vehicles:<VehiclesPage {...props}/>,
    schedules:<SchedulesPage {...props}/>,
    organizations:<OrgsPage {...props}/>,
    users:<UsersPage {...props}/>,
    reports:<ReportsPage {...props}/>,
  };

  return (
    <div style={{display:'flex',height:'100vh',background:T.bg,fontFamily:'"Outfit",system-ui,sans-serif',color:T.text,overflow:'hidden'}}>
      <Sidebar user={currentUser} page={page} setPage={setPage} onLogout={()=>setCurrentUser(null)}/>
      <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}>
        <TopBar page={page} user={currentUser}/>
        <main style={{flex:1,overflowY:'auto'}}>
          {PAGES[page]||PAGES.dashboard}
        </main>
      </div>
    </div>
  );
}
