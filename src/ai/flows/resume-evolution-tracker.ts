
'use server';

/**
 * @fileOverview An AI agent for tracking the evolution of a consultant's resume.
 *
 * - trackResumeEvolution - A function that compares a new resume to a previous skill analysis.
 * - TrackResumeEvolutionInput - The input type for the trackResumeEvolution function.
 * - TrackResumeEvolutionOutput - The return type for the trackResumeEvolution function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import type { SkillAnalysis } from '@/lib/types';

const SkillChangeSchema = z.object({
  skill: z.string().describe('The name of the skill.'),
  oldRating: z.number().nullable().describe('The previous proficiency rating (1-10). Null if the skill is new.'),
  newRating: z.number().nullable().describe('The new proficiency rating (1-10). Null if the skill was removed.'),
  change: z.enum(['Added', 'Removed', 'Improved', 'Decreased', 'Unchanged']).describe('The type of change that occurred.'),
});

const TrackResumeEvolutionInputSchema = z.object({
  newResumeDataUri: z
    .string()
    .describe(
      "The new version of the consultant's resume as a data URI."
    ),
  previousSkillAnalysis: z
    .array(
      z.object({
        skill: z.string(),
        rating: z.number(),
        reasoning: z.string(),
      })
    )
    .describe('The skill analysis from the previous version of the resume.'),
});
export type TrackResumeEvolutionInput = z.infer<typeof TrackResumeEvolutionInputSchema>;

const TrackResumeEvolutionOutputSchema = z.object({
  skillChanges: z.array(SkillChangeSchema).describe('A table detailing the changes in skills and ratings.'),
  summaryOfImprovements: z.string().describe('A paragraph summarizing the key improvements made to the resume.'),
  oldOverallScore: z.number().describe('The calculated average score of the previous resume version.'),
  newOverallScore: z.number().describe('The calculated average score of the new resume version.'),
  suggestions: z.string().optional().describe('Suggestions for further improvement if no major changes are detected.'),
});
export type TrackResumeEvolutionOutput = z.infer<typeof TrackResumeEvolutionOutputSchema>;

export async function trackResumeEvolution(input: TrackResumeEvolutionInput): Promise<TrackResumeEvolutionOutput> {
  return await resumeEvolutionTrackerFlow(input);
}

const prompt = ai.definePrompt({
  name: 'resumeEvolutionTrackerPrompt',
  model: 'googleai/gemini-2.0-flash',
  input: { schema: TrackResumeEvolutionInputSchema },
  output: { schema: TrackResumeEvolutionOutputSchema },
  prompt: `You are an AI Resume Evolution Tracker. Your task is to compare the latest resume of a consultant with their previous version's skill analysis.

You will be given the previous skill analysis (list of skills with ratings) and the new resume document.

Your tasks are to:
1.  First, analyze the new resume to extract its key technical skills and assign a proficiency rating from 1 to 10 for each, along with your reasoning. This is a fresh analysis of the new document.
2.  Compare the results of your new analysis with the provided "previousSkillAnalysis".
3.  Generate a 'skillChanges' table identifying skills that were added, removed, or had their proficiency rating change.
4.  Calculate the average score for both the old and new skill sets to determine the 'oldOverallScore' and 'newOverallScore'.
5.  Write a 'summaryOfImprovements' in a single paragraph, highlighting the most significant positive changes (e.g., new high-rated skills, significant score improvements).
6.  If the overall score difference is minimal (less than 0.5 points) and there are few changes, provide constructive 'suggestions' on how the consultant could better showcase their growth in the next update.

NEW RESUME:
{{media url=newResumeDataUri}}

PREVIOUS SKILL ANALYSIS:
{{#each previousSkillAnalysis}}
- {{skill}}: {{rating}}/10 ({{reasoning}})
{{/each}}

Provide the output in the structured JSON format defined by the output schema.
`,
});

const resumeEvolutionTrackerFlow = ai.defineFlow(
  {
    name: 'resumeEvolutionTrackerFlow',
    inputSchema: TrackResumeEvolutionInputSchema,
    outputSchema: TrackResumeEvolutionOutputSchema,
  },
  async (input) => {
    // If there is no previous skill analysis, we can't do a comparison.
    // This case should be handled by the calling component, but we add a safeguard.
    if (!input.previousSkillAnalysis || input.previousSkillAnalysis.length === 0) {
        throw new Error("Cannot track evolution without a previous skill analysis.");
    }

    const { output } = await prompt(input);
    return output!;
  }
);
