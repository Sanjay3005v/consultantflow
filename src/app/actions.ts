'use server';

import {
  generateSkillVectors,
  type GenerateSkillVectorsInput,
  type GenerateSkillVectorsOutput,
} from '@/ai/flows/skill-vector-generator';

export async function analyzeResume(
  input: GenerateSkillVectorsInput
): Promise<GenerateSkillVectorsOutput> {
  // Here you could add logic to save the result to a database,
  // update the consultant's profile, etc.
  try {
    const result = await generateSkillVectors(input);
    return result;
  } catch (error) {
    console.error('Error in analyzeResume server action:', error);
    throw new Error('Failed to analyze resume.');
  }
}
