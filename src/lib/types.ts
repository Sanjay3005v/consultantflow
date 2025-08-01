
export type SkillAnalysis = {
  skill: string;
  rating: number;
  reasoning: string;
};

export type AttendanceRecord = {
  date: string; // YYYY-MM-DD
  status: 'Present' | 'Absent';
};

export type Consultant = {
  id: string;
  name: string;
  email: string;
  password: string;
  department: 'Technology' | 'Healthcare' | 'Finance' | 'Retail';
  status: 'On Bench' | 'On Project';
  resumeStatus: 'Updated' | 'Pending';
  attendance: AttendanceRecord[];
  opportunities: number;
  training: 'Not Started' | 'In Progress' | 'Completed';
  skills: (string | SkillAnalysis)[];
  workflow: {
    resumeUpdated: boolean;
    attendanceReported: boolean;
    opportunitiesDocumented: boolean;
    trainingCompleted: boolean;
  };
  totalWorkingDays: number;
  selectedOpportunities: string[];
};

export type JobOpportunity = {
    id: string;
    title: string;
    neededSkills: string[];
    neededYOE: number;
    responsibilities: string;
}
