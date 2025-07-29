import type { Consultant, SkillAnalysis, AttendanceRecord } from './types';

let consultants: Consultant[] = [
    {
        id: '1',
        name: 'Alex Johnson',
        email: 'alex.j@example.com',
        password: 'password123',
        department: 'Technology',
        status: 'On Bench',
        resumeStatus: 'Pending',
        attendance: [
            { date: '2023-07-01', status: 'Present' },
            { date: '2023-07-02', status: 'Present' },
        ],
        opportunities: 5,
        training: 'In Progress',
        skills: ['React', 'Node.js', 'TypeScript'],
        workflow: {
            resumeUpdated: false,
            attendanceReported: true,
            opportunitiesDocumented: true,
            trainingCompleted: false,
        },
    },
    {
        id: '2',
        name: 'Maria Garcia',
        email: 'maria.g@example.com',
        password: 'password123',
        department: 'Healthcare',
        status: 'On Project',
        resumeStatus: 'Updated',
        attendance: [],
        opportunities: 2,
        training: 'Completed',
        skills: [
            { skill: 'HL7', rating: 8, reasoning: '5 years of experience with HL7 integration projects.' },
            { skill: 'FHIR', rating: 7, reasoning: 'Certified FHIR professional.' },
        ],
        workflow: {
            resumeUpdated: true,
            attendanceReported: true,
            opportunitiesDocumented: true,
            trainingCompleted: true,
        },
    },
     {
        id: '3',
        name: 'Sam Chen',
        email: 'sam.c@example.com',
        password: 'password123',
        department: 'Finance',
        status: 'On Bench',
        resumeStatus: 'Pending',
        attendance: [],
        opportunities: 8,
        training: 'Not Started',
        skills: ['Financial Modeling', 'Risk Analysis'],
        workflow: {
            resumeUpdated: false,
            attendanceReported: false,
            opportunitiesDocumented: true,
            trainingCompleted: false,
        },
    },
    {
        id: '4',
        name: 'Jessica Williams',
        email: 'jessica.w@example.com',
        password: 'password123',
        department: 'Retail',
        status: 'On Project',
        resumeStatus: 'Updated',
        attendance: [],
        opportunities: 3,
        training: 'Completed',
        skills: [
            { skill: 'Salesforce Commerce Cloud', rating: 9, reasoning: 'Led three major platform migrations.' },
            { skill: 'Demandware', rating: 7, reasoning: 'Extensive experience in legacy system.' },
        ],
        workflow: {
            resumeUpdated: true,
            attendanceReported: true,
            opportunitiesDocumented: true,
            trainingCompleted: true,
        },
    },
    {
        id: '5',
        name: 'Ben Carter',
        email: 'ben.c@example.com',
        password: 'password123',
        department: 'Technology',
        status: 'On Bench',
        resumeStatus: 'Updated',
        attendance: [],
        opportunities: 12,
        training: 'In Progress',
        skills: [
            { skill: 'AWS', rating: 8, reasoning: 'AWS Certified Solutions Architect.' },
            { skill: 'Kubernetes', rating: 6, reasoning: 'Managed container orchestration for two large projects.' },
            { skill: 'Terraform', rating: 7, reasoning: 'Experience with Infrastructure as Code (IaC).' },
        ],
        workflow: {
            resumeUpdated: true,
            attendanceReported: false,
            opportunitiesDocumented: true,
            trainingCompleted: false,
        },
    },
     {
        id: '6',
        name: 'Emily Davis',
        email: 'emily.d@example.com',
        password: 'password123',
        department: 'Technology',
        status: 'On Project',
        resumeStatus: 'Updated',
        attendance: [],
        opportunities: 4,
        training: 'Completed',
        skills: [
            { skill: 'Cybersecurity', rating: 8, reasoning: 'Certified Ethical Hacker (CEH).' },
            { skill: 'Penetration Testing', rating: 7, reasoning: 'Conducted regular security audits.' },
        ],
        workflow: {
            resumeUpdated: true,
            attendanceReported: true,
            opportunitiesDocumented: true,
            trainingCompleted: true,
        },
    },
];

export const getConsultantById = (id: string): Consultant | undefined => {
  return consultants.find((c) => c.id === id);
};

export const getAllConsultants = (): Consultant[] => {
  return consultants;
};

export const findConsultantByEmail = (email: string): Consultant | undefined => {
    return consultants.find((c) => c.email.toLowerCase() === email.toLowerCase());
};

export const updateConsultantAttendance = (id: string, date: string, status: 'Present' | 'Absent') => {
    const consultant = getConsultantById(id);
    if (consultant) {
        const existingRecord = consultant.attendance.find(a => a.date === date);
        if (existingRecord) {
            existingRecord.status = status;
        } else {
            consultant.attendance.push({ date, status });
        }
        return consultant;
    }
    return undefined;
};


export const updateConsultantSkills = (id: string, newSkills: SkillAnalysis[]) => {
  const consultant = getConsultantById(id);
  if (consultant) {
    consultant.skills = newSkills;
    consultant.resumeStatus = 'Updated';
    consultant.workflow.resumeUpdated = true;
    return consultant;
  }
  return undefined;
};

export const addSkillToConsultant = (id: string, newSkill: SkillAnalysis) => {
    const consultant = getConsultantById(id);
    if (consultant) {
        const existingSkills = (consultant.skills as SkillAnalysis[]).filter(s => typeof s === 'object');
        consultant.skills = [...existingSkills, newSkill];
        consultant.training = 'Completed';
        consultant.workflow.trainingCompleted = true;
        return consultant;
    }
    return undefined;
};

export const createConsultant = (data: { name: string; email: string; password?: string; department: 'Technology' | 'Healthcare' | 'Finance' | 'Retail', status?: 'On Bench' | 'On Project', training?: 'Not Started' | 'In Progress' | 'Completed' }) => {
    const newId = (Math.max(...consultants.map(c => parseInt(c.id, 10))) + 1).toString();
    const newConsultant: Consultant = {
        id: newId,
        name: data.name,
        email: data.email,
        password: data.password || 'password123',
        department: data.department,
        status: data.status || 'On Bench',
        training: data.training || 'Not Started',
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
