import { db } from './db';
import { consultants, skills, attendance, NewConsultant } from './db/schema';
import type { Consultant, SkillAnalysis, AttendanceRecord } from './types';
import { eq, sql } from 'drizzle-orm';

function mapDbToConsultant(
    dbConsultant: any, 
    dbSkills: any[], 
    dbAttendance: any[]
): Consultant {
    return {
        id: dbConsultant.id.toString(),
        name: dbConsultant.name,
        email: dbConsultant.email,
        password: dbConsultant.password,
        department: dbConsultant.department,
        status: dbConsultant.status,
        resumeStatus: dbConsultant.resumeStatus,
        opportunities: dbConsultant.opportunities,
        training: dbConsultant.training,
        workflow: {
            resumeUpdated: dbConsultant.resumeUpdated,
            attendanceReported: dbConsultant.attendanceReported,
            opportunitiesDocumented: dbConsultant.opportunitiesDocumented,
            trainingCompleted: dbConsultant.trainingCompleted,
        },
        skills: dbSkills.map(s => ({
            skill: s.skill,
            rating: s.rating,
            reasoning: s.reasoning
        })),
        attendance: dbAttendance.map(a => ({
            date: a.date,
            status: a.status
        }))
    };
}


export const getConsultantById = (id: string): Consultant | undefined => {
    const consultantId = parseInt(id, 10);
    if (isNaN(consultantId)) return undefined;

    const dbConsultant = db.select().from(consultants).where(eq(consultants.id, consultantId)).get();
    if (!dbConsultant) return undefined;
    
    const dbSkills = db.select().from(skills).where(eq(skills.consultantId, consultantId)).all();
    const dbAttendance = db.select().from(attendance).where(eq(attendance.consultantId, consultantId)).all();

    return mapDbToConsultant(dbConsultant, dbSkills, dbAttendance);
}

export const getAllConsultants = (): Consultant[] => {
    const allDbConsultants = db.select().from(consultants).all();
    
    return allDbConsultants.map(dbConsultant => {
        const dbSkills = db.select().from(skills).where(eq(skills.consultantId, dbConsultant.id)).all();
        const dbAttendance = db.select().from(attendance).where(eq(attendance.consultantId, dbConsultant.id)).all();
        return mapDbToConsultant(dbConsultant, dbSkills, dbAttendance);
    });
}

export const findConsultantByEmail = (email: string): Consultant | undefined => {
    const dbConsultant = db.select().from(consultants).where(eq(consultants.email, email.toLowerCase())).get();
    if (!dbConsultant) return undefined;
    
    const dbSkills = db.select().from(skills).where(eq(skills.consultantId, dbConsultant.id)).all();
    const dbAttendance = db.select().from(attendance).where(eq(attendance.consultantId, dbConsultant.id)).all();

    return mapDbToConsultant(dbConsultant, dbSkills, dbAttendance);
}

export const updateConsultantAttendance = (id: string, date: string, status: 'Present' | 'Absent') => {
    const consultantId = parseInt(id, 10);
    if (isNaN(consultantId)) return undefined;

    const existingRecord = db.select().from(attendance)
        .where(sql`${attendance.consultantId} = ${consultantId} AND ${attendance.date} = ${date}`)
        .get();

    if (existingRecord) {
        db.update(attendance)
          .set({ status })
          .where(sql`${attendance.consultantId} = ${consultantId} AND ${attendance.date} = ${date}`)
          .run();
    } else {
        db.insert(attendance)
          .values({ consultantId, date, status })
          .run();
    }
    
    return getConsultantById(id);
};

export const updateConsultantSkills = (id: string, newSkills: SkillAnalysis[]) => {
  const consultantId = parseInt(id, 10);
  if (isNaN(consultantId)) return undefined;

  // Clear existing skills
  db.delete(skills).where(eq(skills.consultantId, consultantId)).run();
  
  // Insert new skills
  if(newSkills.length > 0) {
      const skillsToInsert = newSkills.map(s => ({
          consultantId,
          ...s
      }));
      db.insert(skills).values(skillsToInsert).run();
  }
  
  // Update consultant status
  db.update(consultants)
    .set({ resumeStatus: 'Updated', resumeUpdated: true })
    .where(eq(consultants.id, consultantId))
    .run();
  
  return getConsultantById(id);
};

export const addSkillToConsultant = (id: string, newSkill: SkillAnalysis) => {
    const consultantId = parseInt(id, 10);
    if (isNaN(consultantId)) return undefined;

    db.insert(skills).values({
        consultantId: consultantId,
        skill: newSkill.skill,
        rating: newSkill.rating,
        reasoning: newSkill.reasoning,
    }).run();

    db.update(consultants)
      .set({ training: 'Completed', trainingCompleted: true })
      .where(eq(consultants.id, consultantId))
      .run();

    return getConsultantById(id);
};

export const createConsultant = (data: { name: string; email: string; password?: string; department: 'Technology' | 'Healthcare' | 'Finance' | 'Retail', status?: 'On Bench' | 'On Project', training?: 'Not Started' | 'In Progress' | 'Completed' }) => {
    
    const newConsultant: NewConsultant = {
        name: data.name,
        email: data.email.toLowerCase(),
        password: data.password || 'password123',
        department: data.department,
        status: data.status || 'On Bench',
        training: data.training || 'Not Started',
        resumeStatus: 'Pending',
        opportunities: 0,
        resumeUpdated: false,
        attendanceReported: false,
        opportunitiesDocumented: false,
        trainingCompleted: false,
    };
    
    const result = db.insert(consultants).values(newConsultant).returning({ id: consultants.id }).get();
    
    return getConsultantById(result.id.toString())!;
};