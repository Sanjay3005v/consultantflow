
'use server';

/**
 * @fileOverview A JD-to-Resume matching engine.
 *
 * - matchResumesToJobDescription - A function that identifies the top 3 consultants for a job description.
 * - MatchResumesInput - The input type for the matchResumesToJobDescription function.
 * - MatchResumesOutput - The return type for the matchResumesToJobDescription function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const ConsultantProfileSchema = z.object({
  id: z.string().describe('The unique identifier for the consultant.'),
  name: z.string().describe('The name of the consultant.'),
  experienceInYears: z.number().describe('The total years of professional experience for the consultant.'),
  skills: z
    .array(
      z.object({
        skill: z.string(),
        rating: z.number(),
      })
    )
    .describe("The consultant's skills with proficiency ratings (1-10)."),
});

const MatchResumesInputSchema = z.object({
  jobDescription: z.string().describe('The full text of the job description.'),
  consultants: z.array(ConsultantProfileSchema).describe('A list of available consultant profiles.'),
});

export type MatchResumesInput = z.infer<typeof MatchResumesInputSchema>;

const MatchedConsultantSchema = z.object({
  consultantId: z.string().describe('The ID of the matched consultant.'),
  consultantName: z.string().describe('The name of the matched consultant.'),
  matchScore: z.number().min(0).max(100).describe('A score from 0 to 100 indicating the match quality.'),
  justification: z.string().describe('A two-line explanation for the score, based on skill match and experience.'),
});

const MatchResumesOutputSchema = z.object({
  topCandidates: z
    .array(MatchedConsultantSchema)
    .describe('The top 3 consultants that best match the job description.'),
});

export type MatchResumesOutput = z.infer<typeof MatchResumesOutputSchema>;

export async function matchResumesToJobDescription(input: MatchResumesInput): Promise<MatchResumesOutput> {
  return await jdResumeMatcherFlow(input);
}

const prompt = ai.definePrompt({
  name: 'jdResumeMatcherPrompt',
  input: { schema: MatchResumesInputSchema },
  output: { schema: MatchResumesOutputSchema },
  prompt: `You are an expert JD-to-resume matching engine for a technology consulting firm. Your task is to analyze a job description and a list of consultant profiles to find the top 3 best-fit candidates.

For each consultant, you must:
1.  Carefully compare their skills and proficiency ratings against the requirements listed in the job description.
2.  Consider their years of experience in relation to what the job requires.
3.  Calculate a "matchScore" from 0 to 100, where 100 is a perfect match. The score should be a weighted average of skill alignment, skill proficiency, and experience level.
4.  Provide a concise, two-line "justification" for the score. The first line should summarize the skill match, and the second line should comment on their experience alignment.

Return only the top 3 candidates, ordered from highest to lowest score.

JOB DESCRIPTION:
---
{{jobDescription}}
---

CONSULTANT PROFILES:
---
{{#each consultants}}
- Consultant ID: {{id}}
- Name: {{name}}
- Experience: {{experienceInYears}} years
- Skills:
  {{#each skills}}
  - {{skill}} (Rating: {{rating}}/10)
  {{/each}}
---
{{/each}}

Analyze the information and provide the top 3 matches in the specified JSON format.
`,
});

const jdResumeMatcherFlow = ai.defineFlow(
  {
    name: 'jdResumeMatcherFlow',
    inputSchema: MatchResumesInputSchema,
    outputSchema: MatchResumesOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
