import axios from 'axios';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { isMockBackend } from '../config/backendMode';

/** @type {string | null} */
let bearerToken = null;

/**
 * @param {string | null} token
 */
export function setBearerToken(token) {
  bearerToken = token;
}

export function getBearerToken() {
  return bearerToken;
}

/**
 * @param {unknown} error
 * @param {string} [fallback]
 */
export function formatApiError(error, fallback = 'Request failed') {
  if (axios.isAxiosError(error)) {
    const d = error.response?.data;
    if (d?.errors && typeof d.errors === 'object') {
      const parts = Object.values(d.errors)
        .flat()
        .filter((x) => typeof x === 'string');
      if (parts.length) return parts.join(' ');
    }
    if (typeof d?.message === 'string') return d.message;
    if (error.response?.status) {
      return `${fallback} (HTTP ${error.response.status})`;
    }
    return error.message || fallback;
  }
  return (error && typeof error === 'object' && error !== null && 'message' in error && typeof error.message === 'string' && error.message) || fallback;
}

function resolveBaseURL() {
  const fromEnv = typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_API_URL;
  if (fromEnv) {
    let url = String(fromEnv).replace(/\/$/, '');
    if (!url.endsWith('/api')) {
      url += '/api';
    }
    return url;
  }
  if (Platform.OS === 'web') {
    return 'http://localhost:8000/api';
  }
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:8000/api';
  }
  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) {
    const hostname = hostUri.split(':')[0];
    if (hostname && hostname !== '127.0.0.1' && hostname !== 'localhost') {
      return `http://${hostname}:8000/api`;
    }
  }
  return 'http://localhost:8000/api';
}

const api = axios.create({
  baseURL: resolveBaseURL(),
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
  withCredentials: false,
});

api.interceptors.request.use(
  (config) => {
    const next = { ...config };
    if (bearerToken) {
      (next as any).headers = {
        ...next.headers,
        Authorization: `Bearer ${bearerToken}`,
      };
    }
    return next;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (!isMockBackend() && error.response?.status === 401) {
      setBearerToken(null);
    }
    return Promise.reject(error);
  }
);

// --- Consolidated Rubrics Logic from lib/api.js ---

let rubrics = [
  {
    id: '1',
    name: 'Standard Thesis Defense Rubric',
    department: 'scis',
    program: 'bs-cs',
    stage: 'final',
    criteria: [
      {
        id: 'doc-context',
        chapter: 'Chapter 1: Introduction',
        title: 'Project Context',
        description: 'Clearly stated and explains clearly the presentation of introduction, background and statement of facts and of the title; its challenges for the editor; and the rationale for the paper',
        points: 10
      },
      {
        id: 'doc-goals',
        chapter: 'Chapter 1: Introduction',
        title: 'Clarity and Completeness of Ideas and Objectives',
        description: 'Clearly articulated ideas with well-defined objectives that demonstrate the development of the project; and aligned',
        points: 15
      }
    ],
    createdBy: 'Dr. Maria Santos',
    createdAt: '2024-01-15'
  }
];

export async function getRubrics() {
  if (isMockBackend()) {
    return { rubrics: [...rubrics] };
  }
  const { data } = await api.get('/rubrics.php');
  return data;
}

export async function createRubric(rubricData) {
  const newRubric = {
    ...rubricData,
    id: Date.now().toString(),
  };
  rubrics.push(newRubric);
  return newRubric;
}

export async function updateRubric(id, rubricData) {
  const index = rubrics.findIndex(r => r.id === id);
  if (index !== -1) {
    rubrics[index] = { ...rubrics[index], ...rubricData };
    return rubrics[index];
  }
  throw new Error('Rubric not found');
}

export async function deleteRubric(id) {
  rubrics = rubrics.filter(r => r.id !== id);
  return { success: true };
}

import AsyncStorage from '@react-native-async-storage/async-storage';

export async function createEvaluation(evaluationData) {
  if (isMockBackend()) {
    try {
      const existing = await AsyncStorage.getItem('evaluations');
      const evaluations = existing ? JSON.parse(existing) : [];
      evaluations.push({
        ...evaluationData,
        id: Date.now().toString(),
      });
      await AsyncStorage.setItem('evaluations', JSON.stringify(evaluations));
      return { success: true };
    } catch (e) {
      console.error('Failed to save evaluation:', e);
      throw e;
    }
  }
  // Real API call
  const { data } = await api.post('/evaluations.php', evaluationData);
  return data;
}

