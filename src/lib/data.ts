import type { Consultant } from './types';

// NOTE: In a real application, this data would be fetched from a database
// and mutations would be handled by API calls.
export let consultants: Consultant[] = [
  {
    id: '1',
    name: 'Alice Johnson',
    department: 'Technology',
    status: 'On Bench',
    resumeStatus: 'Pending',
    attendance: [
      { date: '2024-07-01', status: 'Present' },
      { date: '2024-07-08', status: 'Present' },
      { date: '2024-07-15', status: 'Absent' },
    ],
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
    attendance: [
        { date: '2024-07-01', status: 'Present' },
        { date: '2024-07-08', status: 'Present' },
        { date: '2024-07-15', status: 'Present' },
    ],
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
    attendance: [
        { date: '2024-07-01', status: 'Present' },
        { date: '2024-07-08', status: 'Present' },
        { date: '2024-07-15', status: 'Absent' },
    ],
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
    attendance: [
        { date: '2024-07-01', status: 'Present' },
        { date: '2024-07-08', status: 'Present' },
        { date: '2024-07-15', status: 'Present' },
    ],
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
    attendance: [
        { date: '2024-07-01', status: 'Present' },
        { date: '2024-07-08', status: 'Absent' },
        { date: '2024-07-15', status: 'Absent' },
    ],
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

export const updateConsultantAttendance = (id: string, date: string, status: 'Present' | 'Absent') => {
    consultants = consultants.map(c => {
        if (c.id === id) {
            const newAttendance = [...c.attendance];
            const recordIndex = newAttendance.findIndex(a => a.date === date);
            if (recordIndex > -1) {
                newAttendance[recordIndex].status = status;
            } else {
                newAttendance.push({ date, status });
            }
            return { ...c, attendance: newAttendance };
        }
        return c;
    });
    return consultants.find(c => c.id === id);
};
