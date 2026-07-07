import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  LineChart, Line, Area, AreaChart,
} from 'recharts';
import { getStats, getComplaints, updateStatus } from '../api/complaints';
import { useAuth } from '../contexts/AuthContext';
import { notify } from '../components/Toast';
import './Dashboard.css';

/* ── Constants ── */
const CATEGORY_ICONS = {
  Pothole: '🚧', 'Water Supply': '💧', Streetlight: '💡', Garbage: '🗑️', Electricity: '⚡',
};
const PRIORITY_COLORS = {
  Critical: '#F87171', High: '#FB923C', Medium: '#FACC15', Low: '#4ADE80',
};
const CATEGORY_COLORS = ['#6366F1', '#8B5CF6', '#EC4899', '#14B8A6', '#F59E0B'];
const PRIORITY_ORDER = ['Critical', 'High', 'Medium', 'Low'];
const STATUSES = ['Pending', 'In Progress', 'Resolved'];

const DB_PRIORITY_CLASS = {
  Critical: 'db-badge-critical', High: 'db-badge-high',
  Medium: 'db-badge-medium', Low: 'db-badge-low',
};
const DB_STATUS_CLASS = {
  Pending: 'db-badge-pending', 'In Progress': 'db-badge-inprogress', Resolved: 'db-badge-resolved',
};

/* ── Chart tooltip ── */
const DarkTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: '#1E293B', border: '1px solid rgba(99,102,241,0.25)',
      borderRadius: 10, padding: '10px 14px', fontSize: '0.78rem',
      boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
    }}>
      <div style={{ fontWeight: 700, marginBottom: 4, color: '#E2E8F0' }}>
        {label || payload[0].name}
      </div>
      <div style={{ color: '#94A3B8' }}>
        Count: <strong style={{ color: '#A78BFA' }}>{payload[0].value}</strong>
      </div>
    </div>
  );
};

/* ── AI Insight messages ── */
const INSIGHTS = [
  { text: <>Complaint volume <span>peaked on weekdays</span> — consider increasing field staff Monday–Friday.</>, icon: '📈' },
  { text: <>Water Supply issues have a <span>72h average resolution time</span> — faster than last month.</>, icon: '💧' },
  { text: <><span>Pothole reports</span> are highest in Zone 3 — maintenance crew dispatch recommended.</>, icon: '🚧' },
  { text: <>Resolution rate improved by <span>14%</span> this period compared to last month.</>, icon: '✅' },
];

/* ── Animated Number ── */
function AnimatedNumber({ value }) {
  const [count, setCount] = useState(0);
  const rafRef = useRef(null);

  useEffect(() => {
    if (typeof value !== 'number') {
      setCount(value);
      return;
    }
    let startTime = null;
    const duration = 2000;
    
    const tick = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * value));
      if (progress < 1) rafRef.current = requestAnimationFrame(tick);
    };
    
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [value]);

  return typeof value === 'number' ? count.toLocaleString() : count;
}

