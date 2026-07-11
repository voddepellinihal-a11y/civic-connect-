import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '../api/client';
import { User, AuthResponse } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { fullName: string; email: string; phone?: string; password: string; confirmPassword: string }) => Promise<void>;
  logout: () => void;
  isAdmin: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>(null!);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('jal_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      api.get('/auth/me')
        .then(r => { setUser(r.data); setLoading(false); })
        .catch(() => { localStorage.removeItem('jal_token'); setToken(null); setLoading(false); });
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = async (email: string, password: string) => {
    const res = await api.post<AuthResponse>('/auth/login', { email, password });
    localStorage.setItem('jal_token', res.data.token);
    setToken(res.data.token);
    setUser({ id: res.data.userId, email: res.data.email, fullName: res.data.fullName, role: res.data.role as any, createdAt: '' });
  };

  const register = async (data: { fullName: string; email: string; phone?: string; password: string; confirmPassword: string }) => {
    const res = await api.post<AuthResponse>('/auth/register', data);
    localStorage.setItem('jal_token', res.data.token);
    setToken(res.data.token);
    setUser({ id: res.data.userId, email: res.data.email, fullName: res.data.fullName, role: res.data.role as any, createdAt: '' });
  };

  const logout = () => {
    localStorage.removeItem('jal_token');
    localStorage.removeItem('jal_user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, isAdmin: user?.role === 'ADMIN', loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