export async function getEvaluations() {
  if (isMockBackend()) {
    try {
      const existing = await AsyncStorage.getItem('evaluations');
      return existing ? JSON.parse(existing) : [];
    } catch (e) {
      return [];
    }
  }
  // Real API call
  const { data } = await api.get('/evaluations.php');
  return Array.isArray(data?.data) ? data.data : (Array.isArray(data) ? data : []);
}

export async function createOrUpdateResult(resultData) {
  if (isMockBackend()) {
    try {
      const existing = await AsyncStorage.getItem('results');
      const results = existing ? JSON.parse(existing) : [];
      
      const idx = results.findIndex(r => r.groupId === resultData.groupId);
      if (idx !== -1) {
        results[idx] = { ...results[idx], ...resultData, updatedAt: new Date().toISOString() };
      } else {
        results.push({ ...resultData, id: Date.now().toString(), createdAt: new Date().toISOString() });
      }
      
      await AsyncStorage.setItem('results', JSON.stringify(results));
      return { success: true };
    } catch (e) {
      console.error('Failed to save result:', e);
      throw e;
    }
  }
  // Real API call (Result update is usually handled by evaluation completion in backend, but we'll provide the endpoint)
  const { data } = await api.post('/results.php', resultData);
  return data;
}

export async function getResults() {
  if (isMockBackend()) {
    try {
      const existing = await AsyncStorage.getItem('results');
      return existing ? JSON.parse(existing) : [];
    } catch (e) {
      return [];
    }
  }
  // Real API call
  const { data } = await api.get('/results.php');
  return Array.isArray(data?.data) ? data.data : (Array.isArray(data) ? data : []);
}

export async function getBookings() {
  if (isMockBackend()) {
    return [
      {
        id: 100,
        research_title: 'E-Defense System in the University of Nueva Caceres',
        members: ['Lea Roncesvalles', 'Janna Mae Asa', 'Andrey Quintela', 'Dalia Mae Miralles'],
        adviser_name: 'Joenhel Arcilla',
        department: 'School of Computer and Information Sciences',
        program: 'BSIT',
        year_level: '3rd',
        semester: '2nd Sem',
        academic_year: '2026-2027',
        requested_date: '2026-10-24',
        requested_time: '10:00 AM',
        created_at: '2026-10-01T08:30:00.000Z',
        venue: 'JH32',
        defense_type: 'Review Defense',
        status: 'approved',
        role: 'Panel Chair',
        panel_chair: 'Junar Danila',
        secretary: 'Isabel Delos Santos',
        assigned_panelists: [
          { id: 'p1', name: 'Irvin Villanueva' },
          { id: 'p2', name: 'Jay Borela' },
          { id: 'p3', name: 'Danny Boy Casimero' }
        ]
      },
      {
        id: 2,
        research_title: 'Blockchain-Based Voting System',
        members: ['Alice Brown', 'Charlie Davis'],
        adviser_name: 'Dr. Roberto Cruz',
        department: 'School of Computer and Information Sciences',
        program: 'BSCS',
        year_level: '4th',
        semester: '1st Sem',
        academic_year: '2026-2027',
        requested_date: '2024-12-22',
        requested_time: '2:00 PM',
        created_at: '2024-12-01T14:20:00.000Z',
        venue: 'https://meet.google.com/abc-defg-hij',
        defense_type: 'Review Defense',
        status: 'approved',
        role: 'Chairman',
        assigned_panelists: [{ id: '23-181818', name: 'Dr. Maria Santos' }]
      },
      {
        id: 3,
        research_title: 'Sustainable Urban Planning Framework',
        members: ['David Wilson', 'Emma Taylor', 'Frank Moore'],
        adviser_name: 'Dr. Grace Hopper',
        department: 'College of Engineering and Architecture',
        requested_date: '2024-12-25',
        requested_time: '9:00 AM',
        venue: 'Room 405, CEA Building',
        defense_type: 'Final Defense',
        status: 'pending',
        role: 'Member',
        assigned_panelists: [{ id: '23-181818', name: 'Dr. Maria Santos' }]
      },
      {
        id: 4,
        research_title: 'Machine Learning for Medical Diagnosis',
        members: ['Sarah Johnson', 'Michael Chen', 'Emily Rodriguez'],
        adviser_name: 'Prof. Ada Lovelace',
        department: 'School of Computer and Information Sciences',
        requested_date: '2024-12-18',
        requested_time: '3:00 PM',
        venue: 'Room 303, SCIS Building',
        defense_type: 'Title Defense',
        status: 'completed',
        role: 'Chairman',
        assigned_panelists: [{ id: '23-181818', name: 'Dr. Maria Santos' }]
      },
      {
        id: 5,
        research_title: 'Smart City Infrastructure Development',
        members: ['George Harris', 'Helen Martinez'],
        adviser_name: 'Dr. Grace Hopper',
        department: 'College of Engineering and Architecture',
        requested_date: '2024-12-21',
        requested_time: '11:00 AM',
        venue: 'Room 406, CEA Building',
        defense_type: 'Review Defense',
        status: 'approved',
        role: 'Member',
        assigned_panelists: [{ id: '23-181818', name: 'Dr. Maria Santos' }]
      }
    ];
  }
  const { data } = await api.get('/bookings.php');
  return data;
}

