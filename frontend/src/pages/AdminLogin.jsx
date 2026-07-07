import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './AdminLogin.css';

const STATS = [
  { value: '2,400+', label: 'Issues Tracked' },
  { value: '89%', label: 'Resolution Rate' },
  { value: '50+', label: 'Active Zones' },
];

// Animated dot for the grid
function GridDot({ delay, duration }) {
  return (
    <div
      className="grid-dot"
      style={{ animationDelay: `${delay}s`, animationDuration: `${duration}s` }}
    />
  );
}

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [userFocused, setUserFocused] = useState(false);
  const [passFocused, setPassFocused] = useState(false);
  const [statIdx, setStatIdx] = useState(0);
  const { login } = useAuth();
  const navigate = useNavigate();

  // Cycle through stats
  useEffect(() => {
    const t = setInterval(() => setStatIdx(i => (i + 1) % STATS.length), 2800);
    return () => clearInterval(t);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    await new Promise(r => setTimeout(r, 700));
    const result = login(username, password);
    setLoading(false);
    if (result.success) {
      navigate('/dashboard', { replace: true });
    } else {
      setError(result.error);
    }
  };

  // Generate random grid dots
  const dots = Array.from({ length: 48 }, (_, i) => ({
    delay: (i * 0.18) % 4,
    duration: 3 + (i % 5),
  }));

  return (
    <div className="apl-wrap">
      {/* ── Left Panel ── */}
      <div className="apl-left">
        {/* Scan line */}
        <div className="apl-scan" />

        {/* Dot grid */}
        <div className="apl-grid">
          {dots.map((d, i) => <GridDot key={i} delay={d.delay} duration={d.duration} />)}
        </div>

        {/* Horizontal accent lines */}
        <div className="apl-lines">
          {[0,1,2,3,4].map(i => <div key={i} className="apl-line" style={{ animationDelay: `${i * 0.4}s` }} />)}
        </div>

        {/* Content */}
        <div className="apl-left-content">
          {/* Header / Brand */}
          <div className="apl-brand">
            <img src="/logo.png" alt="CityCare" style={{ width: 40, height: 40, borderRadius: 10, objectFit: 'contain', background: '#fff', padding: 2 }} />
            <span>CityCare</span>
          </div>

          {/* Main heading */}
          <div className="apl-headline">
            <div className="apl-tag">ADMIN CONTROL CENTRE</div>
            <h2 className="apl-title">
              City Infrastructure<br />
              <span className="apl-title-accent">Command Panel</span>
            </h2>
            <p className="apl-desc">
              Real-time civic issue management. Monitor, prioritize, and resolve infrastructure complaints across the city.
            </p>
          </div>

          {/* Cycling stat */}
          <div className="apl-stat-block">
            <div className="apl-stat-bar" />
            <div className="apl-stat-cycling" key={statIdx}>
              <div className="apl-stat-value">{STATS[statIdx].value}</div>
              <div className="apl-stat-label">{STATS[statIdx].label}</div>
            </div>
            <div className="apl-stat-dots">
              {STATS.map((_, i) => (
                <div key={i} className={`apl-stat-dot${i === statIdx ? ' active' : ''}`} />
              ))}
            </div>
          </div>

          {/* Bottom city silhouette */}
          <div className="apl-city">
            {[28,44,20,56,36,48,24,60,40,32,52,28,44,36].map((h, i) => (
              <div key={i} className="apl-building" style={{
                height: h,
                animationDelay: `${i * 0.15}s`,
                width: i % 3 === 0 ? 14 : i % 3 === 1 ? 18 : 12,
              }}>
                {i % 4 === 0 && <div className="apl-building-light" style={{ animationDelay: `${i * 0.3}s` }} />}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right Panel ── */}
      <div className="apl-right">
        <div className="apl-form-wrap">
          {/* Top accent */}
          <div className="apl-accent-bar" />

          {/* Header */}
          <div className="apl-form-header">
            <div className="apl-lock-ring">
              <div className="apl-lock-ring-inner">🔐</div>
            </div>
            <h1>Sign In</h1>
            <p>Access restricted to administrators only</p>
          </div>

          {/* Form */}
          <form className="apl-form" onSubmit={handleSubmit}>
            {/* Username floating label */}
            <div className={`apl-field${userFocused || username ? ' active' : ''}`}>
              <input
                id="apl-username"
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                onFocus={() => setUserFocused(true)}
                onBlur={() => setUserFocused(false)}
                required
                autoComplete="off"
                autoFocus
              />
              <label htmlFor="apl-username">Username</label>
              <div className="apl-field-bar" />
            </div>

            {/* Password floating label */}
            <div className={`apl-field${passFocused || password ? ' active' : ''}`}>
              <input
                id="apl-password"
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                onFocus={() => setPassFocused(true)}
                onBlur={() => setPassFocused(false)}
                required
                autoComplete="off"
              />
              <label htmlFor="apl-password">Password</label>
              <div className="apl-field-bar" />
              <button
                type="button"
                className="apl-eye"
                onClick={() => setShowPass(v => !v)}
                tabIndex={-1}
              >{showPass ? '🙈' : '👁️'}</button>
            </div>

            {error && (
              <div className="apl-error">
                <span className="apl-error-icon">⚠</span>
                {error}
              </div>
            )}

            <button type="submit" className="apl-submit" disabled={loading}>
              {loading ? (
                <span className="apl-submit-loader" />
              ) : (
                <>
                  <span>Authenticate</span>
                  <span className="apl-arrow">→</span>
                </>
              )}
            </button>
          </form>

          {/* Credentials hint */}
          <div className="apl-creds">
            <div className="apl-creds-label">DEMO ACCESS</div>
            <div className="apl-creds-row">
              <span>user</span><code>admin</code>
            </div>
            <div className="apl-creds-row">
              <span>pass</span><code>citycare@2024</code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

