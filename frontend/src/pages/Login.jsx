import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import PageTransition from '../components/PageTransition';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { citizenLogin } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const res = await citizenLogin(email, password);
    if (res.success) {
      navigate('/report');
    } else {
      setError(res.error);
    }
    setLoading(false);
  };

  return (
    <PageTransition>
      <div className="page container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div className="report-form-glass" style={{ width: '100%', maxWidth: '440px' }}>
          <h2 className="animate-slide-up" style={{ textAlign: 'center', marginBottom: '8px' }}>Citizen Login</h2>
          <p className="animate-slide-up delay-1" style={{ textAlign: 'center', marginBottom: '32px', color: 'rgba(203,213,225,0.7)' }}>Sign in to report issues in your neighborhood</p>
          
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="form-group animate-slide-up delay-2">
              <label className="form-label">Email</label>
              <input type="email" required className="form-input" value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <div className="form-group animate-slide-up delay-3">
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <input type={showPassword ? "text" : "password"} required className="form-input" value={password} onChange={e => setPassword(e.target.value)} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--primary)' }}>
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>
            
            {error && <div className="animate-slide-up delay-4" style={{ color: 'var(--critical)', fontSize: '0.85rem' }}>{error}</div>}
            
            <button type="submit" className="btn btn-primary animate-slide-up delay-4" style={{ width: '100%', justifyContent: 'center', marginTop: '12px' }} disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </button>
            
            <p className="animate-slide-up delay-5" style={{ textAlign: 'center', marginTop: '16px', fontSize: '0.9rem' }}>
              Don't have an account? <Link to="/register" style={{ color: 'var(--primary)', fontWeight: '600' }}>Sign up</Link>
            </p>
          </form>
        </div>
      </div>
    </PageTransition>
  );
}
