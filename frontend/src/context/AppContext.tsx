import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { isMockBackend } from '../config/backendMode';
import { findMockAccount, getSampleEvaluations } from '../data/sampleDataset';
import api, { setBearerToken, formatApiError } from '../services/api';

const AppContext = createContext(null);

const DEMO_USER = {
  id: 'panelist-1',
  name: 'Dr. Maria Santos',
  email: 'panelist@unc.edu.ph',
  role: 'Faculty',
  roleLabel: 'Panel Member',
  department: 'School of Computer and Information Sciences',
  position: 'Not specified',
  status: 'Active',
  accountType: 'Faculty',
};

export function AppProvider({ children }) {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [evaluations, setEvaluations] = useState([]);
  const [evaluationsLoading, setEvaluationsLoading] = useState(false);
  const [evaluationsError, setEvaluationsError] = useState(null);

  const login = useCallback(async ({ username, password, role, system }) => {
    if (isMockBackend()) {
      const row = findMockAccount(username, password);
      if (!row) {
        throw new Error('These credentials do not match our records.');
      }
      const token = 'mock-session';
      setBearerToken(token);
      setToken(token);
      const userPayload = {
        ...row.user,
        loginRole: role,
        selectedSystem: system ?? null,
      };
      setUser(userPayload);
      return { token, user: userPayload };
    }
    const { data } = await api.post('/login.php', { username, password, role, system });
    setBearerToken(data.token);
    setToken(data.token);
    setUser(data.user ?? { ...DEMO_USER, name: data.user?.name ?? username });
    return data;
  }, []);

  const logout = useCallback(() => {
    setBearerToken(null);
    setToken(null);
    setUser(null);
    setEvaluations([]);
  }, []);

  const refreshEvaluations = useCallback(async () => {
    setEvaluationsLoading(true);
    setEvaluationsError(null);
    try {
      if (isMockBackend()) {
        setEvaluations(getSampleEvaluations());
        return;
      }
      const { data } = await api.get('/evaluations');
      const list = Array.isArray(data?.data) ? data.data : data;
      setEvaluations(Array.isArray(list) ? list : []);
    } catch (e) {
      setEvaluationsError(formatApiError(e, 'Failed to load evaluations'));
      setEvaluations([]);
    } finally {
      setEvaluationsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (token) {
      setBearerToken(token);
      refreshEvaluations();
    }
  }, [token, refreshEvaluations]);

  const value = useMemo(
    () => ({
      token,
      user: user ?? (token ? DEMO_USER : null),
      login,
      logout,
      evaluations,
      evaluationsLoading,
      evaluationsError,
      refreshEvaluations,
      setEvaluations,
    }),
    [token, user, login, logout, evaluations, evaluationsLoading, evaluationsError, refreshEvaluations]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
