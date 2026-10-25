'use client'

import { useState } from 'react'
import {
  Activity, AlertTriangle, ArrowDownRight, ArrowUpRight, Bell, Building2, CalendarDays,
  ChevronDown, ClipboardCheck, Cloud, Compass, Download, FileBarChart, Filter, Gauge,
  HardHat, LayoutDashboard, Map, MoreHorizontal, Plus, Search, Settings, ShieldCheck,
  SlidersHorizontal, Users, Wrench, X, Menu, CircleHelp, CheckCircle2, Clock3,
} from 'lucide-react'
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

const activity = [
  { month: 'Jan', inspections: 18 }, { month: 'Feb', inspections: 24 }, { month: 'Mar', inspections: 21 },
  { month: 'Apr', inspections: 32 }, { month: 'May', inspections: 28 }, { month: 'Jun', inspections: 38 },
  { month: 'Jul', inspections: 34 }, { month: 'Aug', inspections: 46 }, { month: 'Sep', inspections: 42 },
]
const inspections = [
  { id: 'INSP-0248', asset: 'North River Bridge', type: 'Bridge', location: 'Riverside District', date: 'Sep 24, 2024', findings: 4, severity: 'Moderate', status: 'Pending review', initials: 'JO' },
  { id: 'INSP-0247', asset: 'Harbor Tunnel', type: 'Tunnel', location: 'Port Authority', date: 'Sep 22, 2024', findings: 2, severity: 'Minor', status: 'Completed', initials: 'MK' },
  { id: 'INSP-0246', asset: 'Eastside Overpass', type: 'Bridge', location: 'Eastside', date: 'Sep 20, 2024', findings: 7, severity: 'Severe', status: 'Pending review', initials: 'AR' },
  { id: 'INSP-0245', asset: 'Civic Center Plaza', type: 'Building', location: 'Central District', date: 'Sep 18, 2024', findings: 1, severity: 'Minor', status: 'Completed', initials: 'SL' },
]
const navGroups = [
  { label: 'OVERVIEW', items: [{ label: 'Dashboard', icon: LayoutDashboard }, { label: 'Infrastructure Map', icon: Map }] },
  { label: 'INSPECTIONS', items: [{ label: 'All Inspections', icon: ClipboardCheck }, { label: 'New Inspection', icon: Plus }, { label: 'Analysis Results', icon: Activity }, { label: 'Historical Comparison', icon: Compass }] },
  { label: 'INFRASTRUCTURE', items: [{ label: 'Assets', icon: Building2 }, { label: 'Maintenance & Work Orders', icon: Wrench }] },
  { label: 'INTELLIGENCE', items: [{ label: 'Damage Analytics', icon: Gauge }, { label: 'Model Performance', icon: ShieldCheck }, { label: 'Reports', icon: FileBarChart }] },
]

function Logo() { return <div className="logo-mark"><span /><span /><span /></div> }
function Severity({ children }: { children: string }) { return <span className={`severity severity-${children.toLowerCase().replace(' ', '-')}`}><i />{children}</span> }
function StatCard({ label, value, change, icon: Icon, tone = 'blue' }: { label: string; value: string; change: string; icon: any; tone?: string }) {
  return <div className="stat-card"><div className={`stat-icon ${tone}`}><Icon /></div><div className="stat-copy"><p>{label}</p><strong>{value}</strong><span className={change.startsWith('+') ? 'positive' : 'neutral'}>{change}</span></div></div>
}

