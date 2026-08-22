import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api/client';
import { useNotification } from './NotificationContext';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const notify = useNotification();

  const fetchCurrentUser = async () => {
    const token = localStorage.getItem('globetrotter_token');
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const data = await api.getMe();
      setUser(data.user);
      setStats(data.stats);
    } catch (err) {
      console.warn('Session expired or invalid:', err);
      localStorage.removeItem('globetrotter_token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const login = async (email, password) => {
    try {
      const data = await api.login(email, password);
      localStorage.setItem('globetrotter_token', data.token);
      setUser(data.user);
      await fetchCurrentUser();
      notify.success(`Welcome back, ${data.user.name}!`);
      return data;
    } catch (err) {
      notify.error(err.message || 'Login failed');
      throw err;
    }
  };

  const demoLogin = async (role = 'user') => {
    try {
      const data = await api.demoLogin(role);
      localStorage.setItem('globetrotter_token', data.token);
      setUser(data.user);
      await fetchCurrentUser();
      notify.success(`Demo access enabled as ${data.user.name} (${data.user.role})!`);
      return data;
    } catch (err) {
      notify.error(err.message || 'Demo login failed');
      throw err;
    }
  };

  const register = async (name, email, password, currency) => {
    try {
      const data = await api.register(name, email, password, currency);
      localStorage.setItem('globetrotter_token', data.token);
      setUser(data.user);
      await fetchCurrentUser();
      notify.success('Account created successfully! Welcome to GlobeTrotter.');
      return data;
    } catch (err) {
      notify.error(err.message || 'Registration failed');
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('globetrotter_token');
    setUser(null);
    setStats(null);
    notify.info('Logged out safely');
  };

  const updateProfile = async (profileData) => {
    try {
      const data = await api.updateProfile(profileData);
      setUser(data.user);
      notify.success('Profile preferences updated!');
      return data.user;
    } catch (err) {
      notify.error(err.message || 'Failed to update profile');
      throw err;
    }
  };

  const refreshStats = async () => {
    if (localStorage.getItem('globetrotter_token')) {
      try {
        const data = await api.getMe();
        setStats(data.stats);
        setUser(data.user);
      } catch (e) {}
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        stats,
        loading,
        login,
        demoLogin,
        register,
        logout,
        updateProfile,
        refreshStats
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
