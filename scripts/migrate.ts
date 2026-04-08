/**
 * Standalone migration runner — runs all pending Drizzle migrations.
 *
 * Usage (local):
 *   npx tsx scripts/migrate.ts
 *
 * Usage (production / Docker):
 *   node -e "require('./scripts/migrate.js')"   ← after ts compile
 *   — OR — use the npm script:
 *   npm run db:migrate
 */

import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Pool } from "pg";
import path from "path";

const url = process.env.DATABASE_URL;

if (!url) {
  console.error("❌  DATABASE_URL is not set.");
  process.exit(1);
}

async function runMigrations() {
  const pool = new Pool({ connectionString: url! });

  try {
    const db = drizzle(pool);
    console.log("🔄  Running database migrations…");

    await migrate(db, {
      migrationsFolder: path.join(process.cwd(), "drizzle"),
    });

    console.log("✅  Migrations applied successfully.");
  } catch (err) {
    console.error("❌  Migration failed:", err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigrations();
