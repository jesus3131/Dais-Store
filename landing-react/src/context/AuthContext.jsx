import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { api, setToken, clearToken } from '../services/api.js';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => sessionStorage.getItem('admin_user'));
  const [role, setRole] = useState(() => sessionStorage.getItem('admin_role'));
  const [modules, setModules] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem('admin_modules')); } catch { return []; }
  });

  useEffect(() => {
    const handler = () => { setUser(null); setRole(null); setModules([]); };
    window.addEventListener('auth:logout', handler);
    return () => window.removeEventListener('auth:logout', handler);
  }, []);

  const login = useCallback(async (username, password) => {
    try {
      const data = await api.loginUser(username, password);
      sessionStorage.setItem('admin_user', data.username);
      sessionStorage.setItem('admin_token', data.token);
      sessionStorage.setItem('admin_role', data.role || 'worker');
      sessionStorage.setItem('admin_modules', JSON.stringify(data.modules || []));
      setToken(data.token);
      setUser(data.username);
      setRole(data.role || 'worker');
      setModules(data.modules || []);
      return true;
    } catch {
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    sessionStorage.removeItem('admin_user');
    sessionStorage.removeItem('admin_token');
    sessionStorage.removeItem('admin_role');
    sessionStorage.removeItem('admin_modules');
    clearToken();
    setUser(null);
    setRole(null);
    setModules([]);
  }, []);

  return (
    <AuthContext.Provider value={{ user, role, modules, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
