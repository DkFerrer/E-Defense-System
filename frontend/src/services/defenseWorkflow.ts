import AsyncStorage from '@react-native-async-storage/async-storage';

const EVALUATIONS_KEY = 'workflow_panelist_evaluations';

/**
 * Workflow bridge — persist panelist evaluations (local + optional remote later).
 * @param {Record<string, unknown>} evaluation
 */
export async function submitPanelistEvaluation(evaluation) {
  try {
    const saved = await AsyncStorage.getItem(EVALUATIONS_KEY);
    const prev = saved ? JSON.parse(saved) : [];
    prev.push(evaluation);
    await AsyncStorage.setItem(EVALUATIONS_KEY, JSON.stringify(prev));
  } catch (error) {
    console.error('Error submitting evaluation:', error);
  }
}

/**
 * Get all evaluations submitted by a specific panelist.
 * @param {string} panelistId
 */
export async function getEvaluationsByPanelist(panelistId) {
  try {
    const saved = await AsyncStorage.getItem(EVALUATIONS_KEY);
    const all = saved ? JSON.parse(saved) : [];
    return all.filter(e => e.panelistId === panelistId);
  } catch {
    return [];
  }
}

/**
 * Get defense bookings. In a real app, this would be an API call.
 */
export function getDefenseBookings() {
  // Returning sample data that matches the workflow structure
  return [
    {
      id: 'RG-001',
      researchTitle: 'AI-Powered Learning Management System',
      members: ['John Doe', 'Jane Smith', 'Bob Johnson'],
      adviserName: 'Dr. Maria Santos',
      department: 'SCIS',
      defenseType: 'Title Defense',
      requestedDate: '2024-12-20',
      requestedTime: '10:00 AM',
      venue: 'Room 301, CS Building',
      status: 'approved',
      assignedPanelists: [
        { id: '1', name: 'Dr. Roberto Cruz', role: 'panel-chair' },
        { id: '2', name: 'Dr. Maria Santos', role: 'panel-member' }
      ]
    },
    {
      id: 'RG-002',
      researchTitle: 'Blockchain-Based Voting System',
      members: ['Alice Brown', 'Charlie Davis'],
      adviserName: 'Dr. Roberto Cruz',
      department: 'SCIS',
      defenseType: 'Review Defense',
      requestedDate: '2024-12-22',
      requestedTime: '02:00 PM',
      venue: 'Room 305, IT Building',
      status: 'approved',
      assignedPanelists: [
        { id: '2', name: 'Dr. Maria Santos', role: 'panel-chair' }
      ]
    }
  ];
}

/**
 * @param {string} panelistName
 */
export async function getBookingsByPanelist(panelistName) {
  const all = getDefenseBookings();
  return all.filter(b => b.assignedPanelists?.some(p => p.name === panelistName));
}
