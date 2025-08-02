
'use server';

/**
 * @fileOverview A helpful assistant chatbot for the Pool Consultant Management System.
 *
 * - consultantChatbotFlow - A function that handles the conversation with the consultant.
 * - GetConsultantDetailsInput - The input type for the getConsultantDetailsTool.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { getConsultantById } from '@/lib/data';
import type { Consultant } from '@/lib/types';


const GetConsultantDetailsInputSchema = z.object({
    consultantId: z.string().describe("The ID of the consultant to fetch details for."),
});
export type GetConsultantDetailsInput = z.infer<typeof GetConsultantDetailsInputSchema>;

const getConsultantDetailsTool = ai.defineTool(
    {
        name: 'getConsultantDetails',
        description: 'Fetches all details for a given consultant from the database, including their skills, attendance, and project status.',
        inputSchema: GetConsultantDetailsInputSchema,
        outputSchema: z.any(), // Use z.any() as a workaround for complex object schemas in tools
    },
    async ({ consultantId }) => {
        console.log(`Fetching details for consultant: ${consultantId}`);
        const consultant = await getConsultantById(consultantId);
        if (!consultant) {
            throw new Error('Consultant not found');
        }
        // Return a serializable subset of the consultant data.
        return {
            name: consultant.name,
            status: consultant.status,
            skills: consultant.skills,
            presentDays: consultant.presentDays,
            totalWorkingDays: consultant.totalWorkingDays,
            attendance: consultant.attendance,
        };
    }
);


const prompt = ai.definePrompt({
    name: 'consultantChatbotPrompt',
    tools: [getConsultantDetailsTool],
    system: `You are a helpful and friendly AI assistant for the "ConsultantFlow" application. Your role is to assist consultants by answering their questions about their personal status, skills, and progress.

When a consultant asks a question that requires their personal data (e.g., "What skills am I lacking?", "How is my attendance?", "What is my project status?"), you MUST use the \`getConsultantDetails\` tool to fetch their information from the database. The consultant's ID will be provided in a hidden message.

Based on the data you retrieve, provide a clear, concise, and helpful answer.

If asked about lacking skills, analyze their skill ratings and identify areas with lower scores.
If asked about attendance, summarize their record and mention their present days versus total days.

Always maintain a supportive and professional tone.
`,
});

export const consultantChatbotFlow = ai.defineFlow(
    {
        name: 'consultantChatbotFlow',
        inputSchema: z.object({
            history: z.array(z.any()),
            consultantId: z.string(),
        }),
        outputSchema: z.string(),
    },
    async ({ history, consultantId }) => {

        // Add a hidden user message with the consultant ID so the model knows which user to talk about.
        const augmentedHistory = [
            ...history,
            {
                role: 'user',
                content: [{ text: `(My consultant ID is ${consultantId})` }],
            },
        ];
        
        const result = await prompt({history: augmentedHistory});
        
        const toolRequest = result.toolRequests[0];
        
        if (!toolRequest) {
            return result.text;
        }

        // Execute the tool call requested by the model.
        const toolResponse = await result.runTool(toolRequest);
        
        const finalHistory = [
            ...augmentedHistory,
            result.message, // Include the model's message that contains the tool request
            {
                role: 'tool',
                content: [ { toolResponse: { name: toolRequest.name, output: toolResponse } } ],
            }
        ];

        // After executing the tool, continue the conversation with the tool's output.
        const finalResult = await prompt({history: finalHistory});
        return finalResult.text;
    }
);
