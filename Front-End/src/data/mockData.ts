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
  studentPresentations?: {
    studentName: string;
    criteria: EvaluationCriterion[];
  }[];
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
      studentPresentations: [
        {
          studentName: "Sarah Williams",
          criteria: [
            { criterion: "Organization and Delivery", maxPoints: 10, description: "Presentation is clear, logically structured, and professionally delivered.", score: 8, comment: "Excellent presentation flow." },
            { criterion: "Technical Depth & Mastery", maxPoints: 15, description: "Demonstrates comprehensive technical knowledge and project understanding.", score: 13, comment: "Very strong understanding of smart contracts." },
            { criterion: "Response to Questions", maxPoints: 15, description: "Answers panel questions clearly, precisely, and confidently.", score: 13, comment: "Answered testing questions cleanly." }
          ]
        },
        {
          studentName: "Michael Brown",
          criteria: [
            { criterion: "Organization and Delivery", maxPoints: 10, description: "Presentation is clear, logically structured, and professionally delivered.", score: 7, comment: "Good presentation but read a bit from slides." },
            { criterion: "Technical Depth & Mastery", maxPoints: 15, description: "Demonstrates comprehensive technical knowledge and project understanding.", score: 12, comment: "Strong knowledge of the architecture." },
            { criterion: "Response to Questions", maxPoints: 15, description: "Answers panel questions clearly, precisely, and confidently.", score: 12, comment: "Answered database queries well." }
          ]
        }
      ]
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
      studentPresentations: [
        {
          studentName: "Sarah Williams",
          criteria: [
            { criterion: "Organization and Delivery", maxPoints: 10, description: "Presentation is clear, logically structured, and professionally delivered.", score: 8, comment: "Highly articulate and professional." },
            { criterion: "Technical Depth & Mastery", maxPoints: 15, description: "Demonstrates comprehensive technical knowledge and project understanding.", score: 12, comment: "Clear explanation of technical concepts." },
            { criterion: "Response to Questions", maxPoints: 15, description: "Answers panel questions clearly, precisely, and confidently.", score: 12, comment: "Handled security questions well." }
          ]
        },
        {
          studentName: "Michael Brown",
          criteria: [
            { criterion: "Organization and Delivery", maxPoints: 10, description: "Presentation is clear, logically structured, and professionally delivered.", score: 7, comment: "Clear slides but pacing was slightly fast." },
            { criterion: "Technical Depth & Mastery", maxPoints: 15, description: "Demonstrates comprehensive technical knowledge and project understanding.", score: 11, comment: "Understands user management systems thoroughly." },
            { criterion: "Response to Questions", maxPoints: 15, description: "Answers panel questions clearly, precisely, and confidently.", score: 11, comment: "Struggled slightly on optimization answers." }
          ]
        }
      ]
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
      studentPresentations: [
        {
          studentName: "Sarah Williams",
          criteria: [
            { criterion: "Organization and Delivery", maxPoints: 10, description: "Presentation is clear, logically structured, and professionally delivered.", score: 8, comment: "Excellent posture and slides structure." },
            { criterion: "Technical Depth & Mastery", maxPoints: 15, description: "Demonstrates comprehensive technical knowledge and project understanding.", score: 13, comment: "Demonstrated solid technical skill." },
            { criterion: "Response to Questions", maxPoints: 15, description: "Answers panel questions clearly, precisely, and confidently.", score: 12, comment: "Polite and accurate answers." }
          ]
        },
        {
          studentName: "Michael Brown",
          criteria: [
            { criterion: "Organization and Delivery", maxPoints: 10, description: "Presentation is clear, logically structured, and professionally delivered.", score: 7, comment: "Presented with confidence. Good energy." },
            { criterion: "Technical Depth & Mastery", maxPoints: 15, description: "Demonstrates comprehensive technical knowledge and project understanding.", score: 12, comment: "Solid overview of core technologies." },
            { criterion: "Response to Questions", maxPoints: 15, description: "Answers panel questions clearly, precisely, and confidently.", score: 13, comment: "Gave concrete examples during Q&A." }
          ]
        }
      ]
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
      studentPresentations: [
        {
          studentName: "John Doe",
          criteria: [
            { criterion: "Organization and Delivery", maxPoints: 10, description: "Presentation is clear, logically structured, and professionally delivered.", score: 9, comment: "Articulate speaker with strong slides." },
            { criterion: "Technical Depth & Mastery", maxPoints: 15, description: "Demonstrates comprehensive technical knowledge and project understanding.", score: 14, comment: "Deep understanding of the neural networks used." },
            { criterion: "Response to Questions", maxPoints: 15, description: "Answers panel questions clearly, precisely, and confidently.", score: 14, comment: "Answered complex algorithmic questions with ease." }
          ]
        },
        {
          studentName: "Jane Smith",
          criteria: [
            { criterion: "Organization and Delivery", maxPoints: 10, description: "Presentation is clear, logically structured, and professionally delivered.", score: 9, comment: "Incredibly professional and engaging." },
            { criterion: "Technical Depth & Mastery", maxPoints: 15, description: "Demonstrates comprehensive technical knowledge and project understanding.", score: 15, comment: "Perfect mastery of system integrations." },
            { criterion: "Response to Questions", maxPoints: 15, description: "Answers panel questions clearly, precisely, and confidently.", score: 15, comment: "Masterful responses, cited sources effortlessly." }
          ]
        },
        {
          studentName: "Mark Johnson",
          criteria: [
            { criterion: "Organization and Delivery", maxPoints: 10, description: "Presentation is clear, logically structured, and professionally delivered.", score: 8, comment: "Solid presentation, kept within time limit." },
            { criterion: "Technical Depth & Mastery", maxPoints: 15, description: "Demonstrates comprehensive technical knowledge and project understanding.", score: 13, comment: "Excellent understanding of the training datasets." },
            { criterion: "Response to Questions", maxPoints: 15, description: "Answers panel questions clearly, precisely, and confidently.", score: 14, comment: "Handled database and hosting questions well." }
          ]
        }
      ]
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
      studentPresentations: [
        {
          studentName: "Anna Lee",
          criteria: [
            { criterion: "Organization and Delivery", maxPoints: 10, description: "Presentation is clear, logically structured, and professionally delivered.", score: 8, comment: "Good tone and presentation flow." },
            { criterion: "Technical Depth & Mastery", maxPoints: 15, description: "Demonstrates comprehensive technical knowledge and project understanding.", score: 13, comment: "Strong knowledge of agricultural supply chains." },
            { criterion: "Response to Questions", maxPoints: 14, description: "Answers panel questions clearly, precisely, and confidently.", score: 14, comment: "Confident answers about market entry." }
          ]
        },
        {
          studentName: "Thomas Clark",
          criteria: [
            { criterion: "Organization and Delivery", maxPoints: 10, description: "Presentation is clear, logically structured, and professionally delivered.", score: 8, comment: "Polished slides, very good interaction." },
            { criterion: "Technical Depth & Mastery", maxPoints: 15, description: "Demonstrates comprehensive technical knowledge and project understanding.", score: 12, comment: "Solid overview of payment gateways used." },
            { criterion: "Response to Questions", maxPoints: 15, description: "Answers panel questions clearly, precisely, and confidently.", score: 13, comment: "Handled security and privacy queries well." }
          ]
        }
      ]
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
      studentPresentations: [
        {
          studentName: "Carlos Rivera",
          criteria: [
            { criterion: "Organization and Delivery", maxPoints: 10, description: "Presentation is clear, logically structured, and professionally delivered.", score: 9, comment: "Engaging delivery and clear pacing." },
            { criterion: "Technical Depth & Mastery", maxPoints: 15, description: "Demonstrates comprehensive technical knowledge and project understanding.", score: 15, comment: "Masterful IoT architecture explanation." },
            { criterion: "Response to Questions", maxPoints: 15, description: "Answers panel questions clearly, precisely, and confidently.", score: 14, comment: "Answered network latency questions brilliantly." }
          ]
        },
        {
          studentName: "Jessica Park",
          criteria: [
            { criterion: "Organization and Delivery", maxPoints: 10, description: "Presentation is clear, logically structured, and professionally delivered.", score: 10, comment: "Perfect presentation delivery." },
            { criterion: "Technical Depth & Mastery", maxPoints: 15, description: "Demonstrates comprehensive technical knowledge and project understanding.", score: 15, comment: "Invaluable technical contribution." },
            { criterion: "Response to Questions", maxPoints: 15, description: "Answers panel questions clearly, precisely, and confidently.", score: 15, comment: "Outstanding responses. Handled questions like an expert." }
          ]
        },
        {
          studentName: "David Kim",
          criteria: [
            { criterion: "Organization and Delivery", maxPoints: 10, description: "Presentation is clear, logically structured, and professionally delivered.", score: 9, comment: "Well-structured slides, very professional." },
            { criterion: "Technical Depth & Mastery", maxPoints: 15, description: "Demonstrates comprehensive technical knowledge and project understanding.", score: 14, comment: "Strong understanding of traffic models." },
            { criterion: "Response to Questions", maxPoints: 15, description: "Answers panel questions clearly, precisely, and confidently.", score: 14, comment: "Gave clear answers to hardware integration questions." }
          ]
        }
      ]
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
      studentPresentations: [
        {
          studentName: "Maria Reyes",
          criteria: [
            { criterion: "Organization and Delivery", maxPoints: 10, description: "Presentation is clear, logically structured, and professionally delivered.", score: 9, comment: "Presented with great clarity and poise." },
            { criterion: "Technical Depth & Mastery", maxPoints: 15, description: "Demonstrates comprehensive technical knowledge and project understanding.", score: 14, comment: "Excellent command over dataset details." },
            { criterion: "Response to Questions", maxPoints: 15, description: "Answers panel questions clearly, precisely, and confidently.", score: 13, comment: "Handled data cleaning questions expertly." }
          ]
        },
        {
          studentName: "Luis Santos",
          criteria: [
            { criterion: "Organization and Delivery", maxPoints: 10, description: "Presentation is clear, logically structured, and professionally delivered.", score: 8, comment: "Strong slides, very good engagement." },
            { criterion: "Technical Depth & Mastery", maxPoints: 15, description: "Demonstrates comprehensive technical knowledge and project understanding.", score: 13, comment: "Very good understanding of predictive model outputs." },
            { criterion: "Response to Questions", maxPoints: 15, description: "Answers panel questions clearly, precisely, and confidently.", score: 13, comment: "Handled panel inquiries on model accuracy well." }
          ]
        }
      ]
    },
  ],
};
