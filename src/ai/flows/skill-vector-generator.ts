
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
  skillAnalysis: z
    .array(
      z.object({
        skill: z.string().describe('The name of the skill.'),
        rating: z
          .number()
          .describe(
            "A rating from 1 to 10 on the consultant's proficiency in this skill, based on the resume."
          ),
        reasoning: z.string().describe('A brief explanation for the assigned rating.'),
      })
    )
    .describe('An array of skills extracted from the resume with proficiency ratings.'),
  feedback: z
    .string()
    .describe(
      'Actionable feedback for the consultant, highlighting areas for improvement and suggesting training.'
    ),
  historyLog: z.string().describe('A summary of the skills extracted and the analysis process.'),
});
export type GenerateSkillVectorsOutput = z.infer<typeof GenerateSkillVectorsOutputSchema>;


export async function generateSkillVectors(input: GenerateSkillVectorsInput): Promise<GenerateSkillVectorsOutput> {
  return generateSkillVectorsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'skillVectorPrompt',
  model: 'googleai/gemini-2.0-flash',
  input: {schema: GenerateSkillVectorsInputSchema},
  output: {schema: GenerateSkillVectorsOutputSchema},
  prompt: `You are an expert in resume analysis, skill extraction, and talent development.

You will analyze the provided resume and perform the following tasks:
1. Extract the key technology-focused skills.
2. For each skill, provide a proficiency rating on a scale of 1 to 10. The rating should be based on the depth and recency of experience mentioned in the resume. For example, a skill mentioned in multiple recent projects with detailed descriptions should get a higher rating than a skill listed in a "skills" section without context.
3. Provide a brief reasoning for each rating.
4. Generate actionable feedback for the consultant. This feedback should identify the weakest areas and suggest specific training or projects to improve those skills. This feedback will be passed to a training agent.
5. Create a concise history log summarizing the analysis process.

Resume:
{{media url=resumeDataUri}}

Provide the output in the structured format defined by the output schema.`,
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
