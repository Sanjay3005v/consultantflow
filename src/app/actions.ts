
'use server';

import {
  generateSkillVectors,
  type GenerateSkillVectorsInput,
  type GenerateSkillVectorsOutput,
} from '@/ai/flows/skill-vector-generator';
import { updateConsultantSkills } from '@/lib/data';
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
