-- Add slug column to workspaces
ALTER TABLE "workspaces" ADD COLUMN "slug" varchar(255) NOT NULL DEFAULT '';
CREATE UNIQUE INDEX "workspaces_slug_idx" ON "workspaces" ("slug");

-- Create users table
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"clerk_id" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"name" varchar(255),
	"workspace_id" uuid NOT NULL REFERENCES "workspaces"("id"),
	"role" varchar(50) NOT NULL DEFAULT 'member',
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
CREATE UNIQUE INDEX "users_clerk_id_idx" ON "users" ("clerk_id");

-- Create enums
CREATE TYPE "agent_status" AS ENUM ('active', 'inactive', 'error');
CREATE TYPE "task_status" AS ENUM ('todo', 'in_progress', 'in_review', 'approved', 'rejected');
CREATE TYPE "assignee_type" AS ENUM ('human', 'agent');
CREATE TYPE "trace_type" AS ENUM ('reasoning', 'tool_call', 'output', 'error');
CREATE TYPE "approval_decision" AS ENUM ('approved', 'rejected', 'changes_requested');

-- Create agents table
CREATE TABLE "agents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"workspace_id" uuid NOT NULL REFERENCES "workspaces"("id"),
	"status" "agent_status" NOT NULL DEFAULT 'active',
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

-- Add foreign keys to api_keys
ALTER TABLE "api_keys" ADD CONSTRAINT "api_keys_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id");
ALTER TABLE "api_keys" ADD CONSTRAINT "api_keys_agent_id_fk" FOREIGN KEY ("agent_id") REFERENCES "agents"("id");

-- Create tasks table
CREATE TABLE "tasks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL REFERENCES "workspaces"("id"),
	"title" varchar(500) NOT NULL,
	"description" text,
	"status" "task_status" NOT NULL DEFAULT 'todo',
	"assignee_type" "assignee_type",
	"assignee_id" uuid,
	"autonomy_level" integer NOT NULL DEFAULT 0,
	"created_by" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
CREATE INDEX "tasks_workspace_id_idx" ON "tasks" ("workspace_id");
CREATE INDEX "tasks_status_idx" ON "tasks" ("status");
CREATE INDEX "tasks_assignee_idx" ON "tasks" ("assignee_type", "assignee_id");

-- Create traces table
CREATE TABLE "traces" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"task_id" uuid NOT NULL REFERENCES "tasks"("id"),
	"agent_id" uuid NOT NULL REFERENCES "agents"("id"),
	"type" "trace_type" NOT NULL,
	"content" jsonb NOT NULL,
	"token_count" integer,
	"timestamp" timestamp with time zone DEFAULT now() NOT NULL
);
CREATE INDEX "traces_task_id_idx" ON "traces" ("task_id");
CREATE INDEX "traces_agent_id_idx" ON "traces" ("agent_id");

-- Create approvals table
CREATE TABLE "approvals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"task_id" uuid NOT NULL REFERENCES "tasks"("id"),
	"reviewer_id" uuid NOT NULL REFERENCES "users"("id"),
	"decision" "approval_decision" NOT NULL,
	"comment" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
CREATE INDEX "approvals_task_id_idx" ON "approvals" ("task_id");
