import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { submitComplaint } from '../api/complaints';
import { useAuth } from '../contexts/AuthContext';
import PageTransition from '../components/PageTransition';

const CATEGORIES = ['Pothole', 'Water Supply', 'Streetlight', 'Garbage', 'Electricity'];
const CATEGORY_ICONS = {
  Pothole: '🚧',
  'Water Supply': '💧',
  Streetlight: '💡',
  Garbage: '🗑️',
  Electricity: '⚡',
};

export default function ReportIssue() {
  const navigate = useNavigate();
  const fileRef = useRef(null);
  const { user } = useAuth();

  const [form, setForm] = useState({ 
    name: '',
    phone: '',
    email: '',
    address: '',
    category: '', 
    description: '', 
    location: '' 
  });
  const [photo, setPhoto] = useState(null);
  const [preview, setPreview] = useState(null);
  const [drag, setDrag] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(null);
  const [errors, setErrors] = useState({});

  // No autofill — user must fill the form fields manually each time

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.phone.trim()) e.phone = 'Phone number is required';
    if (!form.email.trim()) e.email = 'Email is required';
    if (!form.address.trim()) e.address = 'Address is required';
    if (!form.category) e.category = 'Please select an issue type';
    if (!form.description.trim()) e.description = 'Description is required';
    if (form.description.length > 300) e.description = 'Max 300 characters';
    if (!form.location.trim()) e.location = 'Location is required';
    if (!photo) e.photo = 'A photo of the issue is required';
    return e;
  };

  const handleFile = (file) => {
    if (!file) return;
    setPhoto(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDrag(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);

    try {
      const fd = new FormData();
      fd.append('category', form.category);
      fd.append('description', form.description);
      fd.append('location', form.location);
      fd.append('name', form.name);
      fd.append('phone', form.phone);
      fd.append('email', form.email);
      fd.append('address', form.address);
      fd.append('reportedBy', user?._id || '');
      if (photo) fd.append('photo', photo);

      const res = await submitComplaint(fd);
      setSubmitted(res.data.data);
    } catch (err) {
      setErrors({ submit: err.response?.data?.error || 'Submission failed. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageTransition>
    <>
      <div className="page container">
        <div className="report-page">
          <h1 className="animate-slide-up">Report an Issue</h1>
          <p className="animate-slide-up delay-1">Describe the problem and our AI will help prioritize it.</p>

          <form className="report-form report-form-glass animate-slide-up delay-2" onSubmit={handleSubmit} noValidate autoComplete="off">
            
            {/* Personal Details — user must fill manually */}
            <div style={{ marginBottom: '24px', padding: '20px', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--r-md)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '4px', color: '#F1F5F9' }}>Personal Details</h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-3)', marginBottom: '18px' }}>Please fill in your details — required for each submission.</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Full Name *</label>
                  <input
                    className="form-input"
                    placeholder="e.g. Arun Kumar"
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    autoComplete="off"
                  />
                  {errors.name && <span style={{ color: 'var(--critical)', fontSize: '0.78rem' }}>{errors.name}</span>}
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Phone Number *</label>
                  <input
                    className="form-input"
                    placeholder="e.g. 9876543210"
                    value={form.phone}
                    onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                    autoComplete="off"
                    inputMode="tel"
                  />
                  {errors.phone && <span style={{ color: 'var(--critical)', fontSize: '0.78rem' }}>{errors.phone}</span>}
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Email Address *</label>
                  <input
                    className="form-input"
                    placeholder="e.g. arun@email.com"
                    value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    autoComplete="off"
                    inputMode="email"
                  />
                  {errors.email && <span style={{ color: 'var(--critical)', fontSize: '0.78rem' }}>{errors.email}</span>}
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Address *</label>
                  <input
                    className="form-input"
                    placeholder="e.g. 12, Gandhi St, Chennai"
                    value={form.address}
                    onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                    autoComplete="off"
                  />
                  {errors.address && <span style={{ color: 'var(--critical)', fontSize: '0.78rem' }}>{errors.address}</span>}
                </div>
              </div>
            </div>

            {/* Category */}
            <div className="form-group">
              <label className="form-label">Issue Type *</label>
              <div className="form-select-wrap">
                <select
                  className="form-select"
                  value={form.category}
                  onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                >
                  <option value="">Select category</option>
                  {CATEGORIES.map(c => (
                    <option key={c} value={c}>{CATEGORY_ICONS[c]} {c}</option>
                  ))}
                </select>
              </div>
              {errors.category && <span style={{ color: 'var(--critical)', fontSize: '0.8rem' }}>{errors.category}</span>}
            </div>

            {/* Description */}
            <div className="form-group">
              <label className="form-label">Description *</label>
              <textarea
                className="form-textarea"
                placeholder="Describe the issue in detail..."
                value={form.description}
                maxLength={300}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                {errors.description
                  ? <span style={{ color: 'var(--critical)', fontSize: '0.8rem' }}>{errors.description}</span>
                  : <span />
                }
                <span className="char-count">{form.description.length}/300</span>
              </div>
            </div>

            {/* Location */}
            <div className="form-group">
              <label className="form-label">Location *</label>
              <div style={{ position: 'relative' }}>
                <input
                  className="form-input"
                  placeholder="Enter address or area"
                  value={form.location}
                  onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                  style={{ paddingRight: 44 }}
                  autoComplete="off"
                />
                <span style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)' }}>📍</span>
              </div>
              {errors.location && <span style={{ color: 'var(--critical)', fontSize: '0.8rem' }}>{errors.location}</span>}
            </div>

            {/* Photo */}
            <div className="form-group">
              <label className="form-label">Photo *</label>
              {preview ? (
                <div style={{ textAlign: 'center' }}>
                  <div className="upload-preview">
                    <img src={preview} alt="preview" />
                    <button
                      type="button"
                      className="upload-remove"
                      onClick={() => { setPhoto(null); setPreview(null); }}
                    >✕</button>
                  </div>
                </div>
              ) : (
                <div
                  className={`upload-zone${drag ? ' drag' : ''}`}
                  onDragOver={e => { e.preventDefault(); setDrag(true); }}
                  onDragLeave={() => setDrag(false)}
                  onDrop={handleDrop}
                  onClick={() => fileRef.current?.click()}
                >
                  <div className="icon">📷</div>
                  <p>Click or drag & drop a photo here</p>
                  <p style={{ fontSize: '0.75rem', marginTop: 4 }}>JPEG, PNG, WEBP up to 5MB</p>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    onChange={e => handleFile(e.target.files[0])}
                    style={{ display: 'none' }}
                  />
                </div>
              )}
              {errors.photo && <span style={{ color: 'var(--critical)', fontSize: '0.8rem', display: 'block', marginTop: '8px' }}>{errors.photo}</span>}
            </div>

            {errors.submit && (
              <div style={{ background: 'var(--critical-bg)', color: 'var(--critical)', padding: '12px 16px', borderRadius: 'var(--r-md)', fontSize: '0.875rem' }}>
                ❌ {errors.submit}
              </div>
            )}

            <button type="submit" className="btn btn-primary btn-lg" disabled={loading} style={{ width: '100%', justifyContent: 'center' }}>
              {loading ? <><span className="spinner" /> Submitting...</> : '📨 Submit Complaint'}
            </button>
          </form>
        </div>
      </div>

      {/* Success Modal */}
      {submitted && (
        <div className="modal-overlay" onClick={() => setSubmitted(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-icon">✅</div>
            <h2>Complaint Submitted!</h2>
            <p>Your issue has been registered and prioritized. Use the ID below to track it.</p>
            <div className="complaint-id-box">{submitted.complaintId}</div>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                className="btn btn-primary"
                onClick={() => { navigate(`/track?id=${submitted.complaintId}`); }}
              >
                Track My Complaint
              </button>
              <button
                className="btn btn-outline"
                onClick={() => {
                  setSubmitted(null);
                  setForm({ name: '', phone: '', email: '', address: '', category: '', description: '', location: '' });
                  setPhoto(null); setPreview(null);
                }}
              >
                Report Another
              </button>
            </div>
          </div>
        </div>
      )}
    </>
    </PageTransition>
  );
}
