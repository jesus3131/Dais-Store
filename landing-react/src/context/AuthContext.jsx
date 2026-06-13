import { createContext, useContext, useState, useCallback } from 'react';

const AuthContext = createContext();

const ADMIN_USER = 'admin';
const ADMIN_PASS = 'dais2024';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => sessionStorage.getItem('admin_user'));

  const login = useCallback((username, password) => {
    if (username === ADMIN_USER && password === ADMIN_PASS) {
      sessionStorage.setItem('admin_user', username);
      setUser(username);
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    sessionStorage.removeItem('admin_user');
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
