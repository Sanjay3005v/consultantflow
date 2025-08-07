
'use server';

/**
 * @fileOverview An AI agent for verifying training certificates.
 *
 * - analyzeCertificate - A function that analyzes a certificate and extracts skills.
 * - AnalyzeCertificateInput - The input type for the analyzeCertificate function.
 * - AnalyzeCertificateOutput - The return type for the analyzeCertificate function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeCertificateInputSchema = z.object({
  certificateDataUri: z
    .string()
    .describe(
      "The consultant's certificate as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type AnalyzeCertificateInput = z.infer<typeof AnalyzeCertificateInputSchema>;

const AnalyzeCertificateOutputSchema = z.object({
  skillAnalysis: z.object({
        skill: z.string().describe('The name of the primary skill or technology learned. If the skill cannot be determined, return "Unknown".'),
        rating: z
          .number()
          .describe(
            "A rating from 1 to 10 on the consultant's proficiency in this new skill, based on the certificate. Assume a completed course warrants a foundational rating (e.g., 5), unless the certificate specifies an advanced level."
          ),
        reasoning: z.string().describe('A brief explanation for the assigned rating, referencing the certificate.'),
      })
    .describe('The skill extracted from the certificate.'),
  report: z
    .string()
    .describe(
      'A detailed summary report of the training verification, including course name, provider, date if available, a suggestion for next steps, and feedback on where to practice.'
    ),
});
export type AnalyzeCertificateOutput = z.infer<typeof AnalyzeCertificateOutputSchema>;


export async function analyzeCertificate(input: AnalyzeCertificateInput): Promise<AnalyzeCertificateOutput> {
  return analyzeCertificateFlow(input);
}

const prompt = ai.definePrompt({
  name: 'trainingAgentPrompt',
  input: {schema: AnalyzeCertificateInputSchema},
  output: {schema: AnalyzeCertificateOutputSchema},
  prompt: `You are a Training Verification Agent and a career coach.

Your task is to analyze the provided training certificate image and perform the following actions:
1. Identify the primary skill or technology the consultant was trained in.
2. If you cannot determine the skill from the image, you MUST return "Unknown" in the 'skill' field. Do not describe the failure in the skill field.
3. Assign a proficiency rating from 1-10. A standard course completion should be rated around 5. If the certificate indicates an "advanced" or "expert" level, you can assign a higher rating.
4. Provide a brief reasoning for the rating, mentioning the course name from the certificate.
5. Generate a detailed report that acts as "Training Feedback". The report must include:
    - The name of the course/program.
    - The name of the issuing body/provider.
    - The completion date (if visible).
    - A congratulatory message.
    - A suggestion for how the consultant can apply this new skill in future projects.
    - Specific recommendations for where to practice this new skill (e.g., "To sharpen your new Java skills, try solving problems on HackerRank or LeetCode," or "To get hands-on with AWS, use the AWS Free Tier to build a small project.").
    - Suggestions for what to learn next to build on this skill.

Certificate Image:
{{media url=certificateDataUri}}

Provide the output in the structured JSON format defined by the output schema.
Example Report:
"Verification Complete! Congratulations on finishing the 'AWS Certified Solutions Architect - Associate' course from Amazon Web Services on 2023-05-15. This is a valuable certification that significantly enhances your cloud computing skills. To get hands-on practice, we recommend using the AWS Free Tier to build a small serverless application. For your next step, consider aiming for the AWS Certified DevOps Engineer certification to further specialize your skills. We encourage you to apply this knowledge in upcoming cloud infrastructure projects."
`,
});

const analyzeCertificateFlow = ai.defineFlow(
  {
    name: 'analyzeCertificateFlow',
    inputSchema: AnalyzeCertificateInputSchema,
    outputSchema: AnalyzeCertificateOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);



