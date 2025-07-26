
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
  input: {schema: AttendanceMonitorInputSchema},
  output: {schema: AttendanceMonitorOutputSchema},
  prompt: `You are an Attendance Monitoring AI Agent for a consulting company. Your job is to:
1. Read the attendance log for a consultant for the current month.
2. Calculate the attendance percentage.
3. Check whether the consultant has met the minimum attendance threshold (75%).
4. If attendance is below 75%, provide a polite, motivational message asking them to improve.
5. Mention the number of paid leaves remaining.
6. Suggest how many consecutive sessions they need to attend to cross 75%, if applicable.
7. Keep your tone professional and encouraging.

Return the feedback message in the 'feedbackMessage' field of the output JSON.

EXAMPLES:

INPUT:
Consultant Name: Sanjay
Month: July
Total Working Days: 20
Present Days: 13
Paid Leaves Taken: 2
Remaining Paid Leaves: 1

OUTPUT:
{ "feedbackMessage": "Hi Sanjay, your attendance for July is currently 65%. We encourage you to maintain at least 75% attendance. You still have 1 paid leave remaining. Attending the next 4 working days without absence can help you reach your attendance goal. Keep going!" }

---

INPUT:
Consultant Name: Riya
Month: July
Total Working Days: 20
Present Days: 16
Paid Leaves Taken: 1
Remaining Paid Leaves: 2

OUTPUT:
{ "feedbackMessage": "Hi Riya, great work! Your attendance for July is at 80%, which meets our company’s attendance standards. You also have 2 paid leaves remaining. Keep up the consistency!" }

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
