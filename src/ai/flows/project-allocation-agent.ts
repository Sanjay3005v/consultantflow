
'use server';

/**
 * @fileOverview An AI agent for allocating projects to consultants based on their skills.
 *
 * - projectAllocationAgent - A function that generates and rates project opportunities.
 * - ProjectAllocationInput - The input type for the projectAllocationAgent function.
 * - ProjectAllocationOutput - The return type for the projectAllocationAgent function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import type { SkillAnalysis } from '@/lib/types';

const ProjectAllocationInputSchema = z.object({
  consultantName: z.string().describe('The name of the consultant.'),
  consultantSkills: z
    .array(
      z.object({
        skill: z.string(),
        rating: z.number(),
        reasoning: z.string(),
      })
    )
    .describe("The consultant's skills with proficiency ratings."),
});
export type ProjectAllocationInput = z.infer<typeof ProjectAllocationInputSchema>;

const AllocatedProjectSchema = z.object({
    projectName: z.string().describe('A creative and descriptive name for the project.'),
    domain: z.string().describe('The domain of the project (e.g., "Web Development", "QA/Testing", "Data Science", "Cloud Engineering").'),
    requiredSkills: z.array(z.string()).describe('A list of key skills required for this project.'),
    fitRating: z.number().min(1).max(10).describe('A rating from 1 to 10 of how good a fit the consultant is for this project.'),
    justification: z.string().describe('A brief justification for the fit rating, explaining why the consultant is a good or weak match.'),
});

const ProjectAllocationOutputSchema = z.object({
  allocatedProjects: z
    .array(AllocatedProjectSchema)
    .describe('A list of dummy project opportunities generated for the consultant.'),
  feedbackSummary: z
    .string()
    .describe('A concise, personalized, and detailed feedback summary for the consultant about the allocated projects.'),
});
export type ProjectAllocationOutput = z.infer<typeof ProjectAllocationOutputSchema>;


export async function projectAllocationAgent(input: ProjectAllocationInput): Promise<ProjectAllocationOutput> {
  return await projectAllocationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'projectAllocationPrompt',
  input: { schema: ProjectAllocationInputSchema },
  output: { schema: ProjectAllocationOutputSchema },
  prompt: `You are a Project Allocation AI Agent for a tech consulting firm. Your goal is to find suitable projects for consultants who are on the bench.

You will be given the consultant's name and their list of skills with proficiency ratings.

Your tasks:
1.  **Generate a list of 3-5 diverse, realistic (but dummy) project opportunities.** These projects should come from different domains like "Web Development", "QA/Testing", "Data Science", "Cloud Engineering", etc.
2.  **For each project, define the key skills required.**
3.  **Analyze the consultant's skills against the project's requirements.**
4.  **Assign a "Fit Rating" from 1 (poor fit) to 10 (perfect fit).** Base this rating on the overlap of skills and the consultant's proficiency in those skills.
5.  **Write a brief "Justification"** for each rating, explaining your reasoning in detail.
6.  **Provide a "Feedback Summary"** for the consultant. This should be a friendly, encouraging, and detailed message. It must highlight the best-fit project, explain why it's a great match, and give a quick, positive overview of the other options available. Make it sound like a helpful career advisor.

Example of a consultant's skills input:
- Consultant Name: Priya Sharma
- Skills:
  - Java: 8/10
  - Spring Boot: 7/10
  - React: 6/10
  - SQL: 7/10

Example of your output:
{
  "allocatedProjects": [
    {
      "projectName": "E-commerce Platform Revamp",
      "domain": "Web Development",
      "requiredSkills": ["Java", "Spring Boot", "React", "Microservices"],
      "fitRating": 8,
      "justification": "Priya is a strong fit. Her high proficiency in Java and Spring Boot aligns perfectly with the backend needs. Her React skills are a great asset for frontend collaboration."
    },
    {
      "projectName": "Automated Testing Framework for Banking App",
      "domain": "QA/Testing",
      "requiredSkills": ["Java", "Selenium", "CI/CD"],
      "fitRating": 6,
      "justification": "Priya's strong Java skills are valuable for test script creation. However, the project requires Selenium and CI/CD experience, which is not listed in her skills."
    }
  ],
  "feedbackSummary": "Hi Priya, I've analyzed your skill profile and found some exciting opportunities for you. The 'E-commerce Platform Revamp' stands out as an excellent match, with a fit rating of 8/10! Your strong Java and Spring Boot skills make you a prime candidate for their backend development. I've also found a QA role where your Java expertise would be highly valuable. Take a look at the details for each project. I'm confident we can find the perfect fit to advance your career!"
}
---

Now, generate the project allocations for the following consultant.

INPUT:
- Consultant Name: {{consultantName}}
- Consultant Skills:
{{#each consultantSkills}}
  - {{skill}}: {{rating}}/10 ({{reasoning}})
{{/each}}

OUTPUT:
`,
});

const projectAllocationFlow = ai.defineFlow(
  {
    name: 'projectAllocationFlow',
    inputSchema: ProjectAllocationInputSchema,
    outputSchema: ProjectAllocationOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);

