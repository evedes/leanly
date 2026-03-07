import {
  pgEnum,
  pgTable,
  uuid,
  integer,
  timestamp,
  jsonb,
  index,
} from 'drizzle-orm/pg-core';
import { tasks } from './tasks.js';
import { agents } from './agents.js';

export const traceTypeEnum = pgEnum('trace_type', [
  'reasoning',
  'tool_call',
  'output',
  'error',
]);

export const traces = pgTable(
  'traces',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    taskId: uuid('task_id')
      .notNull()
      .references(() => tasks.id),
    agentId: uuid('agent_id')
      .notNull()
      .references(() => agents.id),
    type: traceTypeEnum('type').notNull(),
    content: jsonb('content').notNull(),
    tokenCount: integer('token_count'),
    timestamp: timestamp('timestamp', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index('traces_task_id_idx').on(table.taskId),
    index('traces_agent_id_idx').on(table.agentId),
  ],
);
