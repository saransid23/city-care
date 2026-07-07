import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { loginUser, registerUser, getMe } from '../api/auth';

const AuthContext = createContext(null);

// Admin credentials
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'citycare@2024';
const STORAGE_KEY_ADMIN = 'citycare_admin_auth';
const STORAGE_KEY_USER = 'citycare_user_token';

export function AuthProvider({ children }) {
  const [isAdmin, setIsAdmin] = useState(() => sessionStorage.getItem(STORAGE_KEY_ADMIN) === 'true');
  
  // Citizen state
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem(STORAGE_KEY_USER) || null);
  const [loading, setLoading] = useState(true); // For initial load

  // Load user data if token exists
  useEffect(() => {
    const loadUser = async () => {
      if (token) {
        try {
          const res = await getMe(token);
          setUser(res.data);
        } catch (error) {
          console.error('Failed to load user', error);
          setToken(null);
          localStorage.removeItem(STORAGE_KEY_USER);
        }
      }
      setLoading(false);
    };
    loadUser();
  }, [token]);

  // Admin login
  const login = useCallback((username, password) => {
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      setIsAdmin(true);
      sessionStorage.setItem(STORAGE_KEY_ADMIN, 'true');
      return { success: true };
    }
    return { success: false, error: 'Invalid username or password.' };
  }, []);

  const logout = useCallback(() => {
    setIsAdmin(false);
    sessionStorage.removeItem(STORAGE_KEY_ADMIN);
  }, []);

  // Citizen login
  const citizenLogin = useCallback(async (email, password) => {
    try {
      const res = await loginUser({ email, password });
      setToken(res.data.token);
      setUser(res.data);
      localStorage.setItem(STORAGE_KEY_USER, res.data.token);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.error || 'Login failed' };
    }
  }, []);

  // Citizen register
  const citizenRegister = useCallback(async (userData) => {
    try {
      const res = await registerUser(userData);
      setToken(res.data.token);
      setUser(res.data);
      localStorage.setItem(STORAGE_KEY_USER, res.data.token);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.error || 'Registration failed' };
    }
  }, []);

  const citizenLogout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem(STORAGE_KEY_USER);
  }, []);

  return (
    <AuthContext.Provider value={{
      isAdmin, login, logout,
      user, token, loading, citizenLogin, citizenRegister, citizenLogout
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
