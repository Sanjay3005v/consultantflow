
import type { Consultant, SkillAnalysis } from './types';

// NOTE: In a real application, this data would be fetched from a database
// and mutations would be handled by API calls.

// Use a global variable to hold the data in development to prevent it from being
// reset on hot-reloads. In production, this will behave like a normal module-level variable.
declare global {
  var consultants: Consultant[] | undefined;
}

const initialConsultants: Consultant[] = [
  {
    id: '1',
    name: 'Alice Johnson',
    email: 'alice@example.com',
    password: 'password123',
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
    skills: [],
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
    email: 'bob@example.com',
    password: 'password123',
    department: 'Finance',
    status: 'On Project',
    resumeStatus: 'Pending',
    attendance: [
        { date: '2024-07-01', status: 'Present' },
        { date: '2024-07-08', status: 'Present' },
        { date: '2024-07-15', status: 'Present' },
    ],
    opportunities: 5,
    training: 'Completed',
    skills: [],
    workflow: {
      resumeUpdated: false,
      attendanceReported: true,
      opportunitiesDocumented: true,
      trainingCompleted: true,
    },
  },
  {
    id: '3',
    name: 'Charlie Brown',
    email: 'charlie@example.com',
    password: 'password123',
    department: 'Healthcare',
    status: 'On Bench',
    resumeStatus: 'Pending',
    attendance: [
        { date: '2024-07-01', status: 'Present' },
        { date: '2024-07-08', status: 'Present' },
        { date: '2024-07-15', status: 'Absent' },
    ],
    opportunities: 2,
    training: 'Not Started',
    skills: [],
    workflow: {
      resumeUpdated: false,
      attendanceReported: true,
      opportunitiesDocumented: true,
      trainingCompleted: false,
    },
  },
  {
    id: '4',
    name: 'Diana Prince',
    email: 'diana@example.com',
    password: 'password123',
    department: 'Technology',
    status: 'On Project',
    resumeStatus: 'Pending',
    attendance: [
        { date: '2024-07-01', status: 'Present' },
        { date: '2024-07-08', status: 'Present' },
        { date: '2024-07-15', status: 'Present' },
    ],
    opportunities: 6,
    training: 'Completed',
    skills: [],
    workflow: {
      resumeUpdated: false,
      attendanceReported: true,
      opportunitiesDocumented: true,
      trainingCompleted: true,
    },
  },
  {
    id: '5',
    name: 'Ethan Hunt',
    email: 'ethan@example.com',
    password: 'password123',
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
    skills: [],
    workflow: {
      resumeUpdated: false,
      attendanceReported: true,
      opportunitiesDocumented: false,
      trainingCompleted: false,
    },
  },
];

// This is the correct way to ensure the in-memory "database" persists in development.
if (process.env.NODE_ENV === 'production') {
  global.consultants = initialConsultants;
} else {
  if (!global.consultants) {
    global.consultants = initialConsultants;
  }
}

const consultants = global.consultants;


export const getConsultantById = (id: string): Consultant | undefined => {
    // Use == to handle potential type mismatch between string and number (e.g., '6' == 6)
    return consultants.find(c => c.id == id);
}

export const getAllConsultants = (): Consultant[] => {
    return consultants;
}

export const findConsultantByEmail = (email: string): Consultant | undefined => {
    return consultants.find(c => c.email.toLowerCase() === email.toLowerCase());
}

export const updateConsultantAttendance = (id: string, date: string, status: 'Present' | 'Absent') => {
    let updatedConsultant: Consultant | undefined;
    
    const consultantIndex = consultants.findIndex(c => c.id === id);
    if (consultantIndex === -1) return undefined;

    const consultant = consultants[consultantIndex];
    const newAttendance = [...consultant.attendance];
    const recordIndex = newAttendance.findIndex(a => a.date === date);

    if (recordIndex > -1) {
        newAttendance[recordIndex].status = status;
    } else {
        newAttendance.push({ date, status });
    }
    
    updatedConsultant = { ...consultant, attendance: newAttendance };
    consultants[consultantIndex] = updatedConsultant;

    return updatedConsultant;
};

export const updateConsultantSkills = (id: string, skills: SkillAnalysis[]) => {
  let updatedConsultant: Consultant | undefined;
  const consultantIndex = consultants.findIndex(c => c.id === id);
  if (consultantIndex === -1) return undefined;

  const consultant = consultants[consultantIndex];
  updatedConsultant = {
    ...consultant,
    skills: skills,
    resumeStatus: 'Updated',
    workflow: { ...consultant.workflow, resumeUpdated: true }
  };
  consultants[consultantIndex] = updatedConsultant;
  
  return updatedConsultant;
};

export const addSkillToConsultant = (id: string, newSkill: SkillAnalysis) => {
    const consultantIndex = consultants.findIndex(c => c.id === id);
    if (consultantIndex === -1) return undefined;

    const consultant = consultants[consultantIndex];
    
    const isSkillAnalysis = (skill: string | SkillAnalysis): skill is SkillAnalysis => {
        return typeof skill === 'object' && 'rating' in skill;
    }
    
    let currentSkills: SkillAnalysis[] = [];
    if (consultant.skills.length > 0 && isSkillAnalysis(consultant.skills[0])) {
        currentSkills = consultant.skills as SkillAnalysis[];
    }
    
    const updatedSkills = [...currentSkills, newSkill];

    const updatedConsultant: Consultant = {
        ...consultant,
        skills: updatedSkills,
        training: 'Completed',
        workflow: { ...consultant.workflow, trainingCompleted: true }
    };
    consultants[consultantIndex] = updatedConsultant;
    
    return updatedConsultant;
};


export const createConsultant = (data: { name: string; department: 'Technology' | 'Healthcare' | 'Finance' | 'Retail', status: 'On Bench' | 'On Project', training: 'Not Started' | 'In Progress' | 'Completed' }) => {
    const newConsultant: Consultant = {
        name: data.name,
        email: `${data.name.toLowerCase().replace(' ', '.')}@example.com`,
        password: 'password123',
        department: data.department,
        id: (consultants.length + 1).toString(),
        status: data.status,
        training: data.training,
        resumeStatus: 'Pending',
        attendance: [],
        opportunities: 0,
        skills: [],
        workflow: {
            resumeUpdated: false,
            attendanceReported: false,
            opportunitiesDocumented: false,
            trainingCompleted: false,
        },
    };
    consultants.push(newConsultant);
    return newConsultant;
};
