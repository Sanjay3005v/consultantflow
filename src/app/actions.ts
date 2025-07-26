
'use server';

import {
  generateSkillVectors,
  type GenerateSkillVectorsInput,
  type GenerateSkillVectorsOutput,
} from '@/ai/flows/skill-vector-generator';
import { updateConsultantSkills, createConsultant } from '@/lib/data';
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

export async function createNewConsultant(data: { name: string; department: 'Technology' | 'Healthcare' | 'Finance' | 'Retail' }): Promise<Consultant> {
    try {
        const newConsultant = createConsultant({
            name: data.name,
            department: data.department,
            // These are default values for a new consultant
            status: 'On Bench',
            training: 'Not Started',
        });
        return newConsultant;
    } catch (error) {
        console.error('Error creating new consultant:', error);
        throw new Error('Failed to create new consultant.');
    }
}
