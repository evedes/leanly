CREATE TABLE "api_keys" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"key_hash" char(64) NOT NULL,
	"key_prefix" varchar(12) NOT NULL,
	"name" varchar(255) NOT NULL,
	"workspace_id" uuid NOT NULL,
	"agent_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_used_at" timestamp with time zone,
	"revoked_at" timestamp with time zone,
	CONSTRAINT "api_keys_key_hash_unique" UNIQUE("key_hash")
);
