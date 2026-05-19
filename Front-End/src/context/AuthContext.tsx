import React, { createContext, useContext, useState, ReactNode } from 'react';

export type UserRole =
  | 'Research Coordinator'
  | 'Dean'
  | 'Panelist'
  | 'Adviser'
  | 'Student'
  | null;

export type SystemType =
  | 'Scheduling System'
  | 'Post Evaluation System'
  | null;

export interface AuthUser {
  role: UserRole;
  system: SystemType;
  name: string;
  title: string;
}

interface AuthContextType {
  user: AuthUser | null;
  login: (role: string, system?: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: () => {},
  logout: () => {},
  isAuthenticated: false,
});

const roleDisplay: Record<string, { name: string; title: string }> = {
  'Research Coordinator': { name: 'Admin User', title: 'Research Coordinator' },
  'Dean': { name: 'Andrey Santos Quintela', title: 'Dean' },
  'Panelist': { name: 'Dr. Maria Santos', title: 'Panelist' },
  'Adviser': { name: 'Prof. Reyes', title: 'Adviser' },
  'Student': { name: 'Juan Dela Cruz', title: 'Student' },
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);

  const login = (role: string, system?: string) => {
    const display = roleDisplay[role] ?? { name: 'User', title: role };
    setUser({
      role: role as UserRole,
      system: (system as SystemType) ?? null,
      name: display.name,
      title: display.title,
    });
  };

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
