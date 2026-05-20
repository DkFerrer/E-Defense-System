/** @typedef {{ username: string, password: string, user: Record<string, unknown> }} MockAccount */

/** @type {MockAccount[]} */
export const MOCK_ACCOUNTS = [
  {
    username: 'coordinator1',
    password: 'coord123',
    user: {
      id: 'coordinator1',
      name: 'Research Coordinator One',
      email: 'coordinator1@unc.edu.ph',
      role: 'Research Coordinator',
      roleLabel: 'Research Coordinator',
      department: 'University Research Center',
      position: 'Coordinator',
      accountType: 'Staff',
      status: 'Active',
    },
  },
  {
    username: 'rc.admin',
    password: 'admin2024',
    user: {
      id: 'rc.admin',
      name: 'RC Admin',
      email: 'rc.admin@unc.edu.ph',
      role: 'Research Coordinator',
      roleLabel: 'Research Coordinator',
      department: 'University Research Center',
      position: 'Administrator',
      accountType: 'Staff',
      status: 'Active',
    },
  },
  {
    username: 'dean.andrey',
    password: 'dean123',
    user: {
      id: 'dean.andrey',
      name: 'Dean Andrey',
      email: 'dean.andrey@unc.edu.ph',
      role: 'Dean',
      roleLabel: 'Dean',
      department: 'College of Computing',
      position: 'Dean',
      accountType: 'Faculty',
      status: 'Active',
    },
  },
  {
    username: 'andrey.quintela',
    password: 'unc2024',
    user: {
      id: 'andrey.quintela',
      name: 'Andrey Quintela',
      email: 'andrey.quintela@unc.edu.ph',
      role: 'Dean',
      roleLabel: 'Dean',
      department: 'College of Computing',
      position: 'Dean',
      accountType: 'Faculty',
      status: 'Active',
    },
  },
  {
    username: 'panelist1',
    password: 'panel123',
    user: {
      id: 'panelist1',
      name: 'Panel Member One',
      email: 'panelist1@unc.edu.ph',
      role: 'Panelist',
      roleLabel: 'Panel Member',
      department: 'School of Computer and Information Sciences',
      position: 'Faculty',
      accountType: 'Faculty',
      status: 'Active',
    },
  },
  {
    username: 'dr.santos',
    password: 'santos2024',
    user: {
      id: 'dr.santos',
      name: 'Dr. Maria Santos',
      email: 'dr.santos@unc.edu.ph',
      role: 'Panelist',
      roleLabel: 'Panel Member',
      department: 'School of Computer and Information Sciences',
      position: 'Not specified',
      accountType: 'Faculty',
      status: 'Active',
    },
  },
  {
    username: 'adviser1',
    password: 'adv123',
    user: {
      id: 'adviser1',
      name: 'Adviser One',
      email: 'adviser1@unc.edu.ph',
      role: 'Adviser',
      roleLabel: 'Adviser',
      department: 'School of Computer and Information Sciences',
      position: 'Professor',
      accountType: 'Faculty',
      status: 'Active',
    },
  },
  {
    username: 'prof.reyes',
    password: 'reyes2024',
    user: {
      id: 'prof.reyes',
      name: 'Prof. Reyes',
      email: 'prof.reyes@unc.edu.ph',
      role: 'Adviser',
      roleLabel: 'Adviser',
      department: 'School of Computer and Information Sciences',
      position: 'Professor',
      accountType: 'Faculty',
      status: 'Active',
    },
  },
  {
    username: 'student1',
    password: 'stud123',
    user: {
      id: 'student1',
      name: 'Student One',
      email: 'student1@unc.edu.ph',
      role: 'Student',
      roleLabel: 'Student',
      department: 'School of Computer and Information Sciences',
      position: 'Student',
      accountType: 'Student',
      status: 'Active',
    },
  },
  {
    username: 'juan.delacruz',
    password: 'juan2024',
    user: {
      id: 'juan.delacruz',
      name: 'Juan Dela Cruz',
      email: 'juan.delacruz@unc.edu.ph',
      role: 'Student',
      roleLabel: 'Student',
      department: 'School of Computer and Information Sciences',
      position: 'Student',
      accountType: 'Student',
      status: 'Active',
    },
  },
  {
    username: 'admin',
    password: 'admin123',
    user: {
      id: 'admin',
      name: 'System Admin',
      email: 'admin@local.test',
      role: 'Admin',
      roleLabel: 'Administrator',
      department: 'University Research Center',
      position: 'Administrator',
      accountType: 'Staff',
      status: 'Active',
    },
  },
  {
    username: '23-181818',
    password: 'password123',
    user: {
      id: 'user-23-181818',
      name: 'Sample Panelist',
      email: 'sample@unc.edu.ph',
      role: 'Panelist',
      roleLabel: 'Panel Member',
      department: 'School of Computer and Information Sciences',
      position: 'Faculty',
      accountType: 'Faculty',
      status: 'Active',
    },
  },
  {
    username: 'dean',
    password: 'dean123',
    user: {
      id: 'dean-user',
      name: 'Sample Dean',
      email: 'dean@unc.edu.ph',
      role: 'Dean',
      roleLabel: 'Dean',
      department: 'College of Computing',
      position: 'Dean',
      accountType: 'Faculty',
      status: 'Active',
    },
  },
];

