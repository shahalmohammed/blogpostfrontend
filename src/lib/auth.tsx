'use client';

import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import { api } from './api';
import type { User } from './types';

type AuthCtx = {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshMe: () => Promise<void>;
};

const C = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [tok, setTok] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // hydrate from localStorage on mount
  useEffect(() => {
    const t = localStorage.getItem('token');
    const u = localStorage.getItem('user');
    if (t) setTok(t);
    if (u) setUser(JSON.parse(u) as User);
    setLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const r = await api<{ success: boolean; data: { user: User; token: string } }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    localStorage.setItem('token', r.data.token);
    localStorage.setItem('user', JSON.stringify(r.data.user));
    setTok(r.data.token);
    setUser(r.data.user);
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    const r = await api<{ success: boolean; data: { user: User; token: string } }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password })
    });
    localStorage.setItem('token', r.data.token);
    localStorage.setItem('user', JSON.stringify(r.data.user));
    setTok(r.data.token);
    setUser(r.data.user);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setTok(null);
    setUser(null);
  }, []);

  const refreshMe = useCallback(async () => {
    if (!tok) return;
    const r = await api<{ success: boolean; data: { user: User } }>('/auth/me');
    localStorage.setItem('user', JSON.stringify(r.data.user));
    setUser(r.data.user);
  }, [tok]);

  const value = useMemo(
    () => ({ user, token: tok, loading, login, register, logout, refreshMe }),
    [user, tok, loading, login, register, logout, refreshMe]
  );

  return <C.Provider value={value}>{children}</C.Provider>;
}

export function useAuth() {
  const v = useContext(C);
  if (!v) throw new Error('useAuth must be used inside AuthProvider');
  return v;
}
