
'use server';

import {
  generateSkillVectors,
  type GenerateSkillVectorsInput,
  type GenerateSkillVectorsOutput,
} from '@/ai/flows/skill-vector-generator';
import { updateConsultantSkills } from '@/lib/data';
import type { SkillAnalysis } from '@/lib/types';


export async function analyzeResume(
  consultantId: string,
  input: GenerateSkillVectorsInput
): Promise<GenerateSkillVectorsOutput> {
  try {
    const result = await generateSkillVectors(input);
    
    // Save the analysis result to the "database"
    if (result.skillAnalysis) {
        updateConsultantSkills(consultantId, result.skillAnalysis as SkillAnalysis[]);
    }

    return result;
  } catch (error) {
    console.error('Error in analyzeResume server action:', error);
    throw new Error('Failed to analyze resume.');
  }
}
