import type { Db } from "mongodb";
import type { MigrationRecord } from "./types.js";

const COLLECTION = "_migrations";

export async function ensureLedger(db: Db): Promise<void> {
  const collections = await db
    .listCollections({ name: COLLECTION })
    .toArray();
  if (collections.length === 0) {
    await db.createCollection(COLLECTION);
  }
}

export async function getExecuted(db: Db): Promise<MigrationRecord[]> {
  await ensureLedger(db);
  return db
    .collection<MigrationRecord>(COLLECTION)
    .find({ direction: "up" })
    .sort({ executedAt: 1 })
    .toArray();
}

export async function getExecutedNames(db: Db): Promise<Set<string>> {
  const records = await getExecuted(db);
  return new Set(records.map((r) => r.name));
}

export async function recordMigration(
  db: Db,
  name: string,
  description: string,
  durationMs: number,
  direction: "up" | "down"
): Promise<void> {
  await ensureLedger(db);

  if (direction === "up") {
    await db.collection<MigrationRecord>(COLLECTION).insertOne({
      name,
      description,
      executedAt: new Date(),
      durationMs,
      direction,
    });
  } else {
    // On rollback, remove the "up" record for this migration
    await db
      .collection<MigrationRecord>(COLLECTION)
      .deleteMany({ name, direction: "up" });
    // Also log the down execution for audit trail
    await db.collection<MigrationRecord>(COLLECTION).insertOne({
      name,
      description,
      executedAt: new Date(),
      durationMs,
      direction: "down",
    });
  }
}