export async function getEvaluationRubricBundle(evaluationId) {
  if (isMockBackend()) {
    try {
      const storedSubKey = `@submission_${evaluationId}`;
      const stored = await AsyncStorage.getItem(storedSubKey);
      const submission = stored ? JSON.parse(stored) : null;
      
      const mockRubrics = [
        {
          id: 'rubric-1',
          name: 'PROJECT DOCUMENTATION AND MANUSCRIPT',
          stage: 'proposal',
          criteria: [
            {
              id: 'doc-context',
              name: 'Project Context',
              description: 'Clearly stated and explains clearly the presentation of introduction, background and statement of facts and of the title; its challenges for the editor; and the rationale for the paper.',
              maxScore: 10
            },
            {
              id: 'doc-objectives',
              name: 'Clarity and Completeness of Ideas and Objectives',
              description: 'Clearly articulated ideas with well-defined objectives that demonstrate the development of the project; and aligned with the program.',
              maxScore: 15
            },
            {
              id: 'doc-method',
              name: 'Methodology and Technical Approach',
              description: 'Appropriateness, clarity, and viability of the technical approach, architecture, or design representation.',
              maxScore: 25
            },
            {
              id: 'doc-results',
              name: 'Results, Analysis, and Output',
              description: 'Significance, completeness, and rigor of research results and implementation verification.',
              maxScore: 30
            },
            {
              id: 'doc-writing',
              name: 'Quality of Technical Writing',
              description: 'Adherence to formatting guidelines, clarity, grammar, and structural consistency.',
              maxScore: 20
            }
          ]
        }
      ];
      
      return {
        evaluation: {
          id: evaluationId,
          max_score: 100,
          due_date: '2026-05-20',
          status: submission ? (submission.status === 'submitted' ? 'completed' : 'pending') : 'pending'
        },
        rubrics: mockRubrics,
        submission: submission
      };
    } catch (e) {
      console.error('Failed to get mock rubric bundle:', e);
      return null;
    }
  }
  const { data } = await api.get(`/rubric-bundle.php?id=${evaluationId}`);
  return data;
}

export async function upsertEvaluationSubmission(evaluationId, submissionData) {
  if (isMockBackend()) {
    try {
      const storedSubKey = `@submission_${evaluationId}`;
      await AsyncStorage.setItem(storedSubKey, JSON.stringify(submissionData));
      return { success: true };
    } catch (e) {
      console.error('Failed to save mock submission:', e);
      throw e;
    }
  }
  const { data } = await api.put(`/submission.php?id=${evaluationId}`, submissionData);
  return data;
}

