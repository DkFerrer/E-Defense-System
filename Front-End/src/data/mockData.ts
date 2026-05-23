import { Platform } from 'react-native';
import { sections, presentationCriteria } from './evaluationRubric';

let memoryStorage: Record<string, string> = {};

export const getStorageItem = (key: string): string | null => {
  if (Platform.OS === 'web') {
    return typeof window !== 'undefined' ? localStorage.getItem(key) : null;
  }
  return memoryStorage[key] || null;
};

export const setStorageItem = (key: string, value: string) => {
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined') localStorage.setItem(key, value);
  } else {
    memoryStorage[key] = value;
  }
};

export const removeStorageItem = (key: string) => {
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined') localStorage.removeItem(key);
  } else {
    delete memoryStorage[key];
  }
};

export const clearStorage = () => {
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined') localStorage.clear();
  } else {
    memoryStorage = {};
  }
};

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

export interface Booking {
  id: number;
  research_title: string;
  members: string[];
  adviser_name: string;
  department: string;
  program: string;
  year_level: string;
  semester: string;
  academic_year: string;
  requested_date: string;
  requested_time: string;
  created_at: string;
  venue: string;
  defense_type: string;
  status: string;
  role: string;
  panel_chair?: string;
  secretary?: string;
  assigned_panelists?: { id: string; name: string }[];
}

export const mockBookings: Booking[] = [
  {
    id: 1,
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
    requested_date: '2026-10-22',
    requested_time: '2:00 PM',
    created_at: '2026-10-01T14:20:00.000Z',
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
    program: 'BS Architecture',
    year_level: '5th',
    semester: '1st Sem',
    academic_year: '2026-2027',
    requested_date: '2026-10-25',
    requested_time: '9:00 AM',
    created_at: '2026-10-02T09:00:00.000Z',
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
    program: 'BS Computer Science',
    year_level: '4th',
    semester: '1st Sem',
    academic_year: '2026-2027',
    requested_date: '2026-10-18',
    requested_time: '3:00 PM',
    created_at: '2026-09-28T15:00:00.000Z',
    venue: 'Room 303, SCIS Building',
    defense_type: 'Title Defense',
    status: 'pending',
    role: 'Chairman',
    assigned_panelists: [{ id: '23-181818', name: 'Dr. Maria Santos' }]
  },
  {
    id: 5,
    research_title: 'Smart City Infrastructure Development',
    members: ['George Harris', 'Helen Martinez'],
    adviser_name: 'Dr. Grace Hopper',
    department: 'College of Engineering and Architecture',
    program: 'BS Civil Engineering',
    year_level: '4th',
    semester: '1st Sem',
    academic_year: '2026-2027',
    requested_date: '2026-10-21',
    requested_time: '11:00 AM',
    created_at: '2026-09-29T11:00:00.000Z',
    venue: 'Room 406, CEA Building',
    defense_type: 'Review Defense',
    status: 'pending',
    role: 'Member',
    assigned_panelists: [{ id: '23-181818', name: 'Dr. Maria Santos' }]
  }
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
  studentPresentations?: {
    studentName: string;
    criteria: EvaluationCriterion[];
  }[];
  comments: string;
  approvalDecision?: string;
}

export const g1Members = mockResearchGroups.find(g => g.id === "1")?.members || [];
const g2Members = mockResearchGroups.find(g => g.id === "2")?.members || [];
const g3Members = mockResearchGroups.find(g => g.id === "3")?.members || [];
const g4Members = mockResearchGroups.find(g => g.id === "4")?.members || [];
const g5Members = mockResearchGroups.find(g => g.id === "5")?.members || [];
const g6Members = mockResearchGroups.find(g => g.id === "6")?.members || [];

interface BaseLevels {
  ch1: number;
  ch2: number;
  rm: number;
  sdm: number;
  sm: number;
  te: number;
  ssp: number;
  pres: Record<string, number>;
}

