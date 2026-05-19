export type DefenseStage = 'Review Defense' | 'Title Defense' | 'Final Defense';

export interface ResearchGroup {
  id: string;
  title: string;
  members: string[];
  adviser: string;
  program: string;
  defenseDate: string;
  stage: DefenseStage;
  score: number;
  department: string;
}

export const DEPARTMENTS = [
  'All Departments',
  'School of Computer and Information Sciences'
];

export const DEFENSE_STAGES: DefenseStage[] = [
  'Review Defense',
  'Title Defense',
  'Final Defense',
];

export const mockResearchGroups: ResearchGroup[] = [
  {
    id: '1',
    title: 'Blockchain-Based Student Records Management System',
    members: ['Sarah Williams', 'Michael Brown'],
    adviser: 'Dr. Maria Santos',
    program: 'BS Information Technology',
    defenseDate: 'December 15, 2025',
    stage: 'Review Defense',
    score: 82,
    department: 'School of Computer and Information Sciences',
  },
  {
    id: '2',
    title: 'AI-Powered Learning Management System for Remote Education',
    members: ['John Doe', 'Jane Smith', 'Mark Johnson'],
    adviser: 'Dr. Robert Lee',
    program: 'BS Computer Science',
    defenseDate: 'December 15, 2025',
    stage: 'Title Defense',
    score: 92,
    department: 'School of Computer and Information Sciences',
  },
  {
    id: '3',
    title: 'E-Commerce Platform for Local Agricultural Products',
    members: ['Anna Lee', 'Thomas Clark'],
    adviser: 'Dr. Maria Santos',
    program: 'BS Information Technology',
    defenseDate: 'December 16, 2025',
    stage: 'Final Defense',
    score: 88,
    department: 'School of Computer and Information Sciences',
  },
  {
    id: '4',
    title: 'Smart Traffic Management System Using IoT',
    members: ['Carlos Rivera', 'Jessica Park', 'David Kim'],
    adviser: 'Dr. James Wilson',
    program: 'BS Computer Science',
    defenseDate: 'December 17, 2025',
    stage: 'Review Defense',
    score: 75,
    department: 'School of Computer and Information Sciences',
  },
  {
    id: '5',
    title: 'Predictive Analytics for Student Academic Performance',
    members: ['Maria Reyes', 'Luis Santos'],
    adviser: 'Dr. Elena Fuentes',
    program: 'BS Computer Science',
    defenseDate: 'December 18, 2025',
    stage: 'Title Defense',
    score: 90,
    department: 'School of Computer and Information Sciences',
  },
  {
    id: '6',
    title: 'Mobile-Based Inventory Management for SMEs',
    members: ['Kevin Tan', 'Patricia Lim', 'Roy Cruz'],
    adviser: 'Dr. Ana Gomez',
    program: 'BS Information Technology',
    defenseDate: 'December 19, 2025',
    stage: 'Final Defense',
    score: 85,
    department: 'School of Computer and Information Sciences',
  },
];

export interface EvaluationCriterion {
  criterion: string;
  maxPoints: number;
  description: string;
  score: number;
  comment: string;
}

export interface EvaluationChapter {
  chapter: string;
  criteria: EvaluationCriterion[];
}

export interface PanelistEvaluation {
  panelist: string;
  totalScore: number;
  chapters: EvaluationChapter[];
  comments: string;
}

