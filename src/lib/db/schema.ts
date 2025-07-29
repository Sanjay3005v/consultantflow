import { sqliteTable, text, integer, real, primaryKey } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';

export const consultants = sqliteTable('consultants', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    name: text('name').notNull(),
    email: text('email').notNull().unique(),
    password: text('password').notNull(),
    department: text('department', { enum: ['Technology', 'Healthcare', 'Finance', 'Retail'] }).notNull(),
    status: text('status', { enum: ['On Bench', 'On Project'] }).notNull(),
    resumeStatus: text('resume_status', { enum: ['Updated', 'Pending'] }).notNull(),
    opportunities: integer('opportunities').notNull(),
    training: text('training', { enum: ['Not Started', 'In Progress', 'Completed'] }).notNull(),
    resumeUpdated: integer('resume_updated', { mode: 'boolean' }).notNull(),
    attendanceReported: integer('attendance_reported', { mode: 'boolean' }).notNull(),
    opportunitiesDocumented: integer('opportunities_documented', { mode: 'boolean' }).notNull(),
    trainingCompleted: integer('training_completed', { mode: 'boolean' }).notNull(),
});

export type NewConsultant = typeof consultants.$inferInsert;

export const skills = sqliteTable('skills', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    consultantId: integer('consultant_id').notNull().references(() => consultants.id),
    skill: text('skill').notNull(),
    rating: real('rating').notNull(),
    reasoning: text('reasoning').notNull(),
});

export const attendance = sqliteTable('attendance', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    consultantId: integer('consultant_id').notNull().references(() => consultants.id),
    date: text('date').notNull(), // YYYY-MM-DD
    status: text('status', { enum: ['Present', 'Absent'] }).notNull(),
});

export const consultantsRelations = relations(consultants, ({ many }) => ({
    skills: many(skills),
    attendance: many(attendance),
}));

export const skillsRelations = relations(skills, ({ one }) => ({
    consultant: one(consultants, {
        fields: [skills.consultantId],
        references: [consultants.id],
    }),
}));

export const attendanceRelations = relations(attendance, ({ one }) => ({
    consultant: one(consultants, {
        fields: [attendance.consultantId],
        references: [consultants.id],
    }),
}));
