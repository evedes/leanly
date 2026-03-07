import {
  pgEnum,
  pgTable,
  uuid,
  varchar,
  text,
  integer,
  timestamp,
  index,
} from 'drizzle-orm/pg-core';
import { workspaces } from './workspaces.js';

export const taskStatusEnum = pgEnum('task_status', [
  'todo',
  'in_progress',
  'in_review',
  'approved',
  'rejected',
]);

export const assigneeTypeEnum = pgEnum('assignee_type', ['human', 'agent']);

export const tasks = pgTable(
  'tasks',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    workspaceId: uuid('workspace_id')
      .notNull()
      .references(() => workspaces.id),
    title: varchar('title', { length: 500 }).notNull(),
    description: text('description'),
    status: taskStatusEnum('status').notNull().default('todo'),
    assigneeType: assigneeTypeEnum('assignee_type'),
    assigneeId: uuid('assignee_id'),
    autonomyLevel: integer('autonomy_level').notNull().default(0),
    createdBy: uuid('created_by').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index('tasks_workspace_id_idx').on(table.workspaceId),
    index('tasks_status_idx').on(table.status),
    index('tasks_assignee_idx').on(table.assigneeType, table.assigneeId),
  ],
);