export async function getEvaluationResults() {
  if (isMockBackend()) {
    try {
      const sampleResults: any[] = [
        {
          id: 'eval-1',
          target: 'AI-Powered Learning Management System',
          authors: ['John Doe', 'Jane Smith'],
          type: 'Title Defense',
          defense_stage: 'proposal',
          result_date: '2026-05-20',
          status: 'completed',
          panelist_submissions: [
            {
              total_score: 85,
              scores: { "doc-context": 8, "doc-objectives": 12, "doc-method": 22, "doc-results": 25, "doc-writing": 18 },
              comments: { "doc-context": "Excellent introduction.", "doc-objectives": "Clean objectives." },
              general_comments: "Great job, team! Highly recommended.",
              status: "submitted"
            }
          ]
        },
        {
          id: 'eval-2',
          target: 'Blockchain-Based Voting System',
          authors: ['Alice Brown', 'Charlie Davis'],
          type: 'Review Defense',
          defense_stage: 'review',
          result_date: '2026-05-22',
          status: 'completed',
          panelist_submissions: [
            {
              total_score: 92,
              scores: { "doc-context": 9, "doc-objectives": 14, "doc-method": 23, "doc-results": 28, "doc-writing": 18 },
              comments: { "doc-context": "Very thorough context.", "doc-objectives": "Solid objectives." },
              general_comments: "Outstanding work! Secure blockchain implementation.",
              status: "submitted"
            }
          ]
        }
      ];

      const bookings = [
        { id: 1, title: 'AI-Powered Learning Management System', members: ['John Doe', 'Jane Smith'] },
        { id: 2, title: 'Blockchain-Based Voting System', members: ['Alice Brown', 'Charlie Davis'] },
        { id: 3, title: 'IoT Campus Monitoring System', members: ['Chris Tan', 'Jamie Park'] }
      ];

      for (const booking of bookings) {
        const stored = await AsyncStorage.getItem(`@submission_${booking.id}`);
        const storedMinutes = await AsyncStorage.getItem(`@minutes_${booking.id}`);
        const minutes = storedMinutes ? JSON.parse(storedMinutes) : null;

        let exists = sampleResults.find(r => r.id === `eval-${booking.id}` || r.id === booking.id);
        if (exists) {
          if (stored) {
            exists.panelist_submissions = [JSON.parse(stored)];
          }
          if (minutes) {
            exists.defense_minutes = minutes;
          }
        } else if (stored || minutes) {
          const submission = stored ? JSON.parse(stored) : null;
          sampleResults.push({
            id: `eval-${booking.id}`,
            target: booking.title,
            authors: booking.members,
            type: minutes?.stage || 'Title Defense',
            defense_stage: 'proposal',
            result_date: new Date().toISOString().split('T')[0],
            status: 'completed',
            panelist_submissions: submission ? [submission] : [],
            defense_minutes: minutes
          });
        }
      }

      return sampleResults;
    } catch (e) {
      console.error('Failed to get mock evaluation results:', e);
      return [];
    }
  }
  const { data } = await api.get('/results.php');
  return data;
}

export async function updateBookingStatus(id, status, reason = '') {
  if (isMockBackend()) {
    return { success: true };
  }
  const { data } = await api.put(`/booking-status.php?id=${id}`, { status, decline_reason: reason });
  return data;
}

export async function getDefenseMinutes(bookingId) {
  if (isMockBackend()) {
    try {
      if (bookingId) {
        const stored = await AsyncStorage.getItem(`@minutes_${bookingId}`);
        return stored ? JSON.parse(stored) : null;
      } else {
        const keys = await AsyncStorage.getAllKeys();
        const minutesKeys = keys.filter(k => k.startsWith('@minutes_'));
        const all = [];
        for (const k of minutesKeys) {
          const val = await AsyncStorage.getItem(k);
          if (val) {
            const data = JSON.parse(val);
            all.push({
              booking_id: data.booking_id,
              status: data.status
            });
          }
        }
        return all;
      }
    } catch (e) {
      console.error('Failed to get mock minutes:', e);
      return [];
    }
  }
  const url = bookingId ? `/minutes.php?booking_id=${bookingId}` : '/minutes.php';
  const { data } = await api.get(url);
  return data;
}

export async function saveDefenseMinutes(minutesData) {
  if (isMockBackend()) {
    try {
      const bookingId = minutesData.booking_id;
      await AsyncStorage.setItem(`@minutes_${bookingId}`, JSON.stringify(minutesData));
      return { success: true, message: 'Minutes saved successfully (mock)' };
    } catch (e) {
      console.error('Failed to save mock minutes:', e);
      throw e;
    }
  }
  const { data } = await api.post('/minutes.php', minutesData);
  return data;
}

export default api;
