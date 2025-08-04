
'use server';

/**
 * @fileOverview An AI agent for monitoring consultant attendance.
 *
 * - attendanceMonitor - A function that generates feedback based on attendance.
 * - AttendanceMonitorInput - The input type for the attendanceMonitor function.
 * - AttendanceMonitorOutput - The return type for the attendanceMonitor function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AttendanceMonitorInputSchema = z.object({
  consultantName: z.string().describe('The name of the consultant.'),
  month: z.string().describe('The current month.'),
  totalDays: z.number().describe('The total number of working days in the month so far.'),
  presentDays: z.number().describe('The number of days the consultant was present.'),
  paidLeavesTaken: z.number().describe('The number of paid leaves taken by the consultant.'),
  paidLeavesRemaining: z.number().describe('The number of paid leaves the consultant has left.'),
});
export type AttendanceMonitorInput = z.infer<typeof AttendanceMonitorInputSchema>;

const AttendanceMonitorOutputSchema = z.object({
    feedbackMessage: z.string().describe('The generated feedback message for the consultant.')
});
export type AttendanceMonitorOutput = z.infer<typeof AttendanceMonitorOutputSchema>;


export async function attendanceMonitor(input: AttendanceMonitorInput): Promise<AttendanceMonitorOutput> {
  return await attendanceMonitorFlow(input);
}

const prompt = ai.definePrompt({
  name: 'attendanceMonitorPrompt',
  model: 'googleai/gemini-2.0-flash',
  input: {schema: AttendanceMonitorInputSchema},
  output: {schema: AttendanceMonitorOutputSchema},
  prompt: `You are an Attendance Monitoring AI Agent for a consulting company. Your job is to provide detailed, encouraging, and actionable feedback to consultants about their monthly attendance.

Your tasks:
1.  Analyze the attendance log for the given consultant and month.
2.  Calculate the attendance percentage (present days / total working days).
3.  Check if the consultant has met the company's minimum attendance threshold of 75%.
4.  Generate a comprehensive feedback message that includes:
    *   A friendly greeting.
    *   The current attendance percentage and a brief comment on it.
    *   An explanation of why maintaining 75% attendance is important (e.g., ensures readiness for project deployment, aligns with company standards).
    *   If attendance is below 75%, provide a polite, motivational message and calculate how many consecutive sessions they need to attend to cross the 75% threshold.
    *   Mention the number of paid leaves remaining and encourage them to use them wisely.
    *   Maintain a professional, supportive, and encouraging tone.

Return the detailed feedback message in the 'feedbackMessage' field of the output JSON.

EXAMPLES:

INPUT:
{
    "consultantName": "Sanjay",
    "month": "July",
    "totalDays": 20,
    "presentDays": 13,
    "paidLeavesTaken": 2,
    "paidLeavesRemaining": 1
}
OUTPUT:
{ "feedbackMessage": "Hi Sanjay, your attendance for July is currently at 65%. We encourage you to maintain at least 75% attendance to stay ready for upcoming project opportunities and meet our company’s standards for engagement. We notice you've taken 2 paid leaves. You still have 1 paid leave remaining for the year. To get back on track, attending the next 4 working days without an absence will bring your attendance above the 75% goal. We believe in you and are here to support you. Keep pushing forward!" }

---

INPUT:
{
    "consultantName": "Riya",
    "month": "July",
    "totalDays": 20,
    "presentDays": 16,
    "paidLeavesTaken": 1,
    "paidLeavesRemaining": 2
}
OUTPUT:
{ "feedbackMessage": "Hi Riya, fantastic work on your attendance for July! You're currently at 80%, which is a great achievement and keeps you well-aligned with our company's standards. This level of consistency is exactly what we look for and makes you a strong candidate for new projects. You also have 2 paid leaves remaining. Keep up the excellent work and consistency!" }

---

Now generate the message based on the following input.

INPUT:
- Consultant Name: {{consultantName}}
- Month: {{month}}
- Total Working Days: {{totalDays}}
- Present Days: {{presentDays}}
- Paid Leaves Taken: {{paidLeavesTaken}}
- Remaining Paid Leaves: {{paidLeavesRemaining}}

OUTPUT:
`,
});

const attendanceMonitorFlow = ai.defineFlow(
  {
    name: 'attendanceMonitorFlow',
    inputSchema: AttendanceMonitorInputSchema,
    outputSchema: AttendanceMonitorOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
