
'use server';

import {
  generateSkillVectors,
  type GenerateSkillVectorsInput,
  type GenerateSkillVectorsOutput,
} from '@/ai/flows/skill-vector-generator';
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

export async function createNewConsultant(data: Omit<Consultant, 'id' | 'attendance' | 'opportunities' | 'workflow' | 'resumeStatus' | 'skills' | 'status' | 'training'>): Promise<Consultant> {
    if (findConsultantByEmail(data.email)) {
        throw new Error('A consultant with this email already exists.');
    }
    const newConsultant = createConsultant({
        name: data.name,
        email: data.email,
        password: data.password,
        department: data.department,
        status: 'On Bench',
        training: 'Not Started',
    });
    return newConsultant;
}

export async function verifyConsultantCredentials(credentials: Pick<Consultant, 'email' | 'password'>): Promise<{ consultantId: string } | { error: string }> {
    const consultant = findConsultantByEmail(credentials.email);
    if (consultant && consultant.password === credentials.password) {
        return { consultantId: consultant.id };
    }
    return { error: 'Invalid credentials' };
}
