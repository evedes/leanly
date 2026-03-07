import {
  pgTable,
  uuid,
  varchar,
  char,
  timestamp,
} from 'drizzle-orm/pg-core';

export const apiKeys = pgTable('api_keys', {
  id: uuid('id').defaultRandom().primaryKey(),
  keyHash: char('key_hash', { length: 64 }).notNull().unique(),
  keyPrefix: varchar('key_prefix', { length: 12 }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  workspaceId: uuid('workspace_id').notNull(),
  agentId: uuid('agent_id').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  lastUsedAt: timestamp('last_used_at', { withTimezone: true }),
  revokedAt: timestamp('revoked_at', { withTimezone: true }),
});