const initialEvaluations = [
  {
    id: 1,
    target: 'AI-Powered Learning Management System',
    type: 'Title Defense',
    defense_stage: 'proposal',
    status: 'pending',
    due_date: '2024-12-20',
    authors: ['John Doe', 'Jane Smith', 'Bob Johnson'],
    department: 'School of Computer and Information Sciences',
    booking_id: 'BK-1001',
  },
  {
    id: 2,
    target: 'Blockchain-Based Credential Verification',
    type: 'Final Defense',
    defense_stage: 'final',
    status: 'completed',
    due_date: '2024-11-05',
    authors: ['Alex Lee', 'Sam Rivera'],
    department: 'School of Computer and Information Sciences',
    booking_id: 'BK-1002',
  },
  {
    id: 3,
    target: 'IoT Smart Campus Monitoring',
    type: 'Review Defense',
    defense_stage: 'pre-final',
    status: 'pending',
    due_date: '2025-01-10',
    authors: ['Chris Tan'],
    department: 'School of Computer and Information Sciences',
    booking_id: null,
  },
  {
    id: 4,
    target: 'Adaptive Assessment Using Machine Learning',
    type: 'Title Defense',
    defense_stage: 'proposal',
    status: 'pending',
    due_date: '2025-02-02',
    authors: ['Jamie Park', 'Lee Wong'],
    department: 'School of Computer and Information Sciences',
    booking_id: 'BK-1004',
  },
];

/** @type {typeof initialEvaluations} */
let evaluationsState = initialEvaluations.map((e) => ({ ...e }));

/** @type {Record<string, { scores: Record<string, number>, comments: Record<string, string>, general_comments: string, status: string, total_score: number | null }>} */
let submissions = {};

function submissionKey(evaluationId, userId) {
  return `${evaluationId}:${userId}`;
}

export function resetSampleDataset() {
  evaluationsState = initialEvaluations.map((e) => ({ ...e }));
  submissions = {};
}

export const SAMPLE_RUBRICS = [
  {
    id: 'r-proposal',
    name: 'PROJECT DOCUMENTATION AND MANUSCRIPT',
    stage: 'proposal',
    criteria: [
      {
        id: 'c1',
        name: 'Project Context',
        maxScore: 10,
        description:
          'Clearly establishes the research problem, significance, and scope within the academic and practical context.',
      },
      {
        id: 'c2',
        name: 'Objectives and Questions',
        maxScore: 10,
        description: 'States measurable objectives and well-formed research questions aligned with the problem.',
      },
    ],
  },
  {
    id: 'r-prefinal',
    name: 'METHODOLOGY AND PROGRESS',
    stage: 'pre-final',
    criteria: [
      {
        id: 'pf1',
        name: 'Methodology clarity',
        maxScore: 15,
        description: 'Describes methods, data collection, and analysis approach appropriately.',
      },
      {
        id: 'pf2',
        name: 'Progress and milestones',
        maxScore: 15,
        description: 'Demonstrates concrete progress against the project plan.',
      },
    ],
  },
  {
    id: 'r-final',
    name: 'DEFENSE RUBRIC — FINAL',
    stage: 'final',
    criteria: [
      {
        id: 'f1',
        name: 'Contribution and originality',
        maxScore: 25,
        description: 'Articulates novel contributions and situates work in the literature.',
      },
      {
        id: 'f2',
        name: 'Presentation and Q&A',
        maxScore: 25,
        description: 'Clear delivery and sound responses to panel questions.',
      },
    ],
  },
];

