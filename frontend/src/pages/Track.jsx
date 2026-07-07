import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getComplaintById } from '../api/complaints';
import PageTransition from '../components/PageTransition';

const PRIORITY_CLASS = {
  Critical: 'badge-critical',
  High: 'badge-high',
  Medium: 'badge-medium',
  Low: 'badge-low',
};

const STATUS_STEPS = ['Pending', 'In Progress', 'Resolved'];

function StatusTimeline({ status }) {
  const idx = STATUS_STEPS.indexOf(status);
  return (
    <div className="status-timeline">
      {STATUS_STEPS.map((step, i) => (
        <>
          <div
            key={step}
            className={`step ${i < idx ? 'done' : i === idx ? 'active' : ''}`}
          >
            <div className="dot">{i < idx ? '✓' : i + 1}</div>
            <span>{step}</span>
          </div>
          {i < STATUS_STEPS.length - 1 && (
            <div key={`line-${i}`} className={`step-line${i < idx ? ' done' : ''}`} />
          )}
        </>
      ))}
    </div>
  );
}

const CATEGORY_ICONS = {
  Pothole: '🚧',
  'Water Supply': '💧',
  Streetlight: '💡',
  Garbage: '🗑️',
  Electricity: '⚡',
};

const SUCCESS_STORIES = [
  { city: 'Tokyo, Japan', category: 'Infrastructure', title: 'Pothole Crisis Averted', desc: 'Over 5,000 potholes mapped and repaired within 48 hours using AI-driven civic reporting.' },
  { city: 'London, UK', category: 'Utilities', title: 'Smart Grid Fixes Outages', desc: 'Real-time tracking of streetlight failures reduced neighborhood blackout times by 75%.' },
  { city: 'New York, USA', category: 'Sanitation', title: 'Zero Waste Initiative', desc: 'Citizen-reported overflowing bins led to dynamic routing for garbage trucks, saving $2M annually.' },
  { city: 'Seoul, South Korea', category: 'Water Supply', title: 'Leak Detection System', desc: 'Community reports of low pressure identified 12 major pipeline leaks before burst.' },
  { city: 'Mumbai, India', category: 'Electricity', title: 'Monsoon Power Resilience', desc: 'Predictive reporting mapped high-risk transformers, ensuring zero fatalities during storms.' },
];

function SuccessStories() {
  return (
    <div className="animate-slide-up delay-3" style={{ marginTop: '48px', width: '100%' }}>
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <h3 style={{ color: '#F1F5F9', fontSize: '1.2rem', marginBottom: '8px' }}>Global Impact</h3>
        <p style={{ color: 'var(--text-3)', fontSize: '0.85rem' }}>See how online reporting systems are solving problems worldwide.</p>
      </div>
      
      <div className="marquee-container">
        {/* We duplicate the content twice to create a seamless infinite loop */}
        <div className="marquee-content">
          {[...SUCCESS_STORIES, ...SUCCESS_STORIES, ...SUCCESS_STORIES].map((story, i) => (
            <div key={i} className="news-card">
              <div className="news-header">
                <span className="news-city">{story.city}</span>
                <span className="news-badge">{story.category}</span>
              </div>
              <h4 className="news-title">{story.title}</h4>
              <p className="news-desc">{story.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Track() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('id') || '');
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);

  // Auto-search if id is in URL
  useEffect(() => {
    const id = searchParams.get('id');
    if (id) {
      setQuery(id);
      doSearch(id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const doSearch = async (id) => {
    if (!id.trim()) return;
    setLoading(true);
    setNotFound(false);
    setComplaint(null);
    try {
      const res = await getComplaintById(id.trim().toUpperCase());
      setComplaint(res.data.data);
    } catch {
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchParams(query ? { id: query } : {});
    doSearch(query);
  };

  return (
    <PageTransition>
      <div className="page container">
        <div className="track-page">
          <h1 className="animate-slide-up">Track Your Complaint</h1>
          <p className="animate-slide-up delay-1">Enter your complaint ID to check the current status.</p>

          <form className="track-search-row animate-slide-up delay-2" onSubmit={handleSearch}>
          <input
            className="form-input"
            placeholder="e.g. CMP-A1B2C3D"
            value={query}
            onChange={e => setQuery(e.target.value.toUpperCase())}
            style={{ fontFamily: 'monospace', letterSpacing: '1px' }}
          />
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? <span className="spinner" /> : '🔍'} Search
          </button>
        </form>

        {loading && (
          <div className="loading-screen">
            <div className="spinner spinner-dark" style={{ width: 32, height: 32 }} />
            <span>Looking up complaint...</span>
          </div>
        )}

        {notFound && (
          <div className="not-found">
            <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
            <h3>Complaint Not Found</h3>
            <p style={{ marginTop: 8 }}>
              No complaint found for <strong>{query}</strong>. Check the ID and try again.
            </p>
          </div>
        )}

        {complaint && (
          <div className="complaint-detail animate-slide-up delay-3">
            <div className="detail-header">
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>
                  Complaint ID
                </div>
                <div style={{ fontFamily: 'monospace', fontSize: '1.15rem', fontWeight: 700, color: 'var(--primary)', letterSpacing: 2 }}>
                  {complaint.complaintId}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                <span className={`badge ${PRIORITY_CLASS[complaint.priority]}`}>{complaint.priority}</span>
                <span className={`badge badge-${complaint.status === 'In Progress' ? 'inprogress' : complaint.status.toLowerCase()}`}>
                  {complaint.status}
                </span>
              </div>
            </div>

            <div className="detail-row">
              <div className="dl">Category</div>
              <div className="dv">
                {CATEGORY_ICONS[complaint.category]} {complaint.category}
              </div>
            </div>
            <div className="detail-row">
              <div className="dl">Description</div>
              <div className="dv">{complaint.description}</div>
            </div>
            <div className="detail-row">
              <div className="dl">Location</div>
              <div className="dv">📍 {complaint.location}</div>
            </div>
            <div className="detail-row">
              <div className="dl">Filed On</div>
              <div className="dv">{new Date(complaint.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
            </div>

            {complaint.photo && (
              <div className="detail-row" style={{ flexDirection: 'column', gap: 8 }}>
                <div className="dl">Photo</div>
                <img
                  src={`/uploads/${complaint.photo}`}
                  alt="complaint"
                  style={{ maxWidth: '100%', maxHeight: 260, borderRadius: 'var(--r-md)', border: '1px solid var(--border)', objectFit: 'cover' }}
                />
              </div>
            )}

            <StatusTimeline status={complaint.status} />
          </div>
        )}

        {/* Empty State: Success Stories */}
        {!complaint && !loading && !notFound && <SuccessStories />}
        
        </div>
      </div>
    </PageTransition>
  );
}
