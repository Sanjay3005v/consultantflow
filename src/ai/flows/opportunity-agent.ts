
'use server';

/**
 * @fileOverview An AI agent for evaluating consultant engagement with opportunities.
 *
 * - opportunityEngager - A function that generates feedback on opportunity engagement.
 * - OpportunityEngagerInput - The input type for the opportunityEngager function.
 * - OpportunityEngagerOutput - The return type for the opportunityEngager function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const OpportunityEngagerInputSchema = z.object({
  consultantName: z.string().describe('The name of the consultant.'),
  month: z.string().describe('The current month.'),
  opportunitiesProvided: z.number().describe('The total number of opportunities provided to the consultant.'),
  acceptedCount: z.number().describe('The number of opportunities the consultant accepted.'),
  rejectedCount: z.number().describe('The number of opportunities the consultant rejected.'),
  noResponseCount: z.number().describe('The number of opportunities the consultant did not respond to.'),
  consultantSkills: z.array(z.string()).describe("A list of the consultant's skills."),
  opportunityStacks: z.array(z.string()).describe('A list of technologies that appeared in the recent opportunities.'),
});
export type OpportunityEngagerInput = z.infer<typeof OpportunityEngagerInputSchema>;

const OpportunityEngagerOutputSchema = z.object({
    engagementSummary: z.string().describe('The generated personalized engagement summary for the consultant.')
});
export type OpportunityEngagerOutput = z.infer<typeof OpportunityEngagerOutputSchema>;


export async function opportunityEngager(input: OpportunityEngagerInput): Promise<OpportunityEngagerOutput> {
  return await opportunityEngagerFlow(input);
}

const prompt = ai.definePrompt({
  name: 'opportunityEngagerPrompt',
  model: 'googleai/gemini-2.0-flash',
  input: {schema: OpportunityEngagerInputSchema},
  output: {schema: OpportunityEngagerOutputSchema},
  prompt: `You are an Opportunity Engagement AI Agent responsible for evaluating how well consultants are utilizing the opportunities provided to them during their bench period.

Your task:
1. Check how many opportunities were provided this month.
2. Determine if the consultant engaged with them (Accepted, Rejected, No Response).
3. Evaluate if the opportunities match the consultant’s skill set.
4. Give a short feedback message:
   - Encourage the consultant if engagement is low.
   - Appreciate them if engagement is good.
   - Suggest improving skill alignment if needed.

Return the feedback message in the 'engagementSummary' field of the output JSON.

EXAMPLES:

INPUT:
{
    "consultantName": "Rahul",
    "month": "July",
    "opportunitiesProvided": 4,
    "acceptedCount": 0,
    "rejectedCount": 3,
    "noResponseCount": 1,
    "consultantSkills": ["Java", "Spring Boot"],
    "opportunityStacks": ["Java", "AWS", "Spring Boot", "Microservices"]
}

OUTPUT:
{ "engagementSummary": "Hi Rahul, we observed that you've received 4 opportunities this month but haven't accepted any. Based on your skill set (Java, Spring Boot), several of these roles were a strong match. We encourage you to engage more actively to maximize your chances of deployment. If you’re facing any blockers, please reach out. Let’s work together to find the right fit." }

---

INPUT:
{
    "consultantName": "Aisha",
    "month": "July",
    "opportunitiesProvided": 5,
    "acceptedCount": 3,
    "rejectedCount": 1,
    "noResponseCount": 1,
    "consultantSkills": ["Python", "Django"],
    "opportunityStacks": ["Python", "Flask", "Django", "Azure"]
}
OUTPUT:
{ "engagementSummary": "Hi Aisha, great work engaging with your opportunities this month. With 3 out of 5 roles accepted and aligned with your skill set in Python and Django, you're on a strong track for allocation. Keep up the momentum!" }

---

Now generate the message based on the following input.

INPUT:
- Consultant Name: {{consultantName}}
- Month: {{month}}
- Opportunities Provided: {{opportunitiesProvided}}
- Accepted: {{acceptedCount}}
- Rejected: {{rejectedCount}}
- No Response: {{noResponseCount}}
- Consultant Skills: {{#each consultantSkills}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}
- Recent Opportunity Tech Stacks: {{#each opportunityStacks}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}

OUTPUT:
`,
});

const opportunityEngagerFlow = ai.defineFlow(
  {
    name: 'opportunityEngagerFlow',
    inputSchema: OpportunityEngagerInputSchema,
    outputSchema: OpportunityEngagerOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
