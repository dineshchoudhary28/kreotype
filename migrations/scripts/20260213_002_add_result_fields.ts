import type { Migration } from "../types.js";

const NEW_FIELDS = {
  funbox: [],
  stopOnLetter: false,
  hash: null,
} as const;

const FIELD_NAMES = Object.keys(NEW_FIELDS);

const migration: Migration = {
  name: "20260213_002_add_result_fields",
  description:
    "Add 3 missing fields to Result documents (funbox, stopOnLetter, hash)",

  async up({ db, log, dryRun, batchSize }) {
    const collection = db.collection("results");

    const filter = { funbox: { $exists: false } };
    const count = await collection.countDocuments(filter);

    log(`Found ${count} result documents to migrate`);

    if (count === 0 || dryRun) {
      if (dryRun && count > 0) {
        log(`Would add ${FIELD_NAMES.length} fields to ${count} result documents`);
        log(`Fields: ${FIELD_NAMES.join(", ")}`);
      }
      return;
    }

    let processed = 0;
    let lastId: unknown = null;

    while (true) {
      const batchFilter: Record<string, unknown> = { funbox: { $exists: false } };
      if (lastId !== null) {
        batchFilter._id = { $gt: lastId };
      }

      const batch = await collection
        .find(batchFilter, { projection: { _id: 1 } })
        .sort({ _id: 1 })
        .limit(batchSize)
        .toArray();

      if (batch.length === 0) break;

      const batchIds = batch.map((doc) => doc._id);
      lastId = batchIds[batchIds.length - 1];

      await collection.updateMany(
        { _id: { $in: batchIds } },
        { $set: { ...NEW_FIELDS } }
      );

      processed += batch.length;
      log(`Progress: ${processed}/${count} results updated`);
    }

    log(`Completed: added ${FIELD_NAMES.length} fields to ${processed} result documents`);
  },

  async down({ db, log, dryRun }) {
    const collection = db.collection("results");
    const count = await collection.countDocuments({
      funbox: { $exists: true },
    });

    log(`Found ${count} result documents to roll back`);

    if (dryRun) {
      log(`Would remove ${FIELD_NAMES.length} fields from ${count} result documents`);
      return;
    }

    const unsetFields: Record<string, ""> = {};
    for (const field of FIELD_NAMES) {
      unsetFields[field] = "";
    }

    const result = await collection.updateMany({}, { $unset: unsetFields });
    log(`Rolled back: removed fields from ${result.modifiedCount} result documents`);
  },
};

export default migration;
