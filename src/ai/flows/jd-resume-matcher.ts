
'use server';

/**
 * @fileOverview A JD-to-Resume matching AI agent.
 *
 * - findMatchingConsultants - A function that identifies the best-matching consultants for a job description.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const ConsultantProfileSchema = z.object({
  id: z.string(),
  name: z.string(),
  status: z.string().describe("The consultant's current project status (e.g., 'On Bench', 'On Project')."),
  skills: z.array(
    z.object({
      skill: z.string(),
      rating: z.number().describe('Proficiency rating from 1 to 10.'),
    })
  ),
});

const JdMatcherInputSchema = z.object({
  jobDescription: z.string().describe('The full text of the job description.'),
  consultants: z
    .array(ConsultantProfileSchema)
    .describe('A list of available consultants with their skills and status.'),
});
export type JdMatcherInput = z.infer<typeof JdMatcherInputSchema>;

const MatchedConsultantSchema = z.object({
  consultantId: z.string().describe("The ID of the matched consultant."),
  consultantName: z.string().describe("The name of the matched consultant."),
  matchScore: z
    .number()
    .min(0)
    .max(100)
    .describe('A score from 0 to 100 indicating the match quality.'),
  explanation: z
    .string()
    .describe('A brief, two-line explanation for the score, based on skill match and experience level.'),
});

const JdMatcherOutputSchema = z.object({
  topMatches: z
    .array(MatchedConsultantSchema)
    .describe('A list of the top 3 consultants who match the job description with a score of 60% or higher.'),
});
export type JdMatcherOutput = z.infer<typeof JdMatcherOutputSchema>;


export async function findMatchingConsultants(input: JdMatcherInput): Promise<JdMatcherOutput> {
  return await jdMatcherFlow(input);
}

const prompt = ai.definePrompt({
  name: 'jdMatcherPrompt',
  input: { schema: JdMatcherInputSchema },
  output: { schema: JdMatcherOutputSchema },
  prompt: `You are an expert JD-to-Resume Matching Engine for a technology consulting firm. Your task is to analyze a job description and identify the top 3 best-fit consultants from a provided list.

Here's your process:
1.  **Analyze the Job Description**: Carefully read the job description to identify the key required skills, technologies, and desired experience level.
2.  **Evaluate Each Consultant**: For each consultant in the provided list, compare their skill set and proficiency ratings against the job requirements. Pay close attention to their 'status' - consultants 'On Bench' are preferred candidates.
3.  **Score the Match**: Assign a 'matchScore' from 0 to 100 for each consultant. The score should be based on:
    *   **Skill Alignment**: How many of the required skills does the consultant possess?
    *   **Proficiency Depth**: How high are their ratings in those key skills? A rating of 8-10 is senior, 5-7 is mid-level, and 1-4 is junior. Match this to the JD's seniority.
    *   **Status**: Give a higher weight to consultants who are 'On Bench' as they are immediately available.
4.  **Write the Explanation**: For each match, provide a concise, two-line 'explanation' justifying the score. The first line should cover the skill match, and the second should comment on their experience level and suitability.
5.  **Filter and Rank**: Return a list of the top 3 consultants who have a 'matchScore' of 60 or higher. If no consultants meet this threshold, return an empty list.

**Job Description:**
\`\`\`
{{{jobDescription}}}
\`\`\`

**Consultant Profiles:**
\`\`\`
{{#each consultants}}
- Name: {{name}} (ID: {{id}}, Status: {{status}})
  Skills:
  {{#each skills}}
  - {{skill}}: {{rating}}/10
  {{/each}}
{{/each}}
\`\`\`

Now, perform the analysis and provide the output in the specified JSON format.
`,
});

const jdMatcherFlow = ai.defineFlow(
  {
    name: 'jdMatcherFlow',
    inputSchema: JdMatcherInputSchema,
    outputSchema: JdMatcherOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