/* ── Main Component ── */
export default function Dashboard() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [allComplaints, setAllComplaints] = useState([]);
  const [filters, setFilters] = useState({ priority: '', status: '', category: '' });
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingTable, setLoadingTable] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [insightIdx, setInsightIdx] = useState(0);
  const [activeNav, setActiveNav] = useState('dashboard');
  const scrollRef = useRef(null);

  // Reset scroll position to top when changing views
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [activeNav]);

  // Prevent any body-level scrolling globally while on the dashboard
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  // Cycle AI insights
  useEffect(() => {
    const t = setInterval(() => setInsightIdx(i => (i + 1) % INSIGHTS.length), 3500);
    return () => clearInterval(t);
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const res = await getStats();
      setStats(res.data.data);
    } catch { notify('Failed to load stats', 'error'); }
    finally { setLoadingStats(false); }
  }, []);

  const fetchComplaints = useCallback(async () => {
    setLoadingTable(true);
    try {
      const res = await getComplaints({});
      setAllComplaints(res.data.data);
    } catch { notify('Failed to load complaints', 'error'); }
    finally { setLoadingTable(false); }
  }, []);

  useEffect(() => { fetchStats(); }, [fetchStats]);
  useEffect(() => { fetchComplaints(); }, [fetchComplaints]);

  // Client-side filtering — instant, no API lag
  const complaints = useMemo(() => {
    let list = allComplaints;
    if (filters.priority) list = list.filter(c => c.priority === filters.priority);
    if (filters.status) list = list.filter(c => c.status === filters.status);
    if (filters.category) list = list.filter(c => c.category === filters.category);
    return list;
  }, [allComplaints, filters]);

  const handleStatusChange = async (complaintId, newStatus) => {
    setUpdatingId(complaintId);
    try {
      await updateStatus(complaintId, newStatus);
      notify(`Status → "${newStatus}"`, 'success');
      setAllComplaints(prev => prev.map(c =>
        c.complaintId === complaintId ? { ...c, status: newStatus } : c
      ));
      fetchStats();
    } catch { notify('Failed to update status', 'error'); }
    finally { setUpdatingId(null); }
  };

  const handleLogout = () => { logout(); navigate('/admin/login', { replace: true }); };

  /* ── Chart Data ── */
  const categoryData = stats?.byCategory?.map(c => ({ name: c._id, value: c.count })) ?? [];
  const priorityData = PRIORITY_ORDER.map(p => ({
    name: p, count: stats?.byPriority?.find(b => b._id === p)?.count ?? 0,
  }));
  const dailyData = stats?.daily?.map(d => ({
    date: new Date(d._id).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
    count: d.count,
  })) ?? [];

  const total = stats?.total ?? 0;
  const critical = stats?.critical ?? 0;
  const pending = stats?.pending ?? 0;
  const resolved = stats?.resolved ?? 0;

  const now = new Date();
  const dayStr = now.toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric' }).toUpperCase();

  /* ── Nav Items ── */
  const NAV_ITEMS = [
    { id: 'dashboard', icon: '▤', label: 'Dashboard', count: null },
    { id: 'reports', icon: '📊', label: 'Reports', count: total },
    { id: 'critical', icon: '⚠️', label: 'Critical', count: critical },
    { id: 'pending', icon: '⏳', label: 'Pending', count: pending },
    { id: 'resolved', icon: '✅', label: 'Resolved', count: resolved },
  ];

  /* ── View Config ── */
  const VIEW_CONFIG = {
    reports:  { title: 'All Reports',       icon: '📊', color: '#6366F1', filterKey: null,     filterVal: null },
    critical: { title: 'Critical Issues',   icon: '⚠️',  color: '#F87171', filterKey: 'priority', filterVal: 'Critical' },
    pending:  { title: 'Pending Cases',     icon: '⏳', color: '#F59E0B', filterKey: 'status',   filterVal: 'Pending' },
    resolved: { title: 'Resolved Cases',    icon: '✅', color: '#4ADE80', filterKey: 'status',   filterVal: 'Resolved' },
  };

  /* ── Shared table renderer ── */
  const renderTable = (list = complaints) => (
    <div className="db-table-scroll">
      {loadingTable ? (
        <div className="db-loading">
          <div className="db-spinner" />
          <span style={{ fontSize: '0.82rem' }}>Loading…</span>
        </div>
      ) : list.length === 0 ? (
        <div className="db-empty">
          <div className="db-empty-icon">📭</div>
          <p style={{ fontSize: '0.85rem', color: '#334155' }}>No complaints found</p>
        </div>
      ) : (
        <table className="db-table">
          <thead>
            <tr>
              <th>ID</th><th>Category</th><th>Description</th>
              <th>Priority</th><th>Status</th><th>Date</th><th>Photo</th><th>Action</th>
            </tr>
          </thead>
          <tbody>
            {list.map(c => (
              <tr key={c._id}>
                <td><span className="db-complaint-id">{c.complaintId}</span></td>
                <td>
                  <div className="db-category-cell">
                    <span>{CATEGORY_ICONS[c.category]}</span>
                    <span>{c.category}</span>
                  </div>
                </td>
                <td><div className="db-desc-cell" title={c.description}>{c.description}</div></td>
                <td><span className={`db-badge ${DB_PRIORITY_CLASS[c.priority]}`}>{c.priority}</span></td>
                <td><span className={`db-badge ${DB_STATUS_CLASS[c.status]}`}>{c.status}</span></td>
                <td style={{ whiteSpace: 'nowrap', color: '#334155', fontSize: '0.75rem' }}>
                  {new Date(c.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </td>
                <td>
                  {c.photo
                    ? <img className="db-photo-thumb" src={`/uploads/${c.photo}`} alt="complaint" />
                    : <span style={{ color: '#1E293B', fontSize: '0.78rem' }}>—</span>}
                </td>
                <td>
                  <select
                    className={`db-status-select ${c.status.replace(' ', '-')}`}
                    value={c.status}
                    disabled={updatingId === c.complaintId}
                    onChange={e => handleStatusChange(c.complaintId, e.target.value)}
                  >
                    {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );

  /* ── Detail View Component (inline) ── */
  const DetailView = () => {
    const cfg = VIEW_CONFIG[activeNav] || VIEW_CONFIG.reports;
    const filtered = complaints; // Already filtered by the API via filters state

    // Category breakdown of the filtered complaints
    const catBreakdown = {};
    filtered.forEach(c => { catBreakdown[c.category] = (catBreakdown[c.category] || 0) + 1; });
    const catData = Object.entries(catBreakdown).map(([name, value]) => ({ name, value }));

    // Priority breakdown
    const priBreakdown = {};
    filtered.forEach(c => { priBreakdown[c.priority] = (priBreakdown[c.priority] || 0) + 1; });
    const priData = PRIORITY_ORDER.map(p => ({ name: p, count: priBreakdown[p] || 0 }));

    // Status breakdown for summary cards
    const statusBreakdown = {};
    filtered.forEach(c => { statusBreakdown[c.status] = (statusBreakdown[c.status] || 0) + 1; });

    const countVal = filtered.length;
    const pctOfTotal = total ? Math.round((countVal / total) * 100) : 0;

    return (
      <div>
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24,
          padding: '20px 24px', borderRadius: 16,
          background: `linear-gradient(135deg, ${cfg.color}15, ${cfg.color}08)`,
          border: `1px solid ${cfg.color}30`,
        }}>
          <div style={{
            width: 48, height: 48, borderRadius: 14,
            background: `${cfg.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 24, boxShadow: `0 0 20px ${cfg.color}30`,
          }}>
            {cfg.icon}
          </div>
          <div>
            <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#F1F5F9' }}>{cfg.title}</div>
            <div style={{ fontSize: '0.82rem', color: '#94A3B8' }}>
              {countVal} complaint{countVal !== 1 ? 's' : ''} · {pctOfTotal}% of total
            </div>
          </div>
        </div>

        {/* Summary mini-stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 24 }}>
          {[
            { label: 'Pending', count: statusBreakdown['Pending'] || 0, color: '#F59E0B', icon: '⏳' },
            { label: 'In Progress', count: statusBreakdown['In Progress'] || 0, color: '#60A5FA', icon: '🔄' },
            { label: 'Resolved', count: statusBreakdown['Resolved'] || 0, color: '#4ADE80', icon: '✅' },
          ].map(s => (
            <div key={s.label} className="db-card" style={{ padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#475569', fontWeight: 600 }}>
                  {s.label}
                </span>
                <span style={{ fontSize: 16 }}>{s.icon}</span>
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: s.color }}>
                <AnimatedNumber value={s.count} />
              </div>
              <div style={{ height: 3, borderRadius: 999, background: 'rgba(255,255,255,0.06)', marginTop: 10 }}>
                <div style={{
                  height: '100%', borderRadius: 999,
                  background: s.color,
                  width: countVal ? `${Math.round((s.count / countVal) * 100)}%` : '0%',
                  transition: 'width 0.6s ease',
                }} />
              </div>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 24 }}>
          {/* Category Donut */}
          <div className="db-card db-chart-card">
            <div className="db-chart-title">
              <span className="db-chart-title-dot" style={{ background: cfg.color, boxShadow: `0 0 6px ${cfg.color}80` }} />
              Category Breakdown
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={catData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={3} dataKey="value" strokeWidth={0}>
                  {catData.map((_, i) => (
                    <Cell key={i} fill={CATEGORY_COLORS[i % CATEGORY_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<DarkTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="db-legend">
              {catData.map((d, i) => (
                <div key={d.name} className="db-legend-item">
                  <div className="db-legend-dot" style={{ background: CATEGORY_COLORS[i % CATEGORY_COLORS.length] }} />
                  {d.name} <span style={{ color: cfg.color, marginLeft: 2 }}>({d.value})</span>
                </div>
              ))}
            </div>
          </div>

          {/* Priority Bar */}
          <div className="db-card db-chart-card">
            <div className="db-chart-title">
              <span className="db-chart-title-dot" style={{ background: '#F87171', boxShadow: '0 0 6px rgba(248,113,113,0.6)' }} />
              Priority Distribution
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={priData} barSize={28}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#475569' }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: '#475569' }} axisLine={false} tickLine={false} />
                <Tooltip content={<DarkTooltip />} cursor={{ fill: 'rgba(99,102,241,0.05)' }} />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {priData.map(d => (
                    <Cell key={d.name} fill={PRIORITY_COLORS[d.name]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Filtered Table */}
        <div className="db-card db-table-card">
          <div className="db-table-header">
            <div className="db-table-title">
              <span className="db-chart-title-dot" style={{ background: cfg.color, boxShadow: `0 0 6px ${cfg.color}80` }} />
              {cfg.title} — Complaints
            </div>
            <div style={{ fontSize: '0.78rem', color: '#64748B' }}>
              {countVal} result{countVal !== 1 ? 's' : ''}
            </div>
          </div>
          {renderTable(filtered)}
        </div>
      </div>
    );
  };

  return (
    <div className="db-root">
      {/* ══════════ SIDEBAR ══════════ */}
      <aside className="db-sidebar">
        {/* Brand */}
        <div className="db-sidebar-brand">
          <img src="/logo.png" alt="CityCare" style={{ width: 34, height: 34, borderRadius: 10, objectFit: 'contain', background: '#fff', padding: 2 }} />
          <span>CityCare</span>
        </div>

        {/* Greeting */}
        <div className="db-greeting">
          <div className="db-greeting-day">{dayStr}</div>
          <div className="db-greeting-name">
            Welcome back,<br /><span>Admin</span>
          </div>
          <div className="db-greeting-badge">
            🛡️ Administrator
          </div>
        </div>

        {/* Nav */}
        <nav className="db-nav">
          <div className="db-nav-section">Main Menu</div>
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              className={`db-nav-link${activeNav === item.id ? ' active' : ''}`}
              onClick={() => {
                setActiveNav(item.id);
                // Filter the table based on which nav item was clicked
                if (item.id === 'critical') {
                  setFilters({ priority: 'Critical', status: '', category: '' });
                } else if (item.id === 'pending') {
                  setFilters({ priority: '', status: 'Pending', category: '' });
                } else if (item.id === 'resolved') {
                  setFilters({ priority: '', status: 'Resolved', category: '' });
                } else {
                  // Dashboard or Reports — show all
                  setFilters({ priority: '', status: '', category: '' });
                }
              }}
            >
              <span className="db-nav-icon">{item.icon}</span>
              <span>{item.label}</span>
              {item.count !== null && item.count > 0 && (
                <span className="db-nav-count">{item.count}</span>
              )}
            </button>
          ))}

          <div className="db-nav-section" style={{ marginTop: 8 }}>System</div>
          <button className="db-nav-link" onClick={() => navigate('/')}>
            <span className="db-nav-icon">🏠</span>
            <span>Public Site</span>
          </button>
          <button className="db-nav-link" onClick={handleLogout}>
            <span className="db-nav-icon">🚪</span>
            <span>Logout</span>
          </button>
        </nav>

        {/* CTA */}
        <div className="db-sidebar-cta">
          <div className="db-sidebar-cta-icon">✨</div>
          <div className="db-sidebar-cta-title">CityCare Pro</div>
          <div className="db-sidebar-cta-desc">
            Unlock AI-powered routing, analytics exports and priority alerts.
          </div>
          <button className="db-sidebar-cta-btn">
            ⚡ Upgrade Now
          </button>
        </div>
      </aside>

      {/* ══════════ MAIN CONTENT ══════════ */}
      <div className="db-main">
        {/* Topbar */}
        <div className="db-topbar">
          <div className="db-topbar-left">
            <div className="db-topbar-period">
              📅 &nbsp;
              {now.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
            </div>
          </div>
          <div className="db-topbar-right">
            <button
              className="db-refresh-btn"
              onClick={() => { fetchStats(); fetchComplaints(); }}
              title="Refresh"
            >↺</button>
            <button className="db-export-btn">
              ↓ &nbsp;Export Report
            </button>
          </div>
        </div>

        {/* Scroll Area */}
        <div className="db-scroll" ref={scrollRef}>

          {activeNav === 'dashboard' ? (
            <>
              {/* ── Stats Grid ── */}
              <div className="db-stats-grid">
                {[
                  {
                    cls: 'db-stat-total', label: 'Total Complaints',
                    value: loadingStats ? '…' : total,
                    icon: '📋', trend: '+12%', dir: 'up', pct: '65%',
                  },
                  {
                    cls: 'db-stat-critical', label: 'Critical Issues',
                    value: loadingStats ? '…' : critical,
                    icon: '⚠️', trend: '-5%', dir: 'down', pct: `${total ? Math.round(critical / total * 100) : 0}%`,
                  },
                  {
                    cls: 'db-stat-pending', label: 'Pending',
                    value: loadingStats ? '…' : pending,
                    icon: '⏳', trend: '+3%', dir: 'up', pct: `${total ? Math.round(pending / total * 100) : 0}%`,
                  },
                  {
                    cls: 'db-stat-resolved', label: 'Resolved',
                    value: loadingStats ? '…' : resolved,
                    icon: '✅', trend: '+18%', dir: 'up', pct: `${total ? Math.round(resolved / total * 100) : 0}%`,
                  },
                ].map(s => (
                  <div key={s.label} className={`db-card db-stat ${s.cls}`}>
                    <div className="db-stat-label">
                      {s.label}
                      <span className="db-stat-icon">{s.icon}</span>
                    </div>
                    <div className="db-stat-value">
                      {typeof s.value === 'number' ? <AnimatedNumber value={s.value} /> : s.value}
                    </div>
                    <div className={`db-stat-trend ${s.dir}`}>
                      {s.dir === 'up' ? '▲' : '▼'} {s.trend} vs last period
                    </div>
                    <div className="db-stat-bar">
                      <div className="db-stat-bar-fill" style={{ width: s.pct }} />
                    </div>
                  </div>
                ))}
              </div>

              {/* ── Charts Row ── */}
              {!loadingStats && (
                <div className="db-charts-row">
                  {/* Donut — Categories */}
                  <div className="db-card db-chart-card">
                    <div className="db-chart-title">
                      <span className="db-chart-title-dot" />
                      Issues by Category
                    </div>
                    <ResponsiveContainer width="100%" height={160}>
                      <PieChart>
                        <Pie
                          data={categoryData}
                          cx="50%" cy="50%"
                          innerRadius={46} outerRadius={70}
                          paddingAngle={4} dataKey="value"
                          strokeWidth={0}
                        >
                          {categoryData.map((_, i) => (
                            <Cell
                              key={i}
                              fill={CATEGORY_COLORS[i % CATEGORY_COLORS.length]}
                              style={{ filter: `drop-shadow(0 0 5px ${CATEGORY_COLORS[i % CATEGORY_COLORS.length]}80)` }}
                            />
                          ))}
                        </Pie>
                        <Tooltip content={<DarkTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="db-legend">
                      {categoryData.map((d, i) => (
                        <div key={d.name} className="db-legend-item">
                          <div className="db-legend-dot" style={{
                            background: CATEGORY_COLORS[i % CATEGORY_COLORS.length],
                            boxShadow: `0 0 5px ${CATEGORY_COLORS[i % CATEGORY_COLORS.length]}80`
                          }} />
                          {d.name} <span style={{ color: '#6366F1', marginLeft: 2 }}>({d.value})</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Bar — Priority */}
                  <div className="db-card db-chart-card">
                    <div className="db-chart-title">
                      <span className="db-chart-title-dot" style={{ background: '#F87171', boxShadow: '0 0 6px rgba(248,113,113,0.6)' }} />
                      Priority Distribution
                    </div>
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={priorityData} barSize={24}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                        <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#475569' }} axisLine={false} tickLine={false} />
                        <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: '#475569' }} axisLine={false} tickLine={false} />
                        <Tooltip content={<DarkTooltip />} cursor={{ fill: 'rgba(99,102,241,0.05)' }} />
                        <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                          {priorityData.map(d => (
                            <Cell key={d.name} fill={PRIORITY_COLORS[d.name]}
                              style={{ filter: `drop-shadow(0 0 4px ${PRIORITY_COLORS[d.name]}60)` }}
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Area — Daily Trend */}
                  <div className="db-card db-chart-card">
                    <div className="db-chart-title">
                      <span className="db-chart-title-dot" style={{ background: '#8B5CF6', boxShadow: '0 0 6px rgba(139,92,246,0.6)' }} />
                      Complaint Trend (7 days)
                    </div>
                    <ResponsiveContainer width="100%" height={200}>
                      <AreaChart data={dailyData}>
                        <defs>
                          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#6366F1" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                        <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#475569' }} axisLine={false} tickLine={false} />
                        <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: '#475569' }} axisLine={false} tickLine={false} />
                        <Tooltip content={<DarkTooltip />} cursor={{ stroke: 'rgba(99,102,241,0.3)', strokeWidth: 1 }} />
                        <Area
                          type="monotone" dataKey="count"
                          stroke="#6366F1" strokeWidth={2.5}
                          fill="url(#areaGrad)"
                          dot={{ r: 4, fill: '#6366F1', strokeWidth: 0 }}
                          activeDot={{ r: 6, fill: '#A78BFA', strokeWidth: 0 }}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {/* ── All Complaints Table ── */}
              <div className="db-bottom-row">
                <div className="db-card db-table-card">
                  <div className="db-table-header">
                    <div className="db-table-title">
                      <span className="db-chart-title-dot" />
                      All Complaints
                    </div>
                    <div className="db-table-filters">
                      {[
                        { key: 'priority', opts: ['Critical', 'High', 'Medium', 'Low'], ph: 'Priority' },
                        { key: 'status', opts: STATUSES, ph: 'Status' },
                        { key: 'category', opts: Object.keys(CATEGORY_ICONS), ph: 'Category' },
                      ].map(({ key, opts, ph }) => (
                        <select
                          key={key}
                          className="db-filter-select"
                          value={filters[key]}
                          onChange={e => setFilters(f => ({ ...f, [key]: e.target.value }))}
                        >
                          <option value="">All {ph}</option>
                          {opts.map(o => <option key={o} value={o}>{o}</option>)}
                        </select>
                      ))}
                      {(filters.priority || filters.status || filters.category) && (
                        <button
                          style={{
                            background: 'transparent', border: '1px solid rgba(239,68,68,0.25)',
                            color: '#F87171', borderRadius: 8, padding: '5px 10px',
                            fontSize: '0.72rem', cursor: 'pointer', fontFamily: 'Inter, sans-serif',
                          }}
                          onClick={() => setFilters({ priority: '', status: '', category: '' })}
                        >
                          ✕ Clear
                        </button>
                      )}
                    </div>
                  </div>
                  {renderTable()}
                </div>
              </div>
            </>
          ) : (
            /* ══════════ DETAIL VIEW for Critical / Pending / Resolved / Reports ══════════ */
            DetailView()
          )}

        </div>{/* end db-scroll */}
      </div>{/* end db-main */}
    </div>
  );
}
