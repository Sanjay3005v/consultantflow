'use server';

/**
 * @fileOverview Skill vector generation from resume data.
 *
 * - generateSkillVectors - A function that generates skill vectors from a resume.
 * - GenerateSkillVectorsInput - The input type for the generateSkillVectors function.
 * - GenerateSkillVectorsOutput - The return type for the generateSkillVectors function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateSkillVectorsInputSchema = z.object({
  resumeDataUri: z
    .string()
    .describe(
      "The consultant's resume as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type GenerateSkillVectorsInput = z.infer<typeof GenerateSkillVectorsInputSchema>;

const GenerateSkillVectorsOutputSchema = z.object({
  skillVectors: z.array(z.string()).describe('An array of skills extracted from the resume.'),
  historyLog: z.string().describe('A summary of the skills extracted and the analysis process.'),
});
export type GenerateSkillVectorsOutput = z.infer<typeof GenerateSkillVectorsOutputSchema>;

export async function generateSkillVectors(input: GenerateSkillVectorsInput): Promise<GenerateSkillVectorsOutput> {
  return generateSkillVectorsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'skillVectorPrompt',
  input: {schema: GenerateSkillVectorsInputSchema},
  output: {schema: GenerateSkillVectorsOutputSchema},
  prompt: `You are an expert in resume analysis and skill extraction.

You will analyze the provided resume and extract the key skills of the consultant.  The skills should be technology focused if possible.

Resume:
{{media url=resumeDataUri}}

Based on the resume, extract skills and generate a history log.

Output the skills as an array of strings and a summary of the analysis process as the history log.
`,
});

const generateSkillVectorsFlow = ai.defineFlow(
  {
    name: 'generateSkillVectorsFlow',
    inputSchema: GenerateSkillVectorsInputSchema,
    outputSchema: GenerateSkillVectorsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
