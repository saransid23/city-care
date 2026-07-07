import { useState, useEffect, useRef } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import UserProtectedRoute from './components/UserProtectedRoute';
import { ToastContainer } from './components/Toast';
import Home from './pages/Home';
import ReportIssue from './pages/ReportIssue';
import Track from './pages/Track';
import Dashboard from './pages/Dashboard';
import AdminLogin from './pages/AdminLogin';
import Login from './pages/Login';
import Register from './pages/Register';
import Footer from './components/Footer';
import InfoPage from './pages/InfoPage';

function PageLoader() {
  const [loading, setLoading] = useState(true);
  const [render, setRender] = useState(true);
  
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1200);
    const renderTimer = setTimeout(() => setRender(false), 1700);
    return () => { clearTimeout(timer); clearTimeout(renderTimer); };
  }, []);

  if (!render) return null;
  return (
    <div className={`page-loader ${!loading ? 'fade-out' : ''}`}>
      <img src="/logo.png" alt="CityCare" style={{ width: 100, height: 100, borderRadius: '50%', animation: 'logoEntrance 1s cubic-bezier(0.16, 1, 0.3, 1) both' }} />
      <h2 style={{ marginTop: 24, color: '#F1F5F9', letterSpacing: '0.05em', animation: 'heroFadeUp 0.8s 0.2s both' }}>CityCare</h2>
    </div>
  );
}

export default function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const isDashboard = location.pathname.startsWith('/dashboard');
  const hasRedirected = useRef(false);

  // On every fresh page load (refresh), redirect to home
  useEffect(() => {
    if (!hasRedirected.current && location.pathname !== '/') {
      hasRedirected.current = true;
      navigate('/', { replace: true });
    } else {
      hasRedirected.current = true;
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Scroll to top on every route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          document.documentElement.style.setProperty('--scroll-y', `${window.scrollY}px`);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Bidirectional scroll reveal — adds .visible when entering, removes when leaving
  useEffect(() => {
    const revealEls = document.querySelectorAll('.reveal, .reveal-stagger');
    if (!revealEls.length) return;

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

    revealEls.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [location.pathname]);

  return (
    <AuthProvider>
      <div className="parallax-bg" />
      <PageLoader />
      {!isDashboard && <Navbar />}
      <ToastContainer />
      <div key={location.pathname} className="page-transition">
        <Routes location={location}>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route 
          path="/report" 
          element={
            <UserProtectedRoute>
              <ReportIssue />
            </UserProtectedRoute>
          } 
        />
        <Route path="/track" element={<Track />} />
        <Route path="/info/:pageId" element={<InfoPage />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        </Routes>
      </div>
      {!isDashboard && <Footer />}
    </AuthProvider>
  );
}

