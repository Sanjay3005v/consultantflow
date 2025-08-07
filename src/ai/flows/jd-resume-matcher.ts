
'use server';

/**
 * @fileOverview A JD-to-Resume matching AI agent.
 *
 * - findMatchingConsultants - A function that identifies the best-matching consultants for a job description.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

// Define schemas locally, do not export them.
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
  efficiencyScore: z.number().describe("A score from 0-100 representing the consultant's overall performance (skills, attendance, etc.)."),
});

const JdMatcherInputSchema = z.object({
  jobDescription: z.string().describe('The full text of the job description.'),
  consultants: z
    .array(ConsultantProfileSchema)
    .describe('A list of available consultants with their skills and status.'),
  consultantsString: z.string().optional().describe('A JSON string representation of the consultants list. This is for the prompt template.'),
});
type JdMatcherInput = z.infer<typeof JdMatcherInputSchema>;

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
    .describe('A brief, two-line explanation for the score, based on skill match, efficiency, and experience level.'),
});

const JdMatcherOutputSchema = z.object({
  topMatches: z
    .array(MatchedConsultantSchema)
    .describe('A list of the top 3 consultants who match the job description with a score of 60% or higher.'),
});
type JdMatcherOutput = z.infer<typeof JdMatcherOutputSchema>;


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
2.  **Evaluate Each Consultant**: For each consultant in the provided JSON string, compare their profile against the job requirements. Pay close attention to their 'status', 'skills', and their overall 'efficiencyScore'. Consultants 'On Bench' are preferred candidates.
3.  **Score the Match**: Assign a 'matchScore' from 0 to 100 for each consultant. The score should be a weighted average based on:
    *   **Skill Alignment (60% weight)**: How many of the required skills does the consultant possess and how high are their ratings?
    *   **Efficiency Score (30% weight)**: How does their overall efficiency score reflect their reliability and performance?
    *   **Status (10% weight)**: Give a higher weight to consultants who are 'On Bench' as they are immediately available.
4.  **Write the Explanation**: For each match, provide a concise, two-line 'explanation' justifying the score. The first line should cover the skill match, and the second should comment on their efficiency and experience level.
5.  **Filter and Rank**: Return a ranked list of the top 3 consultants.
    
IMPORTANT: You MUST ONLY return consultants with a 'matchScore' of 60 or higher. If no consultants meet this threshold, return an empty list.

**Job Description:**
\`\`\`
{{{jobDescription}}}
\`\`\`

**Consultant Profiles (JSON String):**
\`\`\`
{{{consultantsString}}}
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
    // Manually stringify the consultants array.
    const consultantsString = JSON.stringify(input.consultants, null, 2);

    const { output } = await prompt({
        jobDescription: input.jobDescription,
        consultants: input.consultants, // Pass it through for schema validation
        consultantsString: consultantsString, // Pass the string for the prompt
    });
    return output!;
  }
);
