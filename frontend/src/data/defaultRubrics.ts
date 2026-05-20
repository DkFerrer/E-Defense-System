export const defaultRubrics = {
  title: {
    name: 'Standard Title Defense Rubric',
    criteria: [
      { id: 'doc-context', name: 'Project Context', maxPoints: 10 },
      { id: 'doc-goals', name: 'Ideas and Objectives', maxPoints: 15 },
    ],
  },
  review: {
    name: 'Standard Review Defense Rubric',
    criteria: [
      { id: 'doc-context', name: 'Technical Progress', maxPoints: 20 },
    ],
  },
  final: {
    name: 'Standard Final Defense Rubric',
    criteria: [
      { id: 'doc-context', name: 'Research Contribution', maxPoints: 25 },
    ],
  },
};