function createPanelistEvaluation(
  panelist: string,
  totalScore: number,
  comments: string,
  groupMembers: string[],
  baseLevels: BaseLevels
): PanelistEvaluation {
  const sectionLevelMap: Record<string, number> = {
    "Introduction and Background": baseLevels.ch1,
    "Review of Related Literature": baseLevels.ch2,
    "Research Methodology": baseLevels.rm,
    "Software Development Methodology": baseLevels.sdm,
    "System Models": baseLevels.sm,
    "Testing and Evaluation": baseLevels.te,
    "Software Solution Prototype": baseLevels.ssp,
  };

  const chapters: EvaluationChapter[] = sections.flatMap(sec => 
    sec.subsections.map(sub => {
      const level = sectionLevelMap[sub.title] || 4;
      const criteria: EvaluationCriterion[] = sub.criteria.map(crit => {
        const percentage = level === 5 ? 1.0 : level === 4 ? 0.8 : level === 3 ? 0.6 : level === 2 ? 0.4 : 0.2;
        const score = Math.round(crit.points * percentage * 10) / 10;
        
        let comment = `Adequate work on ${crit.name}.`;
        if (level === 5) comment = `Excellent, comprehensive presentation of ${crit.name}. Extremely well done.`;
        else if (level === 4) comment = `Very good and clear ${crit.name} with minor gaps.`;
        else if (level === 2) comment = `Needs more refinement on ${crit.name}.`;
        else if (level === 1) comment = `Poorly defined ${crit.name}, needs major revision.`;

        return {
          criterion: crit.id,
          maxPoints: crit.points,
          description: crit.name,
          score,
          comment
        };
      });

      return {
        chapter: sub.title,
        criteria
      };
    })
  );

  const studentPresentations = groupMembers.map(member => {
    const level = baseLevels.pres[member] || 4;
    const criteria: EvaluationCriterion[] = presentationCriteria.map(crit => {
      const percentage = level === 5 ? 1.0 : level === 4 ? 0.8 : level === 3 ? 0.6 : level === 2 ? 0.4 : 0.2;
      const score = Math.round(crit.points * percentage * 10) / 10;
      
      let comment = `Good delivery on ${crit.name}.`;
      if (level === 5) comment = `Masterful delivery and exceptional defense of ${crit.name}.`;
      else if (level === 3) comment = `Satisfactory work, but could improve ${crit.name}.`;

      return {
        criterion: crit.id,
        maxPoints: crit.points,
        description: crit.name,
        score,
        comment
      };
    });

    return {
      studentName: member,
      criteria
    };
  });

  return {
    panelist,
    totalScore,
    chapters,
    studentPresentations,
    comments
  };
}

