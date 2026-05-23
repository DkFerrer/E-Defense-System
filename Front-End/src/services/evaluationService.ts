// src/services/evaluationService.ts
// Handles API calls for individual PanelistEvaluations

import { PanelistEvaluation } from '../context/AppDataContext';

// Update this to match your PHP server address if needed
const API_BASE = 'http://localhost/post-evaluation-api/API/panelist_evaluations.php';

export async function saveEvaluationAPI(payload: PanelistEvaluation): Promise<{ success: boolean; message: string; data?: PanelistEvaluation }> {
  try {
    const response = await fetch(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const json = await response.json();
    return json;
  } catch (error) {
    console.error('[saveEvaluationAPI] Network error:', error);
    return { success: false, message: 'Network error. Could not reach the server.' };
  }
}

export async function fetchAllEvaluations(): Promise<{ success: boolean; data?: PanelistEvaluation[]; message?: string }> {
  try {
    const response = await fetch(API_BASE);
    const json = await response.json();
    return json;
  } catch (error) {
    console.error('[fetchAllEvaluations] Network error:', error);
    return { success: false, message: 'Network error.' };
  }
}

export async function fetchEvaluationsByGroupId(groupId: string): Promise<{ success: boolean; data?: PanelistEvaluation[]; message?: string }> {
  try {
    const response = await fetch(`${API_BASE}?group_id=${encodeURIComponent(groupId)}`);
    const json = await response.json();
    return json;
  } catch (error) {
    console.error('[fetchEvaluationsByGroupId] Network error:', error);
    return { success: false, message: 'Network error.' };
  }
}
