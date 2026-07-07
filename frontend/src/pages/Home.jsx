import { useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import PageTransition from '../components/PageTransition';
import { getComplaints } from '../api/complaints';

/* ── SVG Icon Components ── */
function AIIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.7" strokeLinecap="round">
      <circle cx="12" cy="12" r="2.5" fill="white" fillOpacity="0.9" stroke="none"/>
      <circle cx="4.5" cy="7"  r="1.6" fill="white" fillOpacity="0.55" stroke="none"/>
      <circle cx="19.5" cy="7"  r="1.6" fill="white" fillOpacity="0.55" stroke="none"/>
      <circle cx="4.5" cy="17" r="1.6" fill="white" fillOpacity="0.55" stroke="none"/>
      <circle cx="19.5" cy="17" r="1.6" fill="white" fillOpacity="0.55" stroke="none"/>
      <line x1="6" y1="7.9"  x2="10.1" y2="11"  stroke="white" strokeOpacity="0.6"/>
      <line x1="18" y1="7.9"  x2="13.9" y2="11"  stroke="white" strokeOpacity="0.6"/>
      <line x1="6" y1="16.1" x2="10.1" y2="13"  stroke="white" strokeOpacity="0.6"/>
      <line x1="18" y1="16.1" x2="13.9" y2="13"  stroke="white" strokeOpacity="0.6"/>
    </svg>
  );
}
function LocationIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
        fill="white" fillOpacity="0.2" stroke="white" strokeWidth="1.6"/>
      <circle cx="12" cy="9" r="2.5" fill="white" stroke="none"/>
      {/* ripple ring */}
      <circle cx="12" cy="9" r="5" fill="none" stroke="white" strokeWidth="1" strokeOpacity="0.3"
        style={{transformOrigin:'12px 9px', animation:'locationRipple 2s ease-out infinite'}}/>
    </svg>
  );
}
function PhotoIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"
        fill="white" fillOpacity="0.12"/>
      <circle cx="12" cy="13" r="4" fill="white" fillOpacity="0.18"/>
      <circle cx="12" cy="13" r="2.2" fill="white" stroke="none"/>
      <circle cx="18.5" cy="9" r="1" fill="white" stroke="none" fillOpacity="0.7"/>
    </svg>
  );
}
function TrackIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 4 23 10 17 10"/>
      <polyline points="1 20 1 14 7 14"/>
      <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/>
    </svg>
  );
}
function DashIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" strokeLinecap="round">
      <rect x="2"  y="14" width="5" height="8" rx="1.5" fill="white" fillOpacity="0.45"/>
      <rect x="9.5" y="9"  width="5" height="13" rx="1.5" fill="white" fillOpacity="0.65"/>
      <rect x="17" y="3"  width="5" height="19" rx="1.5" fill="white" fillOpacity="0.9"/>
    </svg>
  );
}
function ZapIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"
        fill="white" fillOpacity="0.25" stroke="white" strokeWidth="1.7"/>
      <line x1="13" y1="2" x2="12" y2="10" stroke="white" strokeWidth="2.2" strokeOpacity="0.7"/>
    </svg>
  );
}

const FEATURES = [
  {
    gradient: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
    glow: 'rgba(99,102,241,0.7)',
    title: 'AI Priority Classification',
    desc: 'Our engine auto-detects urgency from your description — critical hazards are flagged instantly.',
    Icon: AIIcon,
  },
  {
    gradient: 'linear-gradient(135deg,#10b981,#059669)',
    glow: 'rgba(16,185,129,0.7)',
    title: 'Location Tracking',
    desc: 'Pin the exact location so field teams can navigate directly to the problem.',
    Icon: LocationIcon,
  },
  {
    gradient: 'linear-gradient(135deg,#f59e0b,#d97706)',
    glow: 'rgba(245,158,11,0.7)',
    title: 'Photo Evidence',
    desc: 'Attach a photo to your complaint for faster verification and resolution.',
    Icon: PhotoIcon,
  },
  {
    gradient: 'linear-gradient(135deg,#8b5cf6,#7c3aed)',
    glow: 'rgba(139,92,246,0.7)',
    title: 'Real-Time Tracking',
    desc: 'Follow your complaint with a unique ID through every stage — Pending to Resolved.',
    Icon: TrackIcon,
  },
  {
    gradient: 'linear-gradient(135deg,#3b82f6,#2563eb)',
    glow: 'rgba(59,130,246,0.7)',
    title: 'Admin Dashboard',
    desc: 'Live charts and a filterable table give authorities instant situational awareness.',
    Icon: DashIcon,
  },
  {
    gradient: 'linear-gradient(135deg,#ef4444,#dc2626)',
    glow: 'rgba(239,68,68,0.7)',
    title: 'Faster Resolutions',
    desc: 'Structured data and priorities help civic teams respond 3x faster than traditional reports.',
    Icon: ZapIcon,
  },
];


