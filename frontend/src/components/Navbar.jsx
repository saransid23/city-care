import { NavLink, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Navbar() {
  const { isAdmin, logout, user, citizenLogout } = useAuth();
  const navigate = useNavigate();

  const NAV = [
    { to: '/', label: 'Home', icon: '🏠' },
    { to: '/report', label: 'Report Issue', icon: '📋' },
    { to: '/track', label: 'Track', icon: '🔍' },
  ];

  const handleAdminLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  const handleCitizenLogout = () => {
    citizenLogout();
    navigate('/', { replace: true });
  };

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <NavLink to="/" className="navbar-logo">
          <img src="/logo.png" alt="CityCare" style={{ width: 34, height: 34, borderRadius: 8, objectFit: 'contain' }} className="navbar-logo-icon" />
          <span>CityCare</span>
        </NavLink>
        <div className="navbar-nav">
          {NAV.map(({ to, label, icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) => (isActive ? 'active' : '')}
            >
              <span>{icon}</span>
              <span>{label}</span>
            </NavLink>
          ))}

          {isAdmin ? (
            <>
              <NavLink
                to="/dashboard"
                className={({ isActive }) => (isActive ? 'active' : '')}
              >
                <span>📊</span>
                <span>Dashboard</span>
              </NavLink>
              <button className="btn btn-ghost btn-sm navbar-logout" onClick={handleAdminLogout}>
                🚪 Admin Logout
              </button>
            </>
          ) : user ? (
            <>
              <span style={{ color: 'var(--text-2)', fontSize: '0.9rem', fontWeight: '500', padding: '0 8px' }}>
                👤 {user.name?.split(' ')[0]}
              </span>
              <button className="btn btn-ghost btn-sm navbar-logout" onClick={handleCitizenLogout}>
                🚪 Logout
              </button>
            </>
          ) : (
            <>
              <NavLink
                to="/admin/login"
                className={({ isActive }) => (isActive ? 'active navbar-admin-link' : 'navbar-admin-link')}
              >
                <span>🛡️</span>
                <span>Admin</span>
              </NavLink>
              <Link to="/login" className="btn btn-primary" style={{ padding: '8px 18px', fontSize: '0.88rem' }}>
                Login
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
