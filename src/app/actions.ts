
'use server';

import {
  generateSkillVectors,
  type GenerateSkillVectorsInput,
  type GenerateSkillVectorsOutput,
} from '@/ai/flows/skill-vector-generator';
import {
    attendanceMonitor,
    type AttendanceMonitorInput,
    type AttendanceMonitorOutput,
} from '@/ai/flows/attendance-agent';
import { updateConsultantSkills, createConsultant, findConsultantByEmail } from '@/lib/data';
import type { Consultant } from '@/lib/types';


export type AnalyzeResumeResult = {
    consultant: Consultant;
    feedback: string;
    historyLog: string;
}

export async function analyzeResume(
  consultantId: string,
  input: GenerateSkillVectorsInput
): Promise<AnalyzeResumeResult> {
  try {
    const result: GenerateSkillVectorsOutput = await generateSkillVectors(input);
    
    // Save the analysis result to the "database" and get the updated consultant
    const updatedConsultant = updateConsultantSkills(consultantId, result.skillAnalysis);
    
    if (!updatedConsultant) {
        throw new Error('Failed to find and update consultant.');
    }

    return {
        consultant: updatedConsultant,
        feedback: result.feedback,
        historyLog: result.historyLog,
    };

  } catch (error) {
    console.error('Error in analyzeResume server action:', error);
    throw new Error('Failed to analyze resume.');
  }
}

export async function createNewConsultant(data: { name: string; email: string; password: string; department: 'Technology' | 'Healthcare' | 'Finance' | 'Retail'; }): Promise<Consultant> {
    if (findConsultantByEmail(data.email)) {
        throw new Error('A consultant with this email already exists.');
    }
    const newConsultant = createConsultant(data);
    return newConsultant;
}

export async function verifyConsultantCredentials(credentials: Pick<Consultant, 'email' | 'password'>): Promise<{ consultantId: string } | { error: string }> {
    const consultant = findConsultantByEmail(credentials.email);
    if (consultant && consultant.password === credentials.password) {
        return { consultantId: consultant.id };
    }
    return { error: 'Invalid credentials' };
}


export async function getAttendanceFeedback(input: AttendanceMonitorInput): Promise<AttendanceMonitorOutput> {
    try {
        const result = await attendanceMonitor(input);
        return result;
    } catch (error) {
        console.error('Error getting attendance feedback:', error);
        throw new Error('Failed to get AI-powered attendance feedback.');
    }
}
