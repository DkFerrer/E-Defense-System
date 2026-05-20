export const DEPARTMENTS = [
  {
    id: 'snss',
    name: 'School of Social and Natural Sciences',
    programs: [
      { id: 'ab-psychology', name: 'AB Psychology' },
      { id: 'ab-political-science', name: 'AB Political Science' },
      { id: 'bs-biology', name: 'BS Biology' }
    ]
  },
  {
    id: 'sba',
    name: 'School of Business and Accountancy',
    programs: [
      { id: 'bs-accountancy', name: 'BS Accountancy' },
      { id: 'bs-tourism', name: 'BS Tourism Management' },
      { id: 'bs-financial', name: 'BS Financial Management' },
      { id: 'bs-hospitality', name: 'BS Hospitality Management' },
      { id: 'bs-entrepreneurship', name: 'BS Entrepreneurship' },
      { id: 'bs-business-admin', name: 'BS Business Administration' }
    ]
  },
  {
    id: 'scis',
    name: 'School of Computer and Information Sciences',
    programs: [
      { id: 'bs-cs', name: 'BS Computer Science' },
      { id: 'bs-it', name: 'BS Information Technology' },
      { id: 'blis', name: 'BLIS' },
      { id: 'act', name: 'ACT' }
    ]
  },
  {
    id: 'ste',
    name: 'School of Teacher Education',
    programs: [
      { id: 'beed', name: 'BEED' },
      { id: 'bsed', name: 'BSED' },
      { id: 'bped', name: 'BPED' }
    ]
  },
  {
    id: 'snahs',
    name: 'School of Nursing and Allied Health Sciences',
    programs: [
      { id: 'bs-nursing', name: 'BS Nursing' }
    ]
  },
  {
    id: 'cea',
    name: 'College of Engineering and Architecture',
    programs: [
      { id: 'bs-civil', name: 'BS Civil Engineering' },
      { id: 'bs-mechanical', name: 'BS Mechanical Engineering' },
      { id: 'bs-computer-eng', name: 'BS Computer Engineering' },
      { id: 'bs-electrical', name: 'BS Electrical Engineering' },
      { id: 'bs-ece', name: 'BS Electronics and Communication Engineering' },
      { id: 'bs-interior', name: 'BS Interior Design' },
      { id: 'bs-architecture', name: 'BS Architecture' }
    ]
  },
  {
    id: 'ccj',
    name: 'College of Criminal Justice',
    programs: [
      { id: 'bs-criminology', name: 'BS Criminology' },
      { id: 'bs-forensic', name: 'BS Forensic Science' }
    ]
  }
];

export const DEFENSE_STAGES = [
  { id: 'title', name: 'Title Defense' },
  { id: 'review', name: 'Review Defense' },
  { id: 'final', name: 'Final Defense' }
];

export function getDepartmentById(id) {
  return DEPARTMENTS.find(dept => dept.id === id);
}

export function getProgramById(departmentId, programId) {
  const dept = getDepartmentById(departmentId);
  return dept?.programs.find(prog => prog.id === programId);
}