export const mockPanelistEvaluations: Record<string, PanelistEvaluation[]> = {
  "1": [
    createPanelistEvaluation(
      "Dr. Elena Cruz", 85,
      "Good implementation of blockchain concepts. Needs improvement in security aspects.",
      g1Members,
      { ch1: 4, ch2: 4, rm: 4, sdm: 4, sm: 4, te: 4, ssp: 5, pres: { "Sarah Williams": 5, "Michael Brown": 4 } }
    ),
    createPanelistEvaluation(
      "Dr. Roberto Santos", 80,
      "Solid technical foundation. User interface could be more intuitive.",
      g1Members,
      { ch1: 4, ch2: 4, rm: 4, sdm: 4, sm: 4, te: 4, ssp: 4, pres: { "Sarah Williams": 4, "Michael Brown": 4 } }
    ),
    createPanelistEvaluation(
      "Dr. Maria Garcia", 81,
      "Well-structured research. Consider adding more test cases.",
      g1Members,
      { ch1: 4, ch2: 4, rm: 4, sdm: 4, sm: 4, te: 4, ssp: 4, pres: { "Sarah Williams": 5, "Michael Brown": 4 } }
    )
  ],
  "2": [
    createPanelistEvaluation(
      "Dr. Elena Cruz", 93,
      "Excellent AI integration and innovative approach to remote learning.",
      g2Members,
      { ch1: 5, ch2: 5, rm: 5, sdm: 5, sm: 5, te: 5, ssp: 5, pres: { "John Doe": 5, "Jane Smith": 5, "Mark Johnson": 4 } }
    ),
    createPanelistEvaluation(
      "Dr. Roberto Santos", 92,
      "Outstanding presentation of AI/ML concepts. Very thorough and stable prototype.",
      g2Members,
      { ch1: 5, ch2: 5, rm: 5, sdm: 5, sm: 5, te: 5, ssp: 5, pres: { "John Doe": 5, "Jane Smith": 5, "Mark Johnson": 5 } }
    ),
    createPanelistEvaluation(
      "Dr. Maria Garcia", 91,
      "Impressed by the deep learning model integration and UI usability.",
      g2Members,
      { ch1: 5, ch2: 5, rm: 5, sdm: 5, sm: 5, te: 5, ssp: 5, pres: { "John Doe": 4, "Jane Smith": 5, "Mark Johnson": 5 } }
    )
  ],
  "3": [
    createPanelistEvaluation(
      "Dr. Elena Cruz", 88,
      "Strong business model with good market analysis.",
      g3Members,
      { ch1: 4, ch2: 5, rm: 4, sdm: 4, sm: 4, te: 4, ssp: 5, pres: { "Anna Lee": 4, "Thomas Clark": 4 } }
    ),
    createPanelistEvaluation(
      "Dr. Roberto Santos", 87,
      "Great implementation of payment gateway and agricultural logistics.",
      g3Members,
      { ch1: 4, ch2: 4, rm: 4, sdm: 4, sm: 4, te: 4, ssp: 5, pres: { "Anna Lee": 4, "Thomas Clark": 4 } }
    ),
    createPanelistEvaluation(
      "Dr. Maria Garcia", 89,
      "Clear supply chain solution, excellent presentation and delivery.",
      g3Members,
      { ch1: 4, ch2: 4, rm: 5, sdm: 4, sm: 4, te: 5, ssp: 5, pres: { "Anna Lee": 5, "Thomas Clark": 4 } }
    )
  ],
  "4": [
    createPanelistEvaluation(
      "Dr. Elena Cruz", 76,
      "Interesting IoT implementation, but needs more rigorous testing under latency.",
      g4Members,
      { ch1: 4, ch2: 4, rm: 3, sdm: 3, sm: 4, te: 3, ssp: 4, pres: { "Carlos Rivera": 4, "Jessica Park": 5, "David Kim": 4 } }
    ),
    createPanelistEvaluation(
      "Dr. Roberto Santos", 74,
      "Activity diagrams are a bit cluttered. Hardware setup works but could be optimized.",
      g4Members,
      { ch1: 3, ch2: 4, rm: 3, sdm: 3, sm: 3, te: 3, ssp: 4, pres: { "Carlos Rivera": 4, "Jessica Park": 4, "David Kim": 3 } }
    ),
    createPanelistEvaluation(
      "Dr. Maria Garcia", 75,
      "Good prototype. Ensure traffic flow algorithms are fully documented.",
      g4Members,
      { ch1: 4, ch2: 3, rm: 4, sdm: 3, sm: 4, te: 3, ssp: 4, pres: { "Carlos Rivera": 4, "Jessica Park": 4, "David Kim": 4 } }
    )
  ],
  "5": [
    createPanelistEvaluation(
      "Dr. Elena Cruz", 90,
      "Excellent analytics platform. High model accuracy and well-written literature review.",
      g5Members,
      { ch1: 5, ch2: 5, rm: 4, sdm: 5, sm: 5, te: 4, ssp: 5, pres: { "Maria Reyes": 5, "Luis Santos": 4 } }
    ),
    createPanelistEvaluation(
      "Dr. Roberto Santos", 89,
      "Comprehensive conceptual framework. Predictive results are useful for student profiling.",
      g5Members,
      { ch1: 4, ch2: 5, rm: 5, sdm: 4, sm: 5, te: 4, ssp: 5, pres: { "Maria Reyes": 4, "Luis Santos": 4 } }
    ),
    createPanelistEvaluation(
      "Dr. Maria Garcia", 91,
      "Outstanding visualization of student data. Excellent presentation delivery.",
      g5Members,
      { ch1: 5, ch2: 5, rm: 5, sdm: 5, sm: 5, te: 5, ssp: 5, pres: { "Maria Reyes": 5, "Luis Santos": 5 } }
    )
  ],
  "6": [
    createPanelistEvaluation(
      "Dr. Elena Cruz", 85,
      "Very practical inventory system for SMEs. Highly usable interface.",
      g6Members,
      { ch1: 4, ch2: 4, rm: 4, sdm: 4, sm: 4, te: 4, ssp: 4, pres: { "Kevin Tan": 4, "Patricia Lim": 4, "Roy Cruz": 4 } }
    ),
    createPanelistEvaluation(
      "Dr. Roberto Santos", 84,
      "Solid database design and sequence diagrams. Reliable web portal.",
      g6Members,
      { ch1: 4, ch2: 4, rm: 4, sdm: 4, sm: 4, te: 4, ssp: 4, pres: { "Kevin Tan": 4, "Patricia Lim": 4, "Roy Cruz": 4 } }
    ),
    createPanelistEvaluation(
      "Dr. Maria Garcia", 86,
      "Good support for local business workflows. Well defended.",
      g6Members,
      { ch1: 4, ch2: 4, rm: 4, sdm: 4, sm: 4, te: 4, ssp: 4, pres: { "Kevin Tan": 5, "Patricia Lim": 4, "Roy Cruz": 4 } }
    )
  ]
};
