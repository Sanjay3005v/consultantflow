
'use server';

import {
  generateSkillVectors,
  type GenerateSkillVectorsInput,
} from '@/ai/flows/skill-vector-generator';
import { updateConsultantSkills } from '@/lib/data';
import type { Consultant } from '@/lib/types';


export async function analyzeResume(
  consultantId: string,
  input: GenerateSkillVectorsInput
): Promise<Consultant> {
  try {
    const result = await generateSkillVectors(input);
    
    // Save the analysis result to the "database" and get the updated consultant
    const updatedConsultant = updateConsultantSkills(consultantId, result.skillAnalysis);
    
    if (!updatedConsultant) {
        throw new Error('Failed to find and update consultant.');
    }

    return updatedConsultant;
  } catch (error) {
    console.error('Error in analyzeResume server action:', error);
    throw new Error('Failed to analyze resume.');
  }
}