export const SAMPLE_RESULT_ROWS = [
  {
    id: 'r1',
    title: 'AI-Powered Learning Management System',
    authors: 'John Doe, Jane Smith, Bob Johnson',
    department: 'School of Computer and Information Sciences',
    stage: 'Title Defense',
    date: 'Feb 15, 2024',
    score: '85 / 100',
    pct: '85.0%',
    status: 'Passed',
    status_tone: 'green',
  },
  {
    id: 'r2',
    title: 'Blockchain-Based Credential Verification',
    authors: 'Alex Lee, Sam Rivera',
    department: 'School of Computer and Information Sciences',
    stage: 'Final Defense',
    date: 'Mar 2, 2024',
    score: '92 / 100',
    pct: '92.0%',
    status: 'Passed with Distinction',
    status_tone: 'teal',
  },
  {
    id: 'r3',
    title: 'IoT Smart Campus Monitoring',
    authors: 'Chris Tan',
    department: 'School of Computer and Information Sciences',
    stage: 'Review Defense',
    date: 'Jan 10, 2024',
    score: '74 / 100',
    pct: '74.0%',
    status: 'Conditional Pass',
    status_tone: 'orange',
  },
];

/**
 * @param {string} username
 * @param {string} password
 */
export function findMockAccount(username, password) {
  const u = username.trim().toLowerCase();
  return MOCK_ACCOUNTS.find(
    (a) => a.username.toLowerCase() === u && a.password === password
  );
}

export function getSampleEvaluations() {
  return evaluationsState.map((e) => ({ ...e }));
}

/**
 * @param {string | number} evaluationId
 * @param {string} userId
 */
export function getMockRubricBundle(evaluationId, userId) {
  const ev = evaluationsState.find((e) => String(e.id) === String(evaluationId));
  const stage = ev?.defense_stage || 'proposal';
  const rubrics = SAMPLE_RUBRICS.filter((r) => r.stage === stage);
  const list = rubrics.length ? rubrics : SAMPLE_RUBRICS.slice(0, 1);
  const key = submissionKey(evaluationId, userId);
  const raw = submissions[key];
  const submission = raw
    ? {
        scores: raw.scores,
        comments: raw.comments ?? {},
        general_comments: raw.general_comments ?? '',
        status: raw.status,
        total_score: raw.total_score,
      }
    : null;
  return {
    evaluation: ev ? { ...ev } : null,
    rubrics: list.map((r) => ({
      id: r.id,
      name: r.name,
      stage: r.stage,
      criteria: (r.criteria || []).map((c) => ({ ...c })),
    })),
    submission,
  };
}

/**
 * @param {string | number} evaluationId
 * @param {string} userId
 * @param {{ scores: Record<string, number>, comments?: Record<string, string>, general_comments?: string, status: string, total_score?: number | null }} body
 */
export function saveMockSubmission(evaluationId, userId, body) {
  const key = submissionKey(evaluationId, userId);
  submissions[key] = {
    scores: { ...body.scores },
    comments: { ...(body.comments || {}) },
    general_comments: body.general_comments ?? '',
    status: body.status,
    total_score: body.total_score ?? null,
  };
  if (body.status === 'submitted') {
    const idx = evaluationsState.findIndex((e) => String(e.id) === String(evaluationId));
    if (idx >= 0) {
      evaluationsState[idx] = { ...evaluationsState[idx], status: 'completed' };
    }
  }
}
