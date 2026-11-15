import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_users_role" AS ENUM('reader', 'author', 'researcher', 'fact_checker', 'editor', 'administrator');
  CREATE TYPE "public"."enum_articles_division" AS ENUM('ai-technology', 'cybersecurity', 'cloud-engineering', 'business-startups');
  CREATE TYPE "public"."enum_articles_workflow_status" AS ENUM('pitch', 'research', 'draft', 'fact_check', 'editorial_review', 'approved', 'scheduled', 'published', 'correction_required', 'archived');
  CREATE TYPE "public"."enum_articles_status" AS ENUM('draft', 'published', 'draft', 'published');
  CREATE TYPE "public"."enum__articles_v_version_division" AS ENUM('ai-technology', 'cybersecurity', 'cloud-engineering', 'business-startups');
  CREATE TYPE "public"."enum__articles_v_version_workflow_status" AS ENUM('pitch', 'research', 'draft', 'fact_check', 'editorial_review', 'approved', 'scheduled', 'published', 'correction_required', 'archived');
  CREATE TYPE "public"."enum__articles_v_version_status" AS ENUM('draft', 'published', 'draft', 'published');
  CREATE TYPE "public"."enum_sources_source_type" AS ENUM('primary', 'secondary', 'dataset', 'official_documentation');
  CREATE TYPE "public"."enum_evidence_verification_status" AS ENUM('captured', 'preserved', 'verified', 'rejected');
  CREATE TYPE "public"."enum_claims_verification_status" AS ENUM('verified', 'corroborated', 'attributed', 'disputed', 'unverified', 'corrected');
  CREATE TYPE "public"."enum_audit_events_outcome" AS ENUM('success', 'rejected', 'failure');
  CREATE TABLE "users_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "users" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"role" "enum_users_role" DEFAULT 'author' NOT NULL,
  	"active" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"reset_password_requested_at" timestamp(3) with time zone,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE "articles" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"slug" varchar,
  	"excerpt" varchar,
  	"body" jsonb,
  	"division" "enum_articles_division",
  	"author_id" integer,
  	"assigned_editor_id" integer,
  	"assigned_fact_checker_id" integer,
  	"workflow_status" "enum_articles_workflow_status" DEFAULT 'draft',
  	"fact_check_complete" boolean DEFAULT false,
  	"disclosures_reviewed" boolean DEFAULT false,
  	"approved_by_id" integer,
  	"approved_at" timestamp(3) with time zone,
  	"published_at" timestamp(3) with time zone,
  	"revision" numeric DEFAULT 1,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_articles_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "articles_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"topics_id" integer
  );
  
  CREATE TABLE "_articles_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_slug" varchar,
  	"version_excerpt" varchar,
  	"version_body" jsonb,
  	"version_division" "enum__articles_v_version_division",
  	"version_author_id" integer,
  	"version_assigned_editor_id" integer,
  	"version_assigned_fact_checker_id" integer,
  	"version_workflow_status" "enum__articles_v_version_workflow_status" DEFAULT 'draft',
  	"version_fact_check_complete" boolean DEFAULT false,
  	"version_disclosures_reviewed" boolean DEFAULT false,
  	"version_approved_by_id" integer,
  	"version_approved_at" timestamp(3) with time zone,
  	"version_published_at" timestamp(3) with time zone,
  	"version_revision" numeric DEFAULT 1,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__articles_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "_articles_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"topics_id" integer
  );
  
  CREATE TABLE "topics" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"description" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "sources" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"canonical_url" varchar NOT NULL,
  	"publisher" varchar NOT NULL,
  	"author" varchar,
  	"published_at" timestamp(3) with time zone,
  	"retrieved_at" timestamp(3) with time zone NOT NULL,
  	"source_type" "enum_sources_source_type" NOT NULL,
  	"notes" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "evidence" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"evidence_id" varchar NOT NULL,
  	"source_id" integer NOT NULL,
  	"collection_method" varchar NOT NULL,
  	"retrieved_at" timestamp(3) with time zone NOT NULL,
  	"content_type" varchar NOT NULL,
  	"byte_size" numeric NOT NULL,
  	"sha256" varchar NOT NULL,
  	"storage_ref" varchar NOT NULL,
  	"object_version" varchar,
  	"verification_status" "enum_evidence_verification_status" DEFAULT 'captured' NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "claims" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"claim_text" varchar NOT NULL,
  	"article_id" integer,
  	"verification_status" "enum_claims_verification_status" DEFAULT 'unverified' NOT NULL,
  	"material" boolean DEFAULT true,
  	"reviewed_by_id" integer,
  	"reviewed_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "claims_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"sources_id" integer,
  	"evidence_id" integer
  );
  
  CREATE TABLE "audit_events" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"event_id" varchar NOT NULL,
  	"actor_id" varchar NOT NULL,
  	"actor_role" varchar NOT NULL,
  	"action" varchar NOT NULL,
  	"resource" varchar NOT NULL,
  	"resource_id" varchar NOT NULL,
  	"before_digest" varchar,
  	"after_digest" varchar,
  	"correlation_id" varchar,
  	"outcome" "enum_audit_events_outcome" NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_kv" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"data" jsonb NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"global_slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer,
  	"articles_id" integer,
  	"topics_id" integer,
  	"sources_id" integer,
  	"evidence_id" integer,
  	"claims_id" integer,
  	"audit_events_id" integer
  );
  
  CREATE TABLE "payload_preferences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"value" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_preferences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  CREATE TABLE "payload_migrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "users_sessions" ADD CONSTRAINT "users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "articles" ADD CONSTRAINT "articles_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "articles" ADD CONSTRAINT "articles_assigned_editor_id_users_id_fk" FOREIGN KEY ("assigned_editor_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "articles" ADD CONSTRAINT "articles_assigned_fact_checker_id_users_id_fk" FOREIGN KEY ("assigned_fact_checker_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "articles" ADD CONSTRAINT "articles_approved_by_id_users_id_fk" FOREIGN KEY ("approved_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "articles_rels" ADD CONSTRAINT "articles_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "articles_rels" ADD CONSTRAINT "articles_rels_topics_fk" FOREIGN KEY ("topics_id") REFERENCES "public"."topics"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_articles_v" ADD CONSTRAINT "_articles_v_parent_id_articles_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."articles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_articles_v" ADD CONSTRAINT "_articles_v_version_author_id_users_id_fk" FOREIGN KEY ("version_author_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_articles_v" ADD CONSTRAINT "_articles_v_version_assigned_editor_id_users_id_fk" FOREIGN KEY ("version_assigned_editor_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_articles_v" ADD CONSTRAINT "_articles_v_version_assigned_fact_checker_id_users_id_fk" FOREIGN KEY ("version_assigned_fact_checker_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_articles_v" ADD CONSTRAINT "_articles_v_version_approved_by_id_users_id_fk" FOREIGN KEY ("version_approved_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_articles_v_rels" ADD CONSTRAINT "_articles_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_articles_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_articles_v_rels" ADD CONSTRAINT "_articles_v_rels_topics_fk" FOREIGN KEY ("topics_id") REFERENCES "public"."topics"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "evidence" ADD CONSTRAINT "evidence_source_id_sources_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."sources"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "claims" ADD CONSTRAINT "claims_article_id_articles_id_fk" FOREIGN KEY ("article_id") REFERENCES "public"."articles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "claims" ADD CONSTRAINT "claims_reviewed_by_id_users_id_fk" FOREIGN KEY ("reviewed_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "claims_rels" ADD CONSTRAINT "claims_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."claims"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "claims_rels" ADD CONSTRAINT "claims_rels_sources_fk" FOREIGN KEY ("sources_id") REFERENCES "public"."sources"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "claims_rels" ADD CONSTRAINT "claims_rels_evidence_fk" FOREIGN KEY ("evidence_id") REFERENCES "public"."evidence"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_articles_fk" FOREIGN KEY ("articles_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_topics_fk" FOREIGN KEY ("topics_id") REFERENCES "public"."topics"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_sources_fk" FOREIGN KEY ("sources_id") REFERENCES "public"."sources"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_evidence_fk" FOREIGN KEY ("evidence_id") REFERENCES "public"."evidence"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_claims_fk" FOREIGN KEY ("claims_id") REFERENCES "public"."claims"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_audit_events_fk" FOREIGN KEY ("audit_events_id") REFERENCES "public"."audit_events"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "users_sessions_order_idx" ON "users_sessions" USING btree ("_order");
  CREATE INDEX "users_sessions_parent_id_idx" ON "users_sessions" USING btree ("_parent_id");
  CREATE INDEX "users_updated_at_idx" ON "users" USING btree ("updated_at");
  CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");
  CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");
  CREATE UNIQUE INDEX "articles_slug_idx" ON "articles" USING btree ("slug");
  CREATE INDEX "articles_author_idx" ON "articles" USING btree ("author_id");
  CREATE INDEX "articles_assigned_editor_idx" ON "articles" USING btree ("assigned_editor_id");
  CREATE INDEX "articles_assigned_fact_checker_idx" ON "articles" USING btree ("assigned_fact_checker_id");
  CREATE INDEX "articles_workflow_status_idx" ON "articles" USING btree ("workflow_status");
  CREATE INDEX "articles_approved_by_idx" ON "articles" USING btree ("approved_by_id");
  CREATE INDEX "articles_published_at_idx" ON "articles" USING btree ("published_at");
  CREATE INDEX "articles_updated_at_idx" ON "articles" USING btree ("updated_at");
  CREATE INDEX "articles_created_at_idx" ON "articles" USING btree ("created_at");
  CREATE INDEX "articles__status_idx" ON "articles" USING btree ("_status");
  CREATE INDEX "articles_rels_order_idx" ON "articles_rels" USING btree ("order");
  CREATE INDEX "articles_rels_parent_idx" ON "articles_rels" USING btree ("parent_id");
  CREATE INDEX "articles_rels_path_idx" ON "articles_rels" USING btree ("path");
  CREATE INDEX "articles_rels_topics_id_idx" ON "articles_rels" USING btree ("topics_id");
  CREATE INDEX "_articles_v_parent_idx" ON "_articles_v" USING btree ("parent_id");
  CREATE INDEX "_articles_v_version_version_slug_idx" ON "_articles_v" USING btree ("version_slug");
  CREATE INDEX "_articles_v_version_version_author_idx" ON "_articles_v" USING btree ("version_author_id");
  CREATE INDEX "_articles_v_version_version_assigned_editor_idx" ON "_articles_v" USING btree ("version_assigned_editor_id");
  CREATE INDEX "_articles_v_version_version_assigned_fact_checker_idx" ON "_articles_v" USING btree ("version_assigned_fact_checker_id");
  CREATE INDEX "_articles_v_version_version_workflow_status_idx" ON "_articles_v" USING btree ("version_workflow_status");
  CREATE INDEX "_articles_v_version_version_approved_by_idx" ON "_articles_v" USING btree ("version_approved_by_id");
  CREATE INDEX "_articles_v_version_version_published_at_idx" ON "_articles_v" USING btree ("version_published_at");
  CREATE INDEX "_articles_v_version_version_updated_at_idx" ON "_articles_v" USING btree ("version_updated_at");
  CREATE INDEX "_articles_v_version_version_created_at_idx" ON "_articles_v" USING btree ("version_created_at");
  CREATE INDEX "_articles_v_version_version__status_idx" ON "_articles_v" USING btree ("version__status");
  CREATE INDEX "_articles_v_created_at_idx" ON "_articles_v" USING btree ("created_at");
  CREATE INDEX "_articles_v_updated_at_idx" ON "_articles_v" USING btree ("updated_at");
  CREATE INDEX "_articles_v_latest_idx" ON "_articles_v" USING btree ("latest");
  CREATE INDEX "_articles_v_rels_order_idx" ON "_articles_v_rels" USING btree ("order");
  CREATE INDEX "_articles_v_rels_parent_idx" ON "_articles_v_rels" USING btree ("parent_id");
  CREATE INDEX "_articles_v_rels_path_idx" ON "_articles_v_rels" USING btree ("path");
  CREATE INDEX "_articles_v_rels_topics_id_idx" ON "_articles_v_rels" USING btree ("topics_id");
  CREATE UNIQUE INDEX "topics_slug_idx" ON "topics" USING btree ("slug");
  CREATE INDEX "topics_updated_at_idx" ON "topics" USING btree ("updated_at");
  CREATE INDEX "topics_created_at_idx" ON "topics" USING btree ("created_at");
  CREATE INDEX "sources_canonical_url_idx" ON "sources" USING btree ("canonical_url");
  CREATE INDEX "sources_updated_at_idx" ON "sources" USING btree ("updated_at");
  CREATE INDEX "sources_created_at_idx" ON "sources" USING btree ("created_at");
  CREATE UNIQUE INDEX "evidence_evidence_id_idx" ON "evidence" USING btree ("evidence_id");
  CREATE INDEX "evidence_source_idx" ON "evidence" USING btree ("source_id");
  CREATE INDEX "evidence_updated_at_idx" ON "evidence" USING btree ("updated_at");
  CREATE INDEX "evidence_created_at_idx" ON "evidence" USING btree ("created_at");
  CREATE INDEX "claims_article_idx" ON "claims" USING btree ("article_id");
  CREATE INDEX "claims_reviewed_by_idx" ON "claims" USING btree ("reviewed_by_id");
  CREATE INDEX "claims_updated_at_idx" ON "claims" USING btree ("updated_at");
  CREATE INDEX "claims_created_at_idx" ON "claims" USING btree ("created_at");
  CREATE INDEX "claims_rels_order_idx" ON "claims_rels" USING btree ("order");
  CREATE INDEX "claims_rels_parent_idx" ON "claims_rels" USING btree ("parent_id");
  CREATE INDEX "claims_rels_path_idx" ON "claims_rels" USING btree ("path");
  CREATE INDEX "claims_rels_sources_id_idx" ON "claims_rels" USING btree ("sources_id");
  CREATE INDEX "claims_rels_evidence_id_idx" ON "claims_rels" USING btree ("evidence_id");
  CREATE UNIQUE INDEX "audit_events_event_id_idx" ON "audit_events" USING btree ("event_id");
  CREATE INDEX "audit_events_correlation_id_idx" ON "audit_events" USING btree ("correlation_id");
  CREATE INDEX "audit_events_updated_at_idx" ON "audit_events" USING btree ("updated_at");
  CREATE INDEX "audit_events_created_at_idx" ON "audit_events" USING btree ("created_at");
  CREATE UNIQUE INDEX "payload_kv_key_idx" ON "payload_kv" USING btree ("key");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_users_id_idx" ON "payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX "payload_locked_documents_rels_articles_id_idx" ON "payload_locked_documents_rels" USING btree ("articles_id");
  CREATE INDEX "payload_locked_documents_rels_topics_id_idx" ON "payload_locked_documents_rels" USING btree ("topics_id");
  CREATE INDEX "payload_locked_documents_rels_sources_id_idx" ON "payload_locked_documents_rels" USING btree ("sources_id");
  CREATE INDEX "payload_locked_documents_rels_evidence_id_idx" ON "payload_locked_documents_rels" USING btree ("evidence_id");
  CREATE INDEX "payload_locked_documents_rels_claims_id_idx" ON "payload_locked_documents_rels" USING btree ("claims_id");
  CREATE INDEX "payload_locked_documents_rels_audit_events_id_idx" ON "payload_locked_documents_rels" USING btree ("audit_events_id");
  CREATE INDEX "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_users_id_idx" ON "payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "users_sessions" CASCADE;
  DROP TABLE "users" CASCADE;
  DROP TABLE "articles" CASCADE;
  DROP TABLE "articles_rels" CASCADE;
  DROP TABLE "_articles_v" CASCADE;
  DROP TABLE "_articles_v_rels" CASCADE;
  DROP TABLE "topics" CASCADE;
  DROP TABLE "sources" CASCADE;
  DROP TABLE "evidence" CASCADE;
  DROP TABLE "claims" CASCADE;
  DROP TABLE "claims_rels" CASCADE;
  DROP TABLE "audit_events" CASCADE;
  DROP TABLE "payload_kv" CASCADE;
  DROP TABLE "payload_locked_documents" CASCADE;
  DROP TABLE "payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload_preferences" CASCADE;
  DROP TABLE "payload_preferences_rels" CASCADE;
  DROP TABLE "payload_migrations" CASCADE;
  DROP TYPE "public"."enum_users_role";
  DROP TYPE "public"."enum_articles_division";
  DROP TYPE "public"."enum_articles_workflow_status";
  DROP TYPE "public"."enum_articles_status";
  DROP TYPE "public"."enum__articles_v_version_division";
  DROP TYPE "public"."enum__articles_v_version_workflow_status";
  DROP TYPE "public"."enum__articles_v_version_status";
  DROP TYPE "public"."enum_sources_source_type";
  DROP TYPE "public"."enum_evidence_verification_status";
  DROP TYPE "public"."enum_claims_verification_status";
  DROP TYPE "public"."enum_audit_events_outcome";`)
}
