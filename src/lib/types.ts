export type SkillAnalysis = {
  skill: string;
  rating: number;
  reasoning: string;
};

export type Consultant = {
  id: string;
  name: string;
  department: 'Technology' | 'Healthcare' | 'Finance' | 'Retail';
  status: 'On Bench' | 'On Project';
  resumeStatus: 'Updated' | 'Pending';
  attendance: {
    completed: number;
    missed: number;
  };
  opportunities: number;
  training: 'Not Started' | 'In Progress' | 'Completed';
  skills: string[] | SkillAnalysis[];
  workflow: {
    resumeUpdated: boolean;
    attendanceReported: boolean;
    opportunitiesDocumented: boolean;
    trainingCompleted: boolean;
  };
};
