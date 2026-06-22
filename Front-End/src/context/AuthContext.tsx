import React, { createContext, useContext, useState, useCallback } from 'react';

export type AuthState = {
  isLoggedIn: boolean;
  role: string | null;
  system: string | null;
};

type AuthContextValue = AuthState & {
  login: (role: string, system?: string) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [auth, setAuth] = useState<AuthState>({
    isLoggedIn: true,
    role: 'Research Coordinator',
    system: 'Scheduling',
  });

  const login = useCallback((role: string, system?: string) => {
    setAuth({ isLoggedIn: true, role, system: system ?? null });
  }, []);

  const logout = useCallback(() => {
    setAuth({ isLoggedIn: false, role: null, system: null });
  }, []);

  return (
    <AuthContext.Provider value={{ ...auth, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
