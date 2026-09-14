import { createContext, useContext, useEffect, useState } from 'react';
import api from '../api';
const AuthCtx = createContext(null);
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('user') || 'null'));
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { setLoading(false); return; }
    api.get('/auth/me').then(r => setUser(r.data)).catch(() => { localStorage.removeItem('token'); localStorage.removeItem('user'); setUser(null); }).finally(() => setLoading(false));
  }, []);
  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('token', data.token); localStorage.setItem('user', JSON.stringify(data.user)); setUser(data.user);
  };
  const register = async (name, email, password) => {
    const { data } = await api.post('/auth/register', { name, email, password });
    return data;
  };
  const verifyEmail = async (email, code) => {
    const { data } = await api.post('/auth/verify-email', { email, code });
    localStorage.setItem('token', data.token); localStorage.setItem('user', JSON.stringify(data.user)); setUser(data.user);
  };
  const logout = () => { localStorage.removeItem('token'); localStorage.removeItem('user'); setUser(null); };
  return <AuthCtx.Provider value={{ user, loading, login, register, verifyEmail, logout }}>{children}</AuthCtx.Provider>;
};
export const useAuth = () => useContext(AuthCtx);
