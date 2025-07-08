import { pgTable, serial, text, varchar, timestamp, integer, jsonb, foreignKey } from "drizzle-orm/pg-core";

export const StudyProject = pgTable('study_project', {
  id: serial('id').primaryKey(),
  projectName: varchar('project_name').notNull(),
  description: text('description'),
  deadline: timestamp('deadline'),
  createdBy: varchar('created_by').notNull(),
});

export const StudySession = pgTable('study_session', {
  id: serial('id').primaryKey(),
  projectName: varchar('project_name', { length: 255 }),
  projectId: integer('project_id').notNull().references(() => StudyProject.id, {
    onDelete: 'cascade',
  }),
  sessionNo: varchar('session_no', { length: 255 }).notNull(),
  status: varchar('status', { length: 255 }).default('completed'),
  startTime: timestamp('start_time'),
  endTime: timestamp('end_time'),
  createdAt: timestamp('created_at').defaultNow(),
  focusTime: integer('focus_time'),
  distractedTime: integer('distracted_time'),
  distractionBreakdown: jsonb('distraction_breakdown').default({}),
  focusPercentage: integer('focus_percentage'),
  averageFocusLevel: integer('average_focus_level'), // New field for average focus level (0-10)
  focusTrend: jsonb('focus_trend').default([]),
  notes: text('notes'),
});