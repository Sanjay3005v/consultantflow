import type { Consultant } from './types';

export const consultants: Consultant[] = [
  {
    id: '1',
    name: 'Alice Johnson',
    department: 'Technology',
    status: 'On Bench',
    resumeStatus: 'Pending',
    attendance: { completed: 8, missed: 2 },
    opportunities: 3,
    training: 'In Progress',
    skills: ['React', 'Node.js', 'TypeScript', 'AWS'],
    workflow: {
      resumeUpdated: false,
      attendanceReported: true,
      opportunitiesDocumented: true,
      trainingCompleted: false,
    },
  },
  {
    id: '2',
    name: 'Bob Williams',
    department: 'Finance',
    status: 'On Project',
    resumeStatus: 'Updated',
    attendance: { completed: 10, missed: 0 },
    opportunities: 5,
    training: 'Completed',
    skills: ['Python', 'Data Analysis', 'SQL', 'Tableau'],
    workflow: {
      resumeUpdated: true,
      attendanceReported: true,
      opportunitiesDocumented: true,
      trainingCompleted: true,
    },
  },
  {
    id: '3',
    name: 'Charlie Brown',
    department: 'Healthcare',
    status: 'On Bench',
    resumeStatus: 'Updated',
    attendance: { completed: 9, missed: 1 },
    opportunities: 2,
    training: 'Not Started',
    skills: ['HL7', 'FHIR', 'Project Management', 'HIPAA'],
    workflow: {
      resumeUpdated: true,
      attendanceReported: true,
      opportunitiesDocumented: true,
      trainingCompleted: false,
    },
  },
  {
    id: '4',
    name: 'Diana Prince',
    department: 'Technology',
    status: 'On Project',
    resumeStatus: 'Updated',
    attendance: { completed: 10, missed: 0 },
    opportunities: 6,
    training: 'Completed',
    skills: ['Java', 'Spring Boot', 'Microservices', 'GCP'],
    workflow: {
      resumeUpdated: true,
      attendanceReported: true,
      opportunitiesDocumented: true,
      trainingCompleted: true,
    },
  },
  {
    id: '5',
    name: 'Ethan Hunt',
    department: 'Retail',
    status: 'On Bench',
    resumeStatus: 'Pending',
    attendance: { completed: 7, missed: 3 },
    opportunities: 1,
    training: 'In Progress',
    skills: ['Salesforce', 'CRM', 'Agile', 'Scrum Master'],
    workflow: {
      resumeUpdated: false,
      attendanceReported: true,
      opportunitiesDocumented: false,
      trainingCompleted: false,
    },
  },
];

export const getConsultantById = (id: string): Consultant | undefined => {
    return consultants.find(c => c.id === id);
}

export const getAllConsultants = (): Consultant[] => {
    return consultants;
}