export default function Page() {
  const [active, setActive] = useState('Dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [showNotifications, setShowNotifications] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const filtered = inspections.filter((item) => `${item.id} ${item.asset} ${item.location}`.toLowerCase().includes(search.toLowerCase()))
  return <div className="app-shell">
    <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
      <div className="brand"><Logo /><div><b>InfraScan</b><small>Infrastructure Intelligence</small></div><button className="mobile-close" onClick={() => setSidebarOpen(false)} aria-label="Close navigation"><X /></button></div>
      <nav>{navGroups.map((group) => <div className="nav-group" key={group.label}><p>{group.label}</p>{group.items.map(({ label, icon: Icon }) => <button key={label} className={active === label ? 'nav-item active' : 'nav-item'} onClick={() => { setActive(label); setSidebarOpen(false) }}><Icon /> <span>{label}</span>{label === 'New Inspection' && <kbd>⌘ N</kbd>}</button>)}</div>)}</nav>
      <div className="sidebar-bottom"><button className="nav-item"><Settings /><span>Settings</span></button><div className="status-card"><span className="pulse" /><div><b>All systems operational</b><small>Last synced just now</small></div></div><div className="profile"><div className="avatar">JS</div><div><b>Jordan Smith</b><small>Infrastructure Manager</small></div><ChevronDown /></div></div>
    </aside>
    {sidebarOpen && <button className="scrim" onClick={() => setSidebarOpen(false)} aria-label="Close navigation" />}
    <main className="main-content">
      <header className="topbar"><button className="menu-button" onClick={() => setSidebarOpen(true)} aria-label="Open navigation"><Menu /></button><div className="breadcrumbs"><span>Workspace</span><b>/</b><strong>{active}</strong></div><div className="top-actions"><label className="search"><Search /><input placeholder="Search anything..." value={search} onChange={(e) => setSearch(e.target.value)} /><kbd>⌘ K</kbd></label><button className="icon-button" onClick={() => setShowNotifications(!showNotifications)} aria-label="Notifications"><Bell /><em>3</em></button><button className="help"><CircleHelp /> Help</button><div className="top-avatar">JS</div></div>{showNotifications && <div className="notification-pop"><b>Notifications</b><span className="unread">3 unread</span><div><AlertTriangle /><p><strong>Severe finding requires review</strong><small>Eastside Overpass · 18 min ago</small></p></div><div><ClipboardCheck /><p><strong>Inspection completed</strong><small>Harbor Tunnel · 2 hours ago</small></p></div><button>View all notifications</button></div>}</header>
      <div className="page-wrap">
        <section className="page-heading"><div><p className="eyebrow">TUESDAY, SEPTEMBER 24, 2024</p><h1>Infrastructure Overview</h1><p>Monitor asset condition and inspection activity across your network.</p></div><div className="heading-actions"><button className="button secondary"><Download /> Export summary</button><button className="button primary" onClick={() => setShowNew(true)}><Plus /> New inspection</button></div></section>
        <div className="context-bar"><div className="range"><CalendarDays /><span>Last 30 days</span><ChevronDown /></div><span className="sample-note"><Cloud /> Sample workspace data</span></div>
        <section className="stats-grid"><StatCard label="Infrastructure assets" value="248" change="+12 this quarter" icon={Building2} /><StatCard label="Total inspections" value="1,284" change="+8.4% vs last period" icon={ClipboardCheck} tone="teal" /><StatCard label="Pending review" value="18" change="Needs attention" icon={Clock3} tone="amber" /><StatCard label="High-priority findings" value="7" change="-2 vs last period" icon={AlertTriangle} tone="red" /></section>
        <section className="dashboard-grid"><div className="panel activity-panel"><div className="panel-head"><div><h2>Inspection activity</h2><p>Completed inspections over time</p></div><button className="more-button"><MoreHorizontal /></button></div><div className="chart-legend"><span><i className="legend-blue" /> Inspections</span><span className="trend"><ArrowUpRight /> 12.8%</span></div><div className="chart"><ResponsiveContainer width="100%" height="100%"><AreaChart data={activity} margin={{ top: 12, right: 8, left: -24, bottom: 0 }}><defs><linearGradient id="fillBlue" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#2563eb" stopOpacity={0.16} /><stop offset="100%" stopColor="#2563eb" stopOpacity={0} /></linearGradient></defs><CartesianGrid vertical={false} stroke="#e8eef5" /><XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#8a9ab1', fontSize: 11 }} /><YAxis axisLine={false} tickLine={false} tick={{ fill: '#8a9ab1', fontSize: 11 }} /><Tooltip contentStyle={{ border: '1px solid #dce5ef', borderRadius: 10, boxShadow: '0 8px 24px #172b4d18' }} /><Area type="monotone" dataKey="inspections" stroke="#2563eb" strokeWidth={2.5} fill="url(#fillBlue)" /></AreaChart></ResponsiveContainer></div></div><div className="panel severity-panel"><div className="panel-head"><div><h2>Damage severity</h2><p>Findings by assessment</p></div><button className="more-button"><MoreHorizontal /></button></div><div className="donut-wrap"><div className="donut"><div><strong>248</strong><small>Total findings</small></div></div><div className="severity-list"><div><i className="dot critical" /><span>Critical</span><b>7</b></div><div><i className="dot severe" /><span>Severe</span><b>24</b></div><div><i className="dot moderate" /><span>Moderate</span><b>86</b></div><div><i className="dot minor" /><span>Minor</span><b>131</b></div></div></div></div></section>
        <section className="lower-grid"><div className="panel table-panel"><div className="panel-head table-head"><div><h2>Recent inspections</h2><p>Latest activity across your infrastructure</p></div><button className="text-button" onClick={() => setActive('All Inspections')}>View all <ArrowUpRight /></button></div><div className="table-tools"><label className="table-search"><Search /><input placeholder="Search inspections" value={search} onChange={(e) => setSearch(e.target.value)} /></label><button className="filter-button"><Filter /> Filters <span>2</span></button></div><div className="table-scroll"><table><thead><tr><th>Inspection</th><th>Asset</th><th>Date</th><th>Findings</th><th>Severity</th><th>Status</th><th /></tr></thead><tbody>{filtered.map((item) => <tr key={item.id}><td><b>{item.id}</b><small>{item.type}</small></td><td><strong>{item.asset}</strong><small>{item.location}</small></td><td>{item.date}</td><td><span className="finding-count">{item.findings}</span></td><td><Severity>{item.severity}</Severity></td><td><span className={`status ${item.status === 'Completed' ? 'complete' : 'review'}`}><i />{item.status}</span></td><td><button className="more-button"><MoreHorizontal /></button></td></tr>)}</tbody></table></div></div><div className="side-stack"><div className="panel attention-panel"><div className="panel-head"><div><h2>Needs attention</h2><p>Prioritized for your review</p></div><button className="more-button"><MoreHorizontal /></button></div><div className="attention-item"><div className="attention-icon red"><AlertTriangle /></div><div><strong>Eastside Overpass</strong><p>7 findings · Severe</p></div><ArrowUpRight /></div><div className="attention-item"><div className="attention-icon amber"><Clock3 /></div><div><strong>North River Bridge</strong><p>Pending engineer review</p></div><ArrowUpRight /></div><button className="outline-button" onClick={() => setActive('Maintenance & Work Orders')}>Open review queue</button></div><div className="panel schedule-panel"><div className="panel-head"><div><h2>Upcoming schedule</h2><p>Next 7 days</p></div><CalendarDays /></div><div className="schedule-row"><div className="date-box"><b>26</b><small>SEP</small></div><div><strong>Westside Retaining Wall</strong><p>Routine inspection · 09:30</p></div><span className="mini-avatar">AR</span></div><div className="schedule-row"><div className="date-box"><b>28</b><small>SEP</small></div><div><strong>Central Water Facility</strong><p>Follow-up inspection · 14:00</p></div><span className="mini-avatar teal-avatar">MK</span></div></div></div></section>
      </div>
    </main>
    {showNew && <div className="modal-layer" role="dialog" aria-modal="true"><div className="modal"><button className="modal-close" onClick={() => setShowNew(false)} aria-label="Close"><X /></button><div className="modal-icon"><ClipboardCheck /></div><h2>Start a new inspection</h2><p>Choose an existing infrastructure asset to begin. You can add inspection details and upload images in the next step.</p><label className="modal-label">Select infrastructure asset<select><option>North River Bridge · BRG-0048</option><option>Harbor Tunnel · TUN-0012</option><option>Eastside Overpass · BRG-0031</option></select></label><button className="button primary full" onClick={() => setShowNew(false)}>Continue to inspection details <ArrowUpRight /></button></div></div>}
  </div>
}