export const mockPanelistEvaluations: Record<string, PanelistEvaluation[]> = {
  "1": [
    {
      panelist: "Dr. Elena Cruz", totalScore: 85,
      comments: "Good implementation of blockchain concepts. Needs improvement in security aspects.",
      chapters: [
        { chapter: "Chapter 1: Introduction", criteria: [
          { criterion: "Project Context", maxPoints: 10, description: "Clearly stated and explains the innovation.", score: 8, comment: "Well-defined but could elaborate on user challenges." },
          { criterion: "Statement of Goals and Objectives", maxPoints: 15, description: "Clearly identify the goals and objectives.", score: 12, comment: "Goals clear, some objectives need better alignment." },
          { criterion: "Purpose and Description", maxPoints: 20, description: "Clearly identify the purpose and beneficiaries.", score: 16, comment: "Purpose well-articulated. Expand beneficiaries." },
          { criterion: "Issues and Assumptions", maxPoints: 15, description: "Discusses constraints and assumptions.", score: 13, comment: "Constraints listed but assumptions need justification." },
          { criterion: "Definition of Terms", maxPoints: 10, description: "Technical terms defined clearly.", score: 9, comment: "Well-organized and comprehensive." },
        ]},
        { chapter: "Chapter 2: Review of Related Literatures", criteria: [
          { criterion: "Technical Background", maxPoints: 20, description: "Discusses technical aspects deeply.", score: 17, comment: "Strong discussion. Add more diagrams." },
          { criterion: "Related Literature", maxPoints: 50, description: "Literatures are relevant and properly cited.", score: 40, comment: "Needs more recent 2024-2025 references." },
          { criterion: "Synthesis", maxPoints: 30, description: "Summarized critical points from literature.", score: 27, comment: "Coherent and identifies key gaps." },
        ]},
      ],
    },
    {
      panelist: "Dr. Roberto Santos", totalScore: 80,
      comments: "Solid technical foundation. User interface could be more intuitive.",
      chapters: [
        { chapter: "Chapter 1: Introduction", criteria: [
          { criterion: "Project Context", maxPoints: 10, description: "Clearly stated and explains the innovation.", score: 8, comment: "Adequate context provided." },
          { criterion: "Statement of Goals and Objectives", maxPoints: 15, description: "Clearly identify the goals and objectives.", score: 11, comment: "Objectives could be more measurable." },
          { criterion: "Purpose and Description", maxPoints: 20, description: "Clearly identify the purpose and beneficiaries.", score: 15, comment: "Significance needs stronger justification." },
          { criterion: "Issues and Assumptions", maxPoints: 15, description: "Discusses constraints and assumptions.", score: 12, comment: "Missing scalability constraints." },
          { criterion: "Definition of Terms", maxPoints: 10, description: "Technical terms defined clearly.", score: 8, comment: "Some blockchain terms are missing." },
        ]},
        { chapter: "Chapter 2: Review of Related Literatures", criteria: [
          { criterion: "Technical Background", maxPoints: 20, description: "Discusses technical aspects deeply.", score: 16, comment: "Needs deeper consensus mechanism discussion." },
          { criterion: "Related Literature", maxPoints: 50, description: "Literatures are relevant and properly cited.", score: 38, comment: "Add more comparative analysis." },
          { criterion: "Synthesis", maxPoints: 30, description: "Summarized critical points from literature.", score: 26, comment: "Missing clear research gap identification." },
        ]},
      ],
    },
    {
      panelist: "Dr. Maria Garcia", totalScore: 81,
      comments: "Well-structured research. Consider adding more test cases.",
      chapters: [
        { chapter: "Chapter 1: Introduction", criteria: [
          { criterion: "Project Context", maxPoints: 10, description: "Clearly stated and explains the innovation.", score: 9, comment: "Very clear and well-written." },
          { criterion: "Statement of Goals and Objectives", maxPoints: 15, description: "Clearly identify the goals and objectives.", score: 12, comment: "Well-aligned with project scope." },
          { criterion: "Purpose and Description", maxPoints: 20, description: "Clearly identify the purpose and beneficiaries.", score: 16, comment: "Good stakeholder identification." },
          { criterion: "Issues and Assumptions", maxPoints: 15, description: "Discusses constraints and assumptions.", score: 12, comment: "Add data privacy constraints." },
          { criterion: "Definition of Terms", maxPoints: 10, description: "Technical terms defined clearly.", score: 8, comment: "Add smart contract terminology." },
        ]},
        { chapter: "Chapter 2: Review of Related Literatures", criteria: [
          { criterion: "Technical Background", maxPoints: 20, description: "Discusses technical aspects deeply.", score: 17, comment: "Thorough technical overview." },
          { criterion: "Related Literature", maxPoints: 50, description: "Literatures are relevant and properly cited.", score: 39, comment: "Include more international studies." },
          { criterion: "Synthesis", maxPoints: 30, description: "Summarized critical points from literature.", score: 24, comment: "Could be more concise and focused." },
        ]},
      ],
    },
  ],
  "2": [
    {
      panelist: "Dr. Elena Cruz", totalScore: 93,
      comments: "Excellent AI integration and innovative approach to remote learning.",
      chapters: [
        { chapter: "Chapter 1: Introduction", criteria: [
          { criterion: "Project Context", maxPoints: 10, description: "Clearly stated and explains the innovation.", score: 10, comment: "Excellent context with strong justification." },
          { criterion: "Statement of Goals and Objectives", maxPoints: 15, description: "Clearly identify the goals and objectives.", score: 14, comment: "Very well-defined SMART objectives." },
          { criterion: "Purpose and Description", maxPoints: 20, description: "Clearly identify the purpose and beneficiaries.", score: 19, comment: "Outstanding articulation of impact." },
          { criterion: "Issues and Assumptions", maxPoints: 15, description: "Discusses constraints and assumptions.", score: 14, comment: "Comprehensive constraint analysis." },
          { criterion: "Definition of Terms", maxPoints: 10, description: "Technical terms defined clearly.", score: 9, comment: "Minor omissions in AI terminology." },
        ]},
        { chapter: "Chapter 2: Review of Related Literatures", criteria: [
          { criterion: "Technical Background", maxPoints: 20, description: "Discusses technical aspects deeply.", score: 19, comment: "Exceptional depth in AI/ML concepts." },
          { criterion: "Related Literature", maxPoints: 50, description: "Literatures are relevant and properly cited.", score: 47, comment: "Extensive and well-organized review." },
          { criterion: "Synthesis", maxPoints: 30, description: "Summarized critical points from literature.", score: 27, comment: "Clear identification of research gaps." },
        ]},
      ],
    },
  ],
  "3": [
    {
      panelist: "Dr. Elena Cruz", totalScore: 88,
      comments: "Strong business model with good market analysis.",
      chapters: [
        { chapter: "Chapter 1: Introduction", criteria: [
          { criterion: "Project Context", maxPoints: 10, description: "Clearly stated and explains the innovation.", score: 9, comment: "Good market context for agricultural sector." },
          { criterion: "Statement of Goals and Objectives", maxPoints: 15, description: "Clearly identify the goals and objectives.", score: 13, comment: "Clear goals tied to market needs." },
          { criterion: "Purpose and Description", maxPoints: 20, description: "Clearly identify the purpose and beneficiaries.", score: 17, comment: "Well-defined farming community beneficiaries." },
          { criterion: "Issues and Assumptions", maxPoints: 15, description: "Discusses constraints and assumptions.", score: 13, comment: "Consider rural internet connectivity." },
          { criterion: "Definition of Terms", maxPoints: 10, description: "Technical terms defined clearly.", score: 9, comment: "Complete and well-organized." },
        ]},
        { chapter: "Chapter 2: Review of Related Literatures", criteria: [
          { criterion: "Technical Background", maxPoints: 20, description: "Discusses technical aspects deeply.", score: 18, comment: "Strong e-commerce technical foundation." },
          { criterion: "Related Literature", maxPoints: 50, description: "Literatures are relevant and properly cited.", score: 43, comment: "Add more international comparisons." },
          { criterion: "Synthesis", maxPoints: 30, description: "Summarized critical points from literature.", score: 27, comment: "Well-synthesized with clear direction." },
        ]},
      ],
    },
  ],
  "4": [
    {
      panelist: "Dr. Elena Cruz", totalScore: 96,
      comments: "Exceptional research with significant social impact potential.",
      chapters: [
        { chapter: "Chapter 1: Introduction", criteria: [
          { criterion: "Project Context", maxPoints: 10, description: "Clearly stated and explains the innovation.", score: 10, comment: "Perfect context with real-world data." },
          { criterion: "Statement of Goals and Objectives", maxPoints: 15, description: "Clearly identify the goals and objectives.", score: 15, comment: "Exemplary goal definition." },
          { criterion: "Purpose and Description", maxPoints: 20, description: "Clearly identify the purpose and beneficiaries.", score: 20, comment: "Outstanding impact analysis." },
          { criterion: "Issues and Assumptions", maxPoints: 15, description: "Discusses constraints and assumptions.", score: 14, comment: "Minor gap in regulatory constraints." },
          { criterion: "Definition of Terms", maxPoints: 10, description: "Technical terms defined clearly.", score: 10, comment: "Comprehensive and perfectly organized." },
        ]},
        { chapter: "Chapter 2: Review of Related Literatures", criteria: [
          { criterion: "Technical Background", maxPoints: 20, description: "Discusses technical aspects deeply.", score: 20, comment: "Masterful technical exposition." },
          { criterion: "Related Literature", maxPoints: 50, description: "Literatures are relevant and properly cited.", score: 48, comment: "Exceptional breadth and depth." },
          { criterion: "Synthesis", maxPoints: 30, description: "Summarized critical points from literature.", score: 29, comment: "Outstanding synthesis with clear contributions." },
        ]},
      ],
    },
  ],
  "5": [
    {
      panelist: "Dr. Elena Cruz", totalScore: 89,
      comments: "Good sustainability framework and practical applications.",
      chapters: [
        { chapter: "Chapter 1: Introduction", criteria: [
          { criterion: "Project Context", maxPoints: 10, description: "Clearly stated and explains the innovation.", score: 9, comment: "Solid context with good data references." },
          { criterion: "Statement of Goals and Objectives", maxPoints: 15, description: "Clearly identify the goals and objectives.", score: 13, comment: "Goals are well-scoped and achievable." },
          { criterion: "Purpose and Description", maxPoints: 20, description: "Clearly identify the purpose and beneficiaries.", score: 18, comment: "Clear academic and practical beneficiaries." },
          { criterion: "Issues and Assumptions", maxPoints: 15, description: "Discusses constraints and assumptions.", score: 13, comment: "Consider data quality issues." },
          { criterion: "Definition of Terms", maxPoints: 10, description: "Technical terms defined clearly.", score: 9, comment: "Minor additions for ML terms suggested." },
        ]},
        { chapter: "Chapter 2: Review of Related Literatures", criteria: [
          { criterion: "Technical Background", maxPoints: 20, description: "Discusses technical aspects deeply.", score: 18, comment: "Strong analytical framework." },
          { criterion: "Related Literature", maxPoints: 50, description: "Literatures are relevant and properly cited.", score: 44, comment: "Well-curated with good relevance." },
          { criterion: "Synthesis", maxPoints: 30, description: "Summarized critical points from literature.", score: 27, comment: "Good synthesis linking theory to practice." },
        ]},
      ],
    },
  ],
};