const STATS = [
  { prefix: '', value: 2400, suffix: '+', label: 'Issues Reported' },
  { prefix: '', value: 89, suffix: '%', label: 'Resolution Rate' },
  { prefix: '< ', value: 2, suffix: 'hrs', label: 'Avg Response' },
  { prefix: '', value: 50, suffix: '+', label: 'Active Areas' },
];

function StatCard({ stat }) {
  const [count, setCount] = useState(0);
  const [visible, setVisible] = useState(false);
  const elementRef = useRef(null);
  const rafRef = useRef(null);
  const startTimeRef = useRef(null);
  const startValueRef = useRef(0);
  const directionRef = useRef('up');

  const animateTo = (target, from) => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    startTimeRef.current = null;
    startValueRef.current = from;

    const duration = 3500;
    const tick = (timestamp) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(startValueRef.current + (target - startValueRef.current) * eased);
      setCount(current);
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };
    rafRef.current = requestAnimationFrame(tick);
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting) {
          setVisible(true);
          animateTo(stat.value, 0); // count up from 0
        } else {
          setVisible(false);
          animateTo(0, stat.value); // count down to 0 when leaving
        }
      },
      { threshold: 0.3 }
    );
    if (elementRef.current) observer.observe(elementRef.current);
    return () => {
      observer.disconnect();
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [stat.value]);

  const displayNum = stat.value >= 1000 ? count.toLocaleString('en-IN') : count;

  return (
    <div
      className="stat-card"
      ref={elementRef}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.95)',
        transition: 'opacity 0.6s cubic-bezier(0.16,1,0.3,1), transform 0.6s cubic-bezier(0.16,1,0.3,1)',
      }}
    >
      <div className="value">{stat.prefix}{displayNum}{stat.suffix}</div>
      <div className="label">{stat.label}</div>
    </div>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const heroContentRef = useRef(null);
  const [resolvedCases, setResolvedCases] = useState([]);
  const [casesLoading, setCasesLoading] = useState(true);

  // Fetch real resolved complaints from DB
  useEffect(() => {
    getComplaints({ status: 'Resolved', priority: 'Critical' })
      .then((res) => {
        const cases = (res.data?.data || []).slice(0, 3);
        setResolvedCases(cases);
      })
      .catch(() => setResolvedCases([]))
      .finally(() => setCasesLoading(false));
  }, []);

  // Hero parallax fade — JS-driven so it actually works
  useEffect(() => {
    const handleScroll = () => {
      const el = heroContentRef.current;
      if (!el) return;
      const scrollY = window.scrollY;
      const fadeEnd = window.innerHeight * 0.75;
      const opacity = Math.max(0, 1 - scrollY / fadeEnd);
      const translateY = scrollY * 0.25;
      el.style.opacity = opacity;
      el.style.transform = `translateY(${translateY}px)`;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Bidirectional reveal for all .reveal / .reveal-stagger on this page
  useEffect(() => {
    const els = document.querySelectorAll('.reveal, .reveal-stagger');
    if (!els.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          } else {
            entry.target.classList.remove('visible');
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -60px 0px' }
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <PageTransition>
      <main>
        <section className="hero">
          <div className="hero-content" ref={heroContentRef}>
            <h1>
              Report Public Issues.<br />
              <span>Get Them Fixed Faster.</span>
            </h1>
            <p style={{ fontSize: '2rem', fontWeight: '800', color: '#F1F5F9', textShadow: '0 2px 20px rgba(0,0,0,0.4)', marginTop: '8px' }}>
              Report Today. Improve Tomorrow.
            </p>
            <div className="hero-cta">
              <button className="btn btn-primary btn-lg" onClick={() => navigate('/report')}>
                Report an Issue →
              </button>
            </div>

            <div className="stats-grid">
              {STATS.map((s, i) => <StatCard key={i} stat={s} />)}
            </div>
          </div>

          <div style={{
            position: 'absolute', width: 320, height: 320, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(79,110,247,0.09) 0%, transparent 70%)',
            top: '10%', left: '-80px', pointerEvents: 'none',
            animation: 'orbFloat 10s 2s ease-in-out infinite'
          }} />
        </section>

        <section className="features">
          <div className="features-header reveal">
            <h2>Everything You Need</h2>
            <p>A complete civic reporting pipeline from complaint to resolution.</p>
          </div>
          <div className="features-grid reveal-stagger">
            {FEATURES.map(f => (
              <div
                className="feature-card"
                key={f.title}
                style={{ '--fc-glow': f.glow }}
              >
                <div
                  className="feature-icon"
                  style={{ background: f.gradient }}
                >
                  <f.Icon />
                </div>
                <h3>{f.title}</h3>
                <p style={{ marginTop: 8, fontSize: '0.875rem' }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="resolved-cases" style={{ padding: '80px 24px', background: '#050B14' }}>
          <div className="features-header reveal">
            <h2 style={{ color: 'var(--critical)' }}>Critical Issues Resolved</h2>
            <p>Real problems solved by our system — click any card to view the full case.</p>
          </div>

          {casesLoading ? (
            <div className="features-grid" style={{ maxWidth: 1100, margin: '0 auto' }}>
              {[1,2,3].map(i => (
                <div key={i} className="feature-card" style={{ background: 'rgba(239,68,68,0.03)', borderColor: 'rgba(239,68,68,0.08)' }}>
                  <div style={{ height: 14, width: '60%', borderRadius: 8, background: 'rgba(255,255,255,0.06)', marginBottom: 16, animation: 'shimmer 1.5s ease-in-out infinite' }} />
                  <div style={{ height: 24, width: '85%', borderRadius: 8, background: 'rgba(255,255,255,0.05)', marginBottom: 12, animation: 'shimmer 1.5s 0.2s ease-in-out infinite' }} />
                  <div style={{ height: 12, width: '100%', borderRadius: 6, background: 'rgba(255,255,255,0.04)', animation: 'shimmer 1.5s 0.4s ease-in-out infinite' }} />
                </div>
              ))}
            </div>
          ) : resolvedCases.length === 0 ? (
            <p style={{ textAlign: 'center', color: 'var(--text-3)', marginTop: 24 }}>No resolved cases to display yet.</p>
          ) : (
            <div className="features-grid reveal-stagger" style={{ maxWidth: 1100, margin: '0 auto' }}>
              {resolvedCases.map((c, i) => {
                const resolvedDate = c.updatedAt ? new Date(c.updatedAt) : new Date(c.createdAt);
                const createdDate = new Date(c.createdAt);
                const diffMs = resolvedDate - createdDate;
                const diffHrs = Math.max(0, Math.round(diffMs / 36e5));
                const timeLabel = diffHrs < 1 ? 'Resolved in < 1 hr' : `Resolved in ${diffHrs} hr${diffHrs !== 1 ? 's' : ''}`;

                return (
                  <div
                    key={c._id || i}
                    className="feature-card"
                    onClick={() => navigate(`/track?id=${c.complaintId}`)}
                    style={{
                      '--fc-glow': 'rgba(239,68,68,0.4)',
                      background: 'rgba(239,68,68,0.02)',
                      borderColor: 'rgba(239,68,68,0.1)',
                      cursor: 'pointer',
                      transition: 'transform 0.3s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.3s ease, border-color 0.3s ease',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.transform = 'translateY(-6px)';
                      e.currentTarget.style.boxShadow = '0 16px 40px rgba(239,68,68,0.15)';
                      e.currentTarget.style.borderColor = 'rgba(239,68,68,0.35)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.transform = '';
                      e.currentTarget.style.boxShadow = '';
                      e.currentTarget.style.borderColor = 'rgba(239,68,68,0.1)';
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#ef4444', background: 'rgba(239,68,68,0.1)', padding: '4px 8px', borderRadius: 4 }}>
                        {timeLabel}
                      </span>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-3)', fontFamily: 'monospace' }}>{c.complaintId}</span>
                    </div>
                    <h3 style={{ fontSize: '1.1rem', marginBottom: 8, lineHeight: 1.3 }}>
                      {c.description?.slice(0, 60)}{c.description?.length > 60 ? '…' : ''}
                    </h3>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-2)', lineHeight: 1.5 }}>
                      📍 {c.location}
                    </p>
                    <div style={{ marginTop: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.78rem', color: 'var(--primary)', fontWeight: 600 }}>{c.category}</span>
                      <span style={{ fontSize: '0.72rem', color: '#4ADE80', fontWeight: 600 }}>✓ Resolved</span>
                    </div>
                    <div style={{ marginTop: 12, fontSize: '0.75rem', color: 'var(--text-3)', textAlign: 'right' }}>
                      Click to view full case →
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </PageTransition>
  );
}
