import { db } from './db';
import * as schema from './db/schema';
import { eq } from 'drizzle-orm';
import type { Consultant, SkillAnalysis, AttendanceRecord } from './types';

// Helper to map DB consultant to app consultant type
const mapDbConsultantToApp = (dbConsultant: any, dbSkills: any[], dbAttendance: any[]): Consultant => {
    return {
        id: dbConsultant.id,
        name: dbConsultant.name,
        email: dbConsultant.email,
        password: dbConsultant.password,
        department: dbConsultant.department,
        status: dbConsultant.status,
        resumeStatus: dbConsultant.resumeStatus,
        opportunities: dbConsultant.opportunities,
        training: dbConsultant.training,
        skills: dbSkills.map(s => ({
            skill: s.skill,
            rating: s.rating,
            reasoning: s.reasoning,
        })),
        attendance: dbAttendance.map(a => ({
            date: a.date,
            status: a.status,
        })),
        workflow: {
            resumeUpdated: dbConsultant.workflowResumeUpdated,
            attendanceReported: dbConsultant.workflowAttendanceReported,
            opportunitiesDocumented: dbConsultant.workflowOpportunitiesDocumented,
            trainingCompleted: dbConsultant.workflowTrainingCompleted,
        },
    };
};

export const getAdminCredentials = () => {
    return {
        email: 'admin@company.com',
        password: 'adminpassword',
    };
};

export const getConsultantById = async (id: string): Promise<Consultant | undefined> => {
    const dbConsultant = await db.query.consultants.findFirst({
        where: eq(schema.consultants.id, id),
    });

    if (!dbConsultant) return undefined;

    const dbSkills = await db.select().from(schema.skills).where(eq(schema.skills.consultantId, id));
    const dbAttendance = await db.select().from(schema.attendance).where(eq(schema.attendance.consultantId, id));

    return mapDbConsultantToApp(dbConsultant, dbSkills, dbAttendance);
};

export const getAllConsultants = async (): Promise<Consultant[]> => {
    const allDbConsultants = await db.select().from(schema.consultants).all();
    
    const result: Consultant[] = [];
    for (const dbConsultant of allDbConsultants) {
        const dbSkills = await db.select().from(schema.skills).where(eq(schema.skills.consultantId, dbConsultant.id)).all();
        const dbAttendance = await db.select().from(schema.attendance).where(eq(schema.attendance.consultantId, dbConsultant.id)).all();
        result.push(mapDbConsultantToApp(dbConsultant, dbSkills, dbAttendance));
    }
    
    return result;
};


export const findConsultantByEmail = async (email: string): Promise<Consultant | undefined> => {
    const dbConsultant = await db.query.consultants.findFirst({
        where: eq(schema.consultants.email, email.toLowerCase()),
    });

    if (!dbConsultant) return undefined;
    
    return getConsultantById(dbConsultant.id);
};

export const updateConsultantAttendanceInDb = async (id: string, date: string, status: 'Present' | 'Absent') => {
    const existingRecord = await db.query.attendance.findFirst({
        where: (attendance, { and }) => and(
            eq(attendance.consultantId, id),
            eq(attendance.date, date)
        ),
    });

    if (existingRecord) {
        await db.update(schema.attendance)
            .set({ status })
            .where(eq(schema.attendance.id, existingRecord.id));
    } else {
        await db.insert(schema.attendance).values({ consultantId: id, date, status });
    }
    return getConsultantById(id);
};

export const updateConsultantSkillsInDb = async (id: string, newSkills: SkillAnalysis[]) => {
    // Clear existing skills
    await db.delete(schema.skills).where(eq(schema.skills.consultantId, id));

    // Insert new skills
    if (newSkills.length > 0) {
        await db.insert(schema.skills).values(
            newSkills.map(skill => ({
                consultantId: id,
                skill: skill.skill,
                rating: skill.rating,
                reasoning: skill.reasoning,
            }))
        );
    }
    
    // Update consultant status
    await db.update(schema.consultants)
        .set({ resumeStatus: 'Updated', workflowResumeUpdated: true })
        .where(eq(schema.consultants.id, id));

    return getConsultantById(id);
};

export const addSkillToConsultantInDb = async (id: string, newSkill: SkillAnalysis) => {
    await db.insert(schema.skills).values({
        consultantId: id,
        skill: newSkill.skill,
        rating: newSkill.rating,
        reasoning: newSkill.reasoning,
    });
    
    await db.update(schema.consultants)
        .set({ training: 'Completed', workflowTrainingCompleted: true })
        .where(eq(schema.consultants.id, id));
        
    return getConsultantById(id);
};

export const createConsultant = async (data: { name: string; email: string; password?: string; department: 'Technology' | 'Healthcare' | 'Finance' | 'Retail', status?: 'On Bench' | 'On Project', training?: 'Not Started' | 'In Progress' | 'Completed' }) => {
    const newId = (Math.random() * 1000000).toFixed(0).toString(); // Simple unique ID
    
    const newConsultant = {
        id: newId,
        name: data.name,
        email: data.email.toLowerCase(),
        password: data.password || 'password123',
        department: data.department,
        status: data.status || 'On Bench',
        training: data.training || 'Not Started',
        resumeStatus: 'Pending' as const,
        opportunities: 0,
        workflowResumeUpdated: false,
        workflowAttendanceReported: false,
        workflowOpportunitiesDocumented: false,
        workflowTrainingCompleted: false,
    };
    
    await db.insert(schema.consultants).values(newConsultant);

    return (await getConsultantById(newId))!;
};
