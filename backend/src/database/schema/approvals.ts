import {
  pgEnum,
  pgTable,
  uuid,
  text,
  timestamp,
  index,
} from 'drizzle-orm/pg-core';
import { tasks } from './tasks.js';
import { users } from './users.js';

export const approvalDecisionEnum = pgEnum('approval_decision', [
  'approved',
  'rejected',
  'changes_requested',
]);

export const approvals = pgTable(
  'approvals',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    taskId: uuid('task_id')
      .notNull()
      .references(() => tasks.id),
    reviewerId: uuid('reviewer_id')
      .notNull()
      .references(() => users.id),
    decision: approvalDecisionEnum('decision').notNull(),
    comment: text('comment'),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [index('approvals_task_id_idx').on(table.taskId)],
);
