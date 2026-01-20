"use client";

import { createContext, useState, useEffect, type ReactNode } from 'react';
import Cookies from 'js-cookie';
import { api } from '@/lib/api';
import type { User } from '@/types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string, role?: 'user' | 'business_owner') => Promise<void>;
  googleLogin: (credential: string, userType?: 'customer' | 'business_owner', businessName?: string, instagramHandle?: string, phone?: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isBusinessOwner: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  // Initialize token from cookies after mount (avoid SSR hydration issues)
  useEffect(() => {
    setMounted(true);
    const savedToken = Cookies.get('token');
    if (savedToken) {
      setToken(savedToken);
    } else {
      setLoading(false);
    }
  }, []);

  // Set up API interceptor to include token in requests
  useEffect(() => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete api.defaults.headers.common['Authorization'];
    }
  }, [token]);

  // Load user on mount if token exists
  useEffect(() => {
    async function loadUser() {
      if (token && mounted) {
        try {
          const { data } = await api.get('/auth/me');
          setUser(data.data);
        } catch (error) {
          // Token is invalid, clear it
          Cookies.remove('token');
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    }

    if (mounted) {
      loadUser();
    }
  }, [token, mounted]);

  const login = async (email: string, password: string) => {
    const { data } = await api.post('/auth/login', { email, password });
    setUser(data.data.user);
    setToken(data.data.token);

    // Store token in cookie (expires in 7 days)
    Cookies.set('token', data.data.token, {
      expires: 7,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production'
    });
  };

  const register = async (email: string, password: string, name: string, role: 'user' | 'business_owner' = 'user') => {
    const { data } = await api.post('/auth/register', { email, password, name, role });
    setUser(data.data.user);
    setToken(data.data.token);

    // Store token in cookie (expires in 7 days)
    Cookies.set('token', data.data.token, {
      expires: 7,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production'
    });
  };

  const googleLogin = async (credential: string, userType?: 'customer' | 'business_owner', businessName?: string, instagramHandle?: string, phone?: string) => {
    const { data } = await api.post('/auth/google', {
      credential,
      userType,
      businessName,
      instagramHandle,
      phone,
    });
    setUser(data.data.user);
    setToken(data.data.token);

    // Store token in cookie (expires in 7 days)
    Cookies.set('token', data.data.token, {
      expires: 7,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production'
    });
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    Cookies.remove('token');

    // Clear Google session to prevent auto-select
    if (typeof window !== 'undefined' && window.google) {
      window.google.accounts.id.disableAutoSelect();
    }
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    googleLogin,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isBusinessOwner: user?.role === 'business_owner' || user?.role === 'admin',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
