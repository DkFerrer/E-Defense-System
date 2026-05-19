import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface GeneratedReport {
  id: string;
  groupId: string;
  groupTitle: string;
  members: string[];
  adviser: string;
  program: string;
  department: string;
  defenseDate: string;
  stage: string;
  totalFinalGrade: number;
  gradeLabel: string;
  chairName: string;
  chairVerdict: string;
  chairApproved: boolean;
  dateFinalized: string;
  panelists: Array<{
    name: string;
    score: number;
    remarks: string;
    isChair: boolean;
  }>;
}

export interface ActivityEntry {
  id: string;
  timestamp: string;
  action: string;
  details: string;
  icon: string;
  color: string;
}

// ─── Context ──────────────────────────────────────────────────────────────────

interface AppDataContextValue {
  reports: GeneratedReport[];
  addReport: (report: GeneratedReport) => void;
  activities: ActivityEntry[];
  logActivity: (action: string, details: string, icon?: string, color?: string) => void;
}

const AppDataContext = createContext<AppDataContextValue | undefined>(undefined);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AppDataProvider({ children }: { children: ReactNode }) {
  const [reports, setReports] = useState<GeneratedReport[]>([]);
  const [activities, setActivities] = useState<ActivityEntry[]>([
    {
      id: 'init',
      timestamp: new Date().toISOString(),
      action: 'Session Started',
      details: 'User logged into the Post-Evaluation system.',
      icon: 'log-in-outline',
      color: '#2563EB',
    },
  ]);

  const addReport = useCallback((report: GeneratedReport) => {
    setReports((prev) => {
      // Replace if same group already has a report, otherwise prepend
      const exists = prev.findIndex((r) => r.groupId === report.groupId);
      if (exists !== -1) {
        const updated = [...prev];
        updated[exists] = report;
        return updated;
      }
      return [report, ...prev];
    });
  }, []);

  const logActivity = useCallback(
    (action: string, details: string, icon = 'information-circle-outline', color = '#374151') => {
      const entry: ActivityEntry = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        action,
        details,
        icon,
        color,
      };
      setActivities((prev) => [entry, ...prev]);
    },
    []
  );

  return (
    <AppDataContext.Provider value={{ reports, addReport, activities, logActivity }}>
      {children}
    </AppDataContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAppData() {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error('useAppData must be used within AppDataProvider');
  return ctx;
}
