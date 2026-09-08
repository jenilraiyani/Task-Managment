import { createContext, useState, useEffect } from 'react';
import api from '../services/api';

export const AuthContext = createContext();

const normalizeUser = (raw) => {
  if (!raw) return null;
  return {
    ...raw,
    id: raw.id ?? raw.Id,
    name: raw.name ?? raw.Name ?? '',
    email: raw.email ?? raw.Email ?? '',
  };
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const res = await api.get('/auth/me');
          setUser(normalizeUser(res.data.data));
        } catch (error) {
          console.error('Failed to fetch user', error);
          localStorage.removeItem('token');
        }
      }
      setLoading(false);
    };
    fetchUser();
  }, []);

  const login = (userData, token) => {
    localStorage.setItem('token', token);
    setUser(normalizeUser(userData));
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
