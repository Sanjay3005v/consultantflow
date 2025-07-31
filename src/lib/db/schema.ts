import { sqliteTable, text, integer, primaryKey } from 'drizzle-orm/sqlite-core';

export const consultants = sqliteTable('consultants', {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    email: text('email').notNull().unique(),
    password: text('password').notNull(),
    department: text('department', { enum: ['Technology', 'Healthcare', 'Finance', 'Retail'] }).notNull(),
    status: text('status', { enum: ['On Bench', 'On Project'] }).notNull(),
    resumeStatus: text('resume_status', { enum: ['Updated', 'Pending'] }).notNull(),
    opportunities: integer('opportunities').notNull(),
    training: text('training', { enum: ['Not Started', 'In Progress', 'Completed'] }).notNull(),
    workflowResumeUpdated: integer('workflow_resume_updated', { mode: 'boolean' }).notNull(),
    workflowAttendanceReported: integer('workflow_attendance_reported', { mode: 'boolean' }).notNull(),
    workflowOpportunitiesDocumented: integer('workflow_opportunities_documented', { mode: 'boolean' }).notNull(),
    workflowTrainingCompleted: integer('workflow_training_completed', { mode: 'boolean' }).notNull(),
});

export const skills = sqliteTable('skills', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    consultantId: text('consultant_id').notNull().references(() => consultants.id),
    skill: text('skill').notNull(),
    rating: integer('rating').notNull(),
    reasoning: text('reasoning').notNull(),
});

export const attendance = sqliteTable('attendance', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    consultantId: text('consultant_id').notNull().references(() => consultants.id),
    date: text('date').notNull(), // YYYY-MM-DD
    status: text('status', { enum: ['Present', 'Absent'] }).notNull(),
});
