import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { saveEvaluationAPI, fetchAllEvaluations } from '../services/evaluationService';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PanelistEvaluation {
  /** The group this evaluation belongs to */
  groupId: string;
  /** Display name of the panelist / chairman */
  panelist: string;
  /** Computed total score (0 – maxCombined) */
  totalScore: number;
  /** General remarks / comments entered at the bottom of the form */
  comments: string;
  /** ISO timestamp of submission */
  submittedAt: string;
  /** Raw per-criterion scores keyed by criterion id */
  criterionScores: Record<string, number>;
  /** Raw per-criterion comments keyed by criterion id */
  criterionComments: Record<string, string>;
  /** Per-student oral-defense scores */
  studentPresentationScores: Array<{
    studentName: string;
    scores: Record<string, number>;
    comments: Record<string, string>;
  }>;
  /** Chairman approval decision (e.g. 'approved-no-revisions') */
  approvalDecision?: string;
}

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
  /** All chairman / panelist evaluations submitted during this session */
  evaluations: PanelistEvaluation[];
  /** Upsert a chairman evaluation (one per groupId) */
  saveEvaluation: (evaluation: PanelistEvaluation) => Promise<void>;
  /** Look up the evaluation for a specific group, if any */
  getEvaluationForGroup: (groupId: string) => PanelistEvaluation | undefined;
}

const AppDataContext = createContext<AppDataContextValue | undefined>(undefined);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AppDataProvider({ children }: { children: ReactNode }) {
  const [reports, setReports] = useState<GeneratedReport[]>([]);
  const [evaluations, setEvaluations] = useState<PanelistEvaluation[]>([]);
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

  useEffect(() => {
    async function initEvals() {
      const res = await fetchAllEvaluations();
      if (res.success && res.data) {
        setEvaluations(res.data);
      }
    }
    initEvals();
  }, []);

  const saveEvaluation = useCallback(async (evaluation: PanelistEvaluation) => {
    const res = await saveEvaluationAPI(evaluation);
    if (res.success && res.data) {
      setEvaluations((prev) => {
        const idx = prev.findIndex((e) => e.groupId === evaluation.groupId && e.panelist === evaluation.panelist);
        if (idx !== -1) {
          const updated = [...prev];
          updated[idx] = res.data!;
          return updated;
        }
        return [res.data!, ...prev];
      });
    } else {
      // Fallback to local state if API fails
      setEvaluations((prev) => {
        const idx = prev.findIndex((e) => e.groupId === evaluation.groupId && e.panelist === evaluation.panelist);
        if (idx !== -1) {
          const updated = [...prev];
          updated[idx] = evaluation;
          return updated;
        }
        return [evaluation, ...prev];
      });
    }
  }, []);

  const getEvaluationForGroup = useCallback(
    (groupId: string) => evaluations.find((e) => e.groupId === groupId),
    [evaluations]
  );

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
    <AppDataContext.Provider
      value={{ reports, addReport, activities, logActivity, evaluations, saveEvaluation, getEvaluationForGroup }}
    >
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
