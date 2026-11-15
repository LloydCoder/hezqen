import { sql } from "@payloadcms/db-postgres";
import type { MigrateDownArgs, MigrateUpArgs } from "@payloadcms/db-postgres";

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    CREATE TYPE "public"."enum_articles_correction_status" AS ENUM('none', 'open', 'resolved');
    CREATE TYPE "public"."enum__articles_v_version_correction_status" AS ENUM('none', 'open', 'resolved');

    ALTER TABLE "articles"
      ADD COLUMN "scheduled_for" timestamp(3) with time zone,
      ADD COLUMN "correction_status" "enum_articles_correction_status" DEFAULT 'none' NOT NULL,
      ADD COLUMN "correction_reason" varchar,
      ADD COLUMN "correction_public_note" varchar,
      ADD COLUMN "correction_requested_at" timestamp(3) with time zone,
      ADD COLUMN "correction_resolved_at" timestamp(3) with time zone,
      ADD COLUMN "correction_resolved_by_id" integer;

    ALTER TABLE "_articles_v"
      ADD COLUMN "version_scheduled_for" timestamp(3) with time zone,
      ADD COLUMN "version_correction_status" "enum__articles_v_version_correction_status" DEFAULT 'none',
      ADD COLUMN "version_correction_reason" varchar,
      ADD COLUMN "version_correction_public_note" varchar,
      ADD COLUMN "version_correction_requested_at" timestamp(3) with time zone,
      ADD COLUMN "version_correction_resolved_at" timestamp(3) with time zone,
      ADD COLUMN "version_correction_resolved_by_id" integer;

    ALTER TABLE "articles"
      ADD CONSTRAINT "articles_correction_resolved_by_id_users_id_fk"
      FOREIGN KEY ("correction_resolved_by_id") REFERENCES "public"."users"("id")
      ON DELETE set null ON UPDATE no action;

    ALTER TABLE "_articles_v"
      ADD CONSTRAINT "_articles_v_version_correction_resolved_by_id_users_id_fk"
      FOREIGN KEY ("version_correction_resolved_by_id") REFERENCES "public"."users"("id")
      ON DELETE set null ON UPDATE no action;

    CREATE INDEX "articles_scheduled_for_idx" ON "articles" USING btree ("scheduled_for");
    CREATE INDEX "articles_correction_status_idx" ON "articles" USING btree ("correction_status");
    CREATE INDEX "_articles_v_version_version_scheduled_for_idx" ON "_articles_v" USING btree ("version_scheduled_for");
    CREATE INDEX "_articles_v_version_version_correction_status_idx" ON "_articles_v" USING btree ("version_correction_status");
  `);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP INDEX IF EXISTS "articles_scheduled_for_idx";
    DROP INDEX IF EXISTS "articles_correction_status_idx";
    DROP INDEX IF EXISTS "_articles_v_version_version_scheduled_for_idx";
    DROP INDEX IF EXISTS "_articles_v_version_version_correction_status_idx";

    ALTER TABLE "articles"
      DROP CONSTRAINT IF EXISTS "articles_correction_resolved_by_id_users_id_fk";
    ALTER TABLE "_articles_v"
      DROP CONSTRAINT IF EXISTS "_articles_v_version_correction_resolved_by_id_users_id_fk";

    ALTER TABLE "articles"
      DROP COLUMN IF EXISTS "scheduled_for",
      DROP COLUMN IF EXISTS "correction_status",
      DROP COLUMN IF EXISTS "correction_reason",
      DROP COLUMN IF EXISTS "correction_public_note",
      DROP COLUMN IF EXISTS "correction_requested_at",
      DROP COLUMN IF EXISTS "correction_resolved_at",
      DROP COLUMN IF EXISTS "correction_resolved_by_id";

    ALTER TABLE "_articles_v"
      DROP COLUMN IF EXISTS "version_scheduled_for",
      DROP COLUMN IF EXISTS "version_correction_status",
      DROP COLUMN IF EXISTS "version_correction_reason",
      DROP COLUMN IF EXISTS "version_correction_public_note",
      DROP COLUMN IF EXISTS "version_correction_requested_at",
      DROP COLUMN IF EXISTS "version_correction_resolved_at",
      DROP COLUMN IF EXISTS "version_correction_resolved_by_id";

    DROP TYPE IF EXISTS "public"."enum_articles_correction_status";
    DROP TYPE IF EXISTS "public"."enum__articles_v_version_correction_status";
  `);
}
