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
        skill: z.string().describe('The name of the primary skill or technology learned.'),
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
      'A summary report of the training verification, including course name, provider, and date if available.'
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
  prompt: `You are a Training Verification Agent.

Your task is to analyze the provided training certificate image and perform the following actions:
1. Identify the primary skill or technology the consultant was trained in.
2. Assign a proficiency rating from 1-10. A standard course completion should be rated around 5. If the certificate indicates an "advanced" or "expert" level, you can assign a higher rating.
3. Provide a brief reasoning for the rating, mentioning the course name from the certificate.
4. Generate a concise report summarizing the training. Include the course name, the issuing body, and the completion date if visible on the certificate.

Certificate Image:
{{media url=certificateDataUri}}

Provide the output in the structured JSON format defined by the output schema.`,
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
