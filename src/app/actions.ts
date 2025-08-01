
'use server';

import {
  generateSkillVectors,
  type GenerateSkillVectorsInput,
  type GenerateSkillVectorsOutput,
} from '@/ai/flows/skill-vector-generator';
import {
    attendanceMonitor,
    type AttendanceMonitorInput,
    type AttendanceMonitorOutput,
} from '@/ai/flows/attendance-agent';
import {
  analyzeCertificate as analyzeCertificateFlow,
  type AnalyzeCertificateInput,
  type AnalyzeCertificateOutput,
} from '@/ai/flows/training-agent';
import {
  opportunityEngager,
  type OpportunityEngagerInput,
  type OpportunityEngagerOutput,
} from '@/ai/flows/opportunity-agent';
import { candidateCollectorFlow } from '@/ai/flows/chatbot-flow';
import { consultantChatbotFlow } from '@/ai/flows/consultant-chatbot-flow';
import { 
    updateConsultantSkillsInDb, 
    createConsultant, 
    findConsultantByEmail, 
    addSkillToConsultantInDb, 
    getAllConsultants as getAllConsultantsFromDb, 
    updateConsultantAttendanceInDb, 
    updateConsultantOpportunitiesInDb,
    updateConsultantTotalDaysInDb,
} from '@/lib/data';
import type { Consultant, SkillAnalysis } from '@/lib/types';


export type AnalyzeResumeResult = {
    consultant: Consultant;
    feedback: string;
    historyLog: string;
}

export async function analyzeResume(
  consultantId: string,
  input: GenerateSkillVectorsInput
): Promise<AnalyzeResumeResult> {
  try {
    const result: GenerateSkillVectorsOutput = await generateSkillVectors(input);
    
    const updatedConsultant = await updateConsultantSkillsInDb(consultantId, result.skillAnalysis);
    
    if (!updatedConsultant) {
        throw new Error('Failed to find and update consultant.');
    }

    return {
        consultant: updatedConsultant,
        feedback: result.feedback,
        historyLog: result.historyLog,
    };

  } catch (error) {
    console.error('Error in analyzeResume server action:', error);
    throw new Error('Failed to analyze resume.');
  }
}

export type AnalyzeCertificateResult = {
    consultant: Consultant;
    report: string;
}

export async function analyzeCertificate(
    consultantId: string,
    input: AnalyzeCertificateInput
): Promise<AnalyzeCertificateResult> {
    try {
        const result: AnalyzeCertificateOutput = await analyzeCertificateFlow(input);
        const updatedConsultant = await addSkillToConsultantInDb(consultantId, result.skillAnalysis);

        if(!updatedConsultant) {
            throw new Error('Failed to find and update consultant with new skill.');
        }

        return {
            consultant: updatedConsultant,
            report: result.report,
        }
    } catch (error) {
        console.error('Error in analyzeCertificate server action:', error);
        throw new Error('Failed to analyze certificate.');
    }
}

export async function createNewConsultant(data: { name: string; email: string; password: string; department: 'Technology' | 'Healthcare' | 'Finance' | 'Retail'; }): Promise<Consultant> {
    const existingConsultant = await findConsultantByEmail(data.email);
    if (existingConsultant) {
        throw new Error('A consultant with this email already exists.');
    }
    
    const newConsultant = await createConsultant(data);
    return newConsultant;
}

export async function verifyConsultantCredentials(credentials: Pick<Consultant, 'email' | 'password'>): Promise<{ consultantId: string } | { error: string }> {
    const consultant = await findConsultantByEmail(credentials.email);
    if (consultant && consultant.password === credentials.password) {
        return { consultantId: consultant.id };
    }
    return { error: 'Invalid credentials' };
}

export async function verifyAdminCredentials(credentials: Pick<Consultant, 'email' | 'password'>): Promise<{ success: boolean } | { error: string }> {
    if (credentials.email.endsWith('@hexaware.com') && credentials.password === 'admin123') {
        return { success: true };
    }
    return { error: 'Invalid admin credentials' };
}


export async function getAttendanceFeedback(input: AttendanceMonitorInput): Promise<AttendanceMonitorOutput> {
    try {
        const result = await attendanceMonitor(input);
        return result;
    } catch (error) {
        console.error('Error getting attendance feedback:', error);
        throw new Error('Failed to get AI-powered attendance feedback.');
    }
}

export async function getOpportunityFeedback(input: OpportunityEngagerInput): Promise<OpportunityEngagerOutput> {
    try {
        const result = await opportunityEngager(input);
        return result;
    } catch (error) {
        console.error('Error getting opportunity feedback:', error);
        throw new Error('Failed to get AI-powered opportunity feedback.');
    }
}

export async function getFreshConsultants(): Promise<Consultant[]> {
    return getAllConsultantsFromDb();
}

export async function markAttendance(consultantId: string, date: string, status: 'Present' | 'Absent'): Promise<Consultant | undefined> {
    return updateConsultantAttendanceInDb(consultantId, date, status);
}

export async function updateSelectedOpportunities(consultantId: string, opportunityIds: string[]): Promise<Consultant | undefined> {
    try {
        return await updateConsultantOpportunitiesInDb(consultantId, opportunityIds);
    } catch (error) {
        console.error('Error updating selected opportunities:', error);
        throw new Error('Failed to update selected opportunities in the database.');
    }
}

export async function callChatbot(message: string, history: any[]): Promise<string> {
  const filePart = history.find(m => m.content.some((p: any) => p.media))?.content.find((p: any) => p.media)?.media;

  const content: any[] = [{text: message}];

  if(filePart?.url) {
      content.push({media: {url: filePart.url, contentType: filePart.contentType}});
  }

  const updatedHistory = [
      ...history.filter(m => !m.content.some((p: any) => p.media)),
      { role: 'user', content },
  ];
  
  try {
    const response = await candidateCollectorFlow({ history: updatedHistory });
    return response;
  } catch (error) {
    console.error("Error in chatbot flow action:", error);
    throw new Error("Failed to get response from chatbot.");
  }
}

export async function callConsultantChatbot(consultantId: string, history: any[]): Promise<string> {
    try {
        const response = await consultantChatbotFlow({
            history,
            consultantId,
        });
        return response;
    } catch (error) {
        console.error('Error in consultant chatbot flow action:', error);
        throw new Error('Failed to get response from chatbot.');
    }
}

export async function updateTotalWorkingDays(consultantId: string, totalDays: number): Promise<Consultant | undefined> {
    try {
        return await updateConsultantTotalDaysInDb(consultantId, totalDays);
    } catch (error) {
        console.error('Error updating total working days:', error);
        throw new Error('Failed to update total working days in the database.');
    }
}
