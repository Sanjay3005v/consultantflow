
'use server';

/**
 * @fileOverview A chatbot flow to collect candidate details.
 *
 * - candidateCollectorFlow - A function that handles the conversation and data collection.
 * - CandidateDetails - The type for the candidate's information.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { saveCandidate } from '@/lib/data';

const CandidateDetailsSchema = z.object({
    name: z.string().describe('The full name of the candidate.'),
    experience: z.number().describe('The years of professional experience the candidate has.'),
    role: z.string().describe('The role the candidate is applying for.'),
    resume: z.string().describe("The candidate's resume content, provided as a data URI.").refine(
        (s) => s.startsWith('data:') && s.includes(';base64,'),
        "Resume must be a valid data URI with base64 encoding."
    ),
});
export type CandidateDetails = z.infer<typeof CandidateDetailsSchema>;

const saveCandidateDetailsTool = ai.defineTool(
    {
        name: 'saveCandidateDetails',
        description: 'Saves the collected candidate details to the database.',
        inputSchema: CandidateDetailsSchema,
        outputSchema: z.string(),
    },
    async (details) => {
        try {
            await saveCandidate(details);
            return 'Successfully saved the candidate details.';
        } catch (error) {
            console.error('Error saving candidate details:', error);
            return 'Failed to save the candidate details due to an internal error.';
        }
    }
);

const prompt = ai.definePrompt({
    name: 'candidateCollectorPrompt',
    tools: [saveCandidateDetailsTool],
    prompt: `You are an expert recruitment assistant. Your goal is to collect essential details from a candidate in a friendly, conversational manner.

Follow this sequence:
1. Greet the user and ask for their full name.
2. Once you have the name, ask for their total years of professional experience.
3. After getting their experience, ask what role they are applying for.
4. Finally, ask them to upload their resume (as a file).
5. Once all details (name, experience, role, and resume) are collected, you MUST call the \`saveCandidateDetails\` tool to save the information.
6. After calling the tool, confirm to the user that their information has been received and thank them.

- Do not ask for all the details at once. Ask for them one by one.
- Be polite and maintain a professional tone throughout the conversation.
- If the user provides a file, you will receive it as a data URI. Pass this directly to the \`resume\` field in the tool.
- The conversation history is provided. Your response should be the next logical step in the conversation.
`,
});

export const candidateCollectorFlow = ai.defineFlow(
    {
        name: 'candidateCollectorFlow',
        inputSchema: z.object({
            history: z.array(z.any()),
        }),
        outputSchema: z.string(),
    },
    async ({ history }) => {
        const result = await prompt(history);
        const output = result.output();

        if (!output) {
            return "I'm sorry, I couldn't process that. Could you try again?";
        }
        
        if (output.toolRequests.length > 0) {
            const toolRequest = output.toolRequests[0];
            await result.runTool(toolRequest);
            
            // After saving, provide a concluding message
            return "Thank you for providing your details. We have received your application and will be in touch shortly.";
        }
        
        return output.text;
    }
);
