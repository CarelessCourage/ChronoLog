export const PROJECTS = [
  'ChronoLog System',
  'Victor Integration',
  'Compliance Portal',
  'Time Tracking Engine',
  'Vacation',
  'Sick Leave',
  'Personal Development',
  'Administrative Tasks'
] as const;

export type ProjectType = typeof PROJECTS[number];

export const REQUIRED_HOURS_PER_DAY = 7.5;

export interface ComplianceRule {
  project: string;
  requiredDays: string[]; // e.g., ['monday', 'tuesday']
  minimumHours?: number;
}

export const COMPLIANCE_RULES: ComplianceRule[] = [
  {
    project: 'ChronoLog System',
    requiredDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
    minimumHours: 2
  }
];
