import { readdir, writeFile } from "node:fs/promises";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import mongoose from "mongoose";
import { connectDB, getDb } from "../src/lib/db.js";
import * as ledger from "./ledger.js";
import * as log from "./logger.js";
import { generateTemplate } from "./template.js";
import type { Migration, MigrationContext } from "./types.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const SCRIPTS_DIR = resolve(__dirname, "scripts");
const BATCH_SIZE = 500;

// ─── Migration Discovery ────────────────────────────────────────────

async function discoverMigrations(): Promise<Migration[]> {
  let files: string[];
  try {
    files = await readdir(SCRIPTS_DIR);
  } catch {
    log.warn(`No migrations/scripts/ directory found at ${SCRIPTS_DIR}`);
    return [];
  }

  const tsFiles = files
    .filter((f) => f.endsWith(".ts") && !f.endsWith(".d.ts"))
    .sort();

  const migrations: Migration[] = [];
  for (const file of tsFiles) {
    const mod = await import(join(SCRIPTS_DIR, file));
    const migration: Migration = mod.default;
    if (!migration?.name || !migration?.up || !migration?.down) {
      log.warn(`Skipping ${file}: missing name, up(), or down()`);
      continue;
    }
    migrations.push(migration);
  }

  return migrations;
}

// ─── Commands ───────────────────────────────────────────────────────

async function runUp(dryRun: boolean): Promise<void> {
  await connectDB();
  const db = await getDb();
  if (!db) throw new Error("Failed to get database instance");

  const migrations = await discoverMigrations();
  const executed = await ledger.getExecutedNames(db);

  const pending = migrations.filter((m) => !executed.has(m.name));

  if (pending.length === 0) {
    log.success("All migrations are up to date.");
    return;
  }

  log.info(
    `Found ${pending.length} pending migration${pending.length > 1 ? "s" : ""}`
  );

  for (const migration of pending) {
    log.migrationStart(migration.name, dryRun);
    log.info(migration.description);

    const ctx: MigrationContext = {
      db,
      mongoose,
      log: (msg) => log.info(`  ${msg}`),
      dryRun,
      batchSize: BATCH_SIZE,
    };

    const start = Date.now();
    try {
      await migration.up(ctx);
      const durationMs = Date.now() - start;

      if (!dryRun) {
        await ledger.recordMigration(
          db,
          migration.name,
          migration.description,
          durationMs,
          "up"
        );
      }

      log.migrationEnd(migration.name, durationMs);
    } catch (err) {
      const durationMs = Date.now() - start;
      log.error(
        `Migration ${migration.name} failed after ${durationMs}ms`
      );
      log.error(err instanceof Error ? err.message : String(err));
      process.exitCode = 1;
      return;
    }
  }

  if (dryRun) {
    log.warn("Dry run complete — no changes were applied.");
  } else {
    log.success(`Applied ${pending.length} migration(s) successfully.`);
  }
}

async function runDown(): Promise<void> {
  await connectDB();
  const db = await getDb();
  if (!db) throw new Error("Failed to get database instance");

  const migrations = await discoverMigrations();
  const executedRecords = await ledger.getExecuted(db);

  if (executedRecords.length === 0) {
    log.warn("No migrations to roll back.");
    return;
  }

  // Roll back the most recently applied migration
  const lastRecord = executedRecords[executedRecords.length - 1];
  const migration = migrations.find((m) => m.name === lastRecord.name);

  if (!migration) {
    log.error(
      `Migration file for "${lastRecord.name}" not found in scripts/`
    );
    process.exitCode = 1;
    return;
  }

  log.migrationStart(`Rolling back: ${migration.name}`, false);
  log.info(migration.description);

  const ctx: MigrationContext = {
    db,
    mongoose,
    log: (msg) => log.info(`  ${msg}`),
    dryRun: false,
    batchSize: BATCH_SIZE,
  };

  const start = Date.now();
  try {
    await migration.down(ctx);
    const durationMs = Date.now() - start;

    await ledger.recordMigration(
      db,
      migration.name,
      migration.description,
      durationMs,
      "down"
    );

    log.migrationEnd(`Rolled back: ${migration.name}`, durationMs);
  } catch (err) {
    const durationMs = Date.now() - start;
    log.error(
      `Rollback of ${migration.name} failed after ${durationMs}ms`
    );
    log.error(err instanceof Error ? err.message : String(err));
    process.exitCode = 1;
  }
}

async function runStatus(): Promise<void> {
  await connectDB();
  const db = await getDb();
  if (!db) throw new Error("Failed to get database instance");

  const migrations = await discoverMigrations();
  const executedRecords = await ledger.getExecuted(db);
  const executedMap = new Map(
    executedRecords.map((r) => [r.name, r])
  );

  const rows = migrations.map((m) => {
    const record = executedMap.get(m.name);
    return {
      name: m.name,
      status: record ? "applied" : "pending",
      executedAt: record?.executedAt
        ? new Date(record.executedAt).toISOString()
        : undefined,
    };
  });

  if (rows.length === 0) {
    log.info("No migration files found in migrations/scripts/");
    return;
  }

  log.table(rows);

  const applied = rows.filter((r) => r.status === "applied").length;
  const pending = rows.length - applied;
  log.info(`Total: ${rows.length} | Applied: ${applied} | Pending: ${pending}`);
}

async function runCreate(nameArg: string): Promise<void> {
  if (!nameArg) {
    log.error("Usage: migrate:create <name>");
    log.info("  Example: pnpm migrate:create add_xp_system");
    process.exitCode = 1;
    return;
  }

  // Read existing files to determine next sequence number
  let files: string[] = [];
  try {
    files = (await readdir(SCRIPTS_DIR))
      .filter((f) => f.endsWith(".ts"))
      .sort();
  } catch {
    // scripts dir doesn't exist yet, will be created
  }

  const today = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const existingNumbers = files.map((f) => {
    const match = f.match(/^\d{8}_(\d{3})_/);
    return match ? parseInt(match[1], 10) : 0;
  });
  const nextNumber = Math.max(0, ...existingNumbers) + 1;
  const seq = String(nextNumber).padStart(3, "0");
  const fileName = `${today}_${seq}_${nameArg}.ts`;
  const filePath = join(SCRIPTS_DIR, fileName);

  const content = generateTemplate(`${today}_${seq}_${nameArg}`);
  await writeFile(filePath, content, "utf-8");

  log.success(`Created: migrations/scripts/${fileName}`);
}

// ─── CLI Entry Point ────────────────────────────────────────────────

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const command = args[0];
  const dryRun = args.includes("--dry-run");

  try {
    switch (command) {
      case "up":
        await runUp(dryRun);
        break;
      case "down":
        await runDown();
        break;
      case "status":
        await runStatus();
        break;
      case "create":
        await runCreate(args[1]);
        break;
      default:
        console.log(`
Usage: tsx migrations/runner.ts <command> [options]

Commands:
  up              Run all pending migrations
  down            Roll back the last applied migration
  status          Show migration status
  create <name>   Create a new migration file

Options:
  --dry-run       Preview changes without applying (up only)
`);
        process.exitCode = 1;
    }
  } finally {
    await mongoose.disconnect();
  }
}

// Graceful shutdown on SIGINT
let shuttingDown = false;
process.on("SIGINT", () => {
  if (shuttingDown) {
    process.exit(1);
  }
  shuttingDown = true;
  log.warn("\nReceived SIGINT — finishing current operation...");
  // The finally block in main() will handle disconnect
});

main().catch((err) => {
  log.error(err instanceof Error ? err.message : String(err));
  process.exit(1);
});
