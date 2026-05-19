// src/services/reportService.ts
// Handles all API calls to the consolidated reports backend

// ── Base URL ──────────────────────────────────────────────────────────────────
// Update this to your PHP server address (e.g. XAMPP/WAMP localhost)
const API_BASE = 'http://localhost/post-evaluation-api/API/consolidated_reports.php';
// ── Types (mirroring AppDataContext) ─────────────────────────────────────────
export interface ReportPayload {
  group_id: string;
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

// ── Save / update report (POST) ───────────────────────────────────────────────
export async function saveReport(payload: ReportPayload): Promise<{ success: boolean; message: string; data?: any }> {
  try {
    const response = await fetch(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const json = await response.json();
    return json;
  } catch (error) {
    console.error('[saveReport] Network error:', error);
    return { success: false, message: 'Network error. Could not reach the server.' };
  }
}

// ── Fetch all reports (GET) ───────────────────────────────────────────────────
export async function fetchAllReports(): Promise<{ success: boolean; data?: any[]; message?: string }> {
  try {
    const response = await fetch(API_BASE);
    const json = await response.json();
    return json;
  } catch (error) {
    console.error('[fetchAllReports] Network error:', error);
    return { success: false, message: 'Network error.' };
  }
}

// ── Fetch report by group ID (GET ?group_id=) ─────────────────────────────────
export async function fetchReportByGroupId(groupId: string): Promise<{ success: boolean; data?: any; message?: string }> {
  try {
    const response = await fetch(`${API_BASE}?group_id=${encodeURIComponent(groupId)}`);
    const json = await response.json();
    return json;
  } catch (error) {
    console.error('[fetchReportByGroupId] Network error:', error);
    return { success: false, message: 'Network error.' };
  }
}

// ── Delete a report (DELETE ?id=) ─────────────────────────────────────────────
export async function deleteReport(id: number): Promise<{ success: boolean; message: string }> {
  try {
    const response = await fetch(`${API_BASE}?id=${id}`, { method: 'DELETE' });
    const json = await response.json();
    return json;
  } catch (error) {
    console.error('[deleteReport] Network error:', error);
    return { success: false, message: 'Network error.' };
  }
}
