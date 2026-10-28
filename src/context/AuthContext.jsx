import React, { createContext, useContext, useState, useEffect } from 'react';
import API from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('makhana_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyUser = async () => {
      const token = localStorage.getItem('makhana_token');
      if (token) {
        try {
          const res = await API.get('/auth/profile');
          setUser(res.data);
          localStorage.setItem('makhana_user', JSON.stringify(res.data));
        } catch (err) {
          console.error('Session expired', err);
          logout();
        }
      }
      setLoading(false);
    };
    verifyUser();
  }, []);

  const login = async (email, password) => {
    const res = await API.post('/auth/login', { email, password });
    localStorage.setItem('makhana_token', res.data.token);
    localStorage.setItem('makhana_user', JSON.stringify(res.data));
    setUser(res.data);
    return res.data;
  };

  const register = async (userData) => {
    const res = await API.post('/auth/register', userData);
    localStorage.setItem('makhana_token', res.data.token);
    localStorage.setItem('makhana_user', JSON.stringify(res.data));
    setUser(res.data);
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('makhana_token');
    localStorage.removeItem('makhana_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
