import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import PageTransition from '../components/PageTransition';

export default function Register() {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', phone: '', address: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { citizenRegister } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const res = await citizenRegister(formData);
    if (res.success) {
      navigate('/report');
    } else {
      setError(res.error);
    }
    setLoading(false);
  };

  const handleChange = (e) => setFormData(f => ({ ...f, [e.target.name]: e.target.value }));

  return (
    <PageTransition>
      <div className="page container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '40px 24px' }}>
        <div className="report-form-glass" style={{ width: '100%', maxWidth: '500px' }}>
          <h2 className="animate-slide-up" style={{ textAlign: 'center', marginBottom: '8px' }}>Create an Account</h2>
          <p className="animate-slide-up delay-1" style={{ textAlign: 'center', marginBottom: '32px', color: 'rgba(203,213,225,0.7)' }}>Join to report and track issues in your area.</p>
          
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="form-group animate-slide-up delay-2">
              <label className="form-label">Full Name</label>
              <input type="text" name="name" required className="form-input" value={formData.name} onChange={handleChange} />
            </div>
            <div className="form-group animate-slide-up delay-2">
              <label className="form-label">Email</label>
              <input type="email" name="email" required className="form-input" value={formData.email} onChange={handleChange} />
            </div>
            <div className="form-group animate-slide-up delay-3">
              <label className="form-label">Password</label>
              <input type="password" name="password" required className="form-input" value={formData.password} onChange={handleChange} />
            </div>
            <div className="form-group animate-slide-up delay-3">
              <label className="form-label">Phone Number</label>
              <input type="tel" name="phone" required className="form-input" value={formData.phone} onChange={handleChange} />
            </div>
            <div className="form-group animate-slide-up delay-4">
              <label className="form-label">Home Address</label>
              <textarea name="address" required className="form-textarea" rows="2" value={formData.address} onChange={handleChange} />
            </div>
            
            {error && <div className="animate-slide-up delay-5" style={{ color: 'var(--critical)', fontSize: '0.85rem' }}>{error}</div>}
            
            <button type="submit" className="btn btn-primary animate-slide-up delay-5" style={{ width: '100%', justifyContent: 'center', marginTop: '12px' }} disabled={loading}>
              {loading ? 'Creating account...' : 'Register'}
            </button>
            
            <p className="animate-slide-up delay-5" style={{ textAlign: 'center', marginTop: '16px', fontSize: '0.9rem' }}>
              Already have an account? <Link to="/login" style={{ color: 'var(--primary)', fontWeight: '600' }}>Login</Link>
            </p>
          </form>
        </div>
      </div>
    </PageTransition>
  );
}
