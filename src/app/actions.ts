
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
import { chat } from '@/ai/flows/chatbot-flow';
import { consultantChatbotFlow } from '@/ai/flows/consultant-chatbot-flow';
import {
  projectAllocationAgent,
  type ProjectAllocationInput,
  type ProjectAllocationOutput,
} from '@/ai/flows/project-allocation-agent';
import {
    trackResumeEvolution as trackResumeEvolutionFlow,
    type TrackResumeEvolutionInput,
    type TrackResumeEvolutionOutput,
} from '@/ai/flows/resume-evolution-tracker';
import {
    findMatchingConsultants,
    type JdMatcherInput,
    type JdMatcherOutput,
} from '@/ai/flows/jd-resume-matcher';
import { 
    updateConsultantSkillsInDb, 
    createConsultant, 
    findConsultantByEmail, 
    addSkillToConsultantInDb, 
    updateConsultantAttendanceInDb, 
    updateConsultantOpportunitiesInDb,
    updateConsultantTotalDaysInDb,
    updateConsultantStatusInDb,
    updateConsultantOpportunities as updateConsultantOpportunitiesAction,
    createJobOpportunity,
} from '@/lib/data';
import type { Consultant, SkillAnalysis, JobOpportunity } from '@/lib/types';
import { ChatMessage } from '@/lib/chatbot-schema';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';


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

export type TrackResumeEvolutionResult = {
    consultant: Consultant;
    evolutionData: TrackResumeEvolutionOutput;
}

export async function trackResumeEvolution(
    consultantId: string,
    input: TrackResumeEvolutionInput
): Promise<TrackResumeEvolutionResult> {
    try {
        const result: TrackResumeEvolutionOutput = await trackResumeEvolutionFlow(input);
        
        // Update the database with the new skills from the analysis
        const updatedConsultant = await updateConsultantSkillsInDb(consultantId, result.newSkillAnalysis);

        if (!updatedConsultant) {
            throw new Error('Failed to find and update consultant after tracking evolution.');
        }

        return {
            consultant: updatedConsultant,
            evolutionData: result,
        };
    } catch (error) {
        console.error('Error in trackResumeEvolution server action:', error);
        throw new Error('Failed to track resume evolution.');
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

export async function verifyAdminCredentials(credentials: Pick<Consultant, 'email' | 'password'>) {
    if (credentials.email.endsWith('@hexaware.com') && credentials.password === 'admin123') {
        cookies().set('admin-session', 'true', { httpOnly: true, path: '/', maxAge: 60 * 60 * 24 }); // Expires in 1 day
        redirect('/admin');
    } else {
        throw new Error('Invalid admin credentials');
    }
}

export async function logoutAdmin() {
    cookies().delete('admin-session');
    redirect('/');
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

export async function getProjectAllocations(input: ProjectAllocationInput): Promise<ProjectAllocationOutput> {
    try {
        const result = await projectAllocationAgent(input);
        return result;
    } catch (error) {
        console.error('Error getting project allocations:', error);
        throw new Error('Failed to get AI-powered project allocations.');
    }
}

export async function matchResumes(input: JdMatcherInput): Promise<JdMatcherOutput> {
    try {
        const result = await findMatchingConsultants(input);
        return result;
    } catch (error) {
        console.error('Error matching resumes:', error);
        throw new Error('Failed to get AI-powered resume matching results.');
    }
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

export async function updateConsultantOpportunities(consultantId: string, opportunityCount: number): Promise<Consultant | undefined> {
    try {
        return await updateConsultantOpportunitiesAction(consultantId, opportunityCount);
    } catch (error) {
        console.error('Error updating consultant opportunities:', error);
        throw new Error('Failed to update consultant opportunities in the database.');
    }
}

export async function callChatbot(history: ChatMessage[], message: string, pathname: string): Promise<string> {
  try {
    const response = await chat(history, message, pathname);
    return response;
  } catch (error) {
    console.error("Error in chatbot flow action:", error);
    throw new Error("Failed to get response from chatbot.");
  }
}

export async function callConsultantChatbot(consultantId: string, history: any[], message: string): Promise<string> {
  try {
    const response = await consultantChatbotFlow({ history, consultantId, query: message });
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

export async function updateConsultantStatus(consultantId: string, status: 'On Bench' | 'On Project'): Promise<Consultant | undefined> {
    try {
        return await updateConsultantStatusInDb(consultantId, status);
    } catch (error) {
        console.error('Error updating consultant status:', error);
        throw new Error('Failed to update consultant status in the database.');
    }
}

export async function createOpportunity(data: {
  title: string;
  neededYOE: number;
  neededSkills: string;
  responsibilities: string;
}): Promise<void> {
    try {
        const skillsArray = data.neededSkills.split(',').map(skill => skill.trim());
        
        const opportunityData: Omit<JobOpportunity, 'id'> = {
            title: data.title,
            neededYOE: data.neededYOE,
            neededSkills: skillsArray,
            responsibilities: data.responsibilities,
        };

        await createJobOpportunity(opportunityData);
    } catch (error) {
        console.error('Error creating opportunity:', error);
        throw new Error('Failed to create new opportunity in the database.');
    }
}
