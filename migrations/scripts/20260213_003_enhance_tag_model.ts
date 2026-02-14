import type { Migration } from "../types.js";

const migration: Migration = {
  name: "20260213_003_enhance_tag_model",
  description:
    "Add personalBests Map field to Tag documents (mode-specific personal bests alongside existing scalar personalBest)",

  async up({ db, log, dryRun }) {
    const collection = db.collection("tags");

    const filter = { personalBests: { $exists: false } };
    const count = await collection.countDocuments(filter);

    log(`Found ${count} tag documents to migrate`);

    if (count === 0 || dryRun) {
      if (dryRun && count > 0) {
        log(`Would add personalBests field to ${count} tag documents`);
      }
      return;
    }

    // Tags collection is typically small, single updateMany is fine
    const result = await collection.updateMany(
      filter,
      { $set: { personalBests: {} } }
    );

    log(`Completed: added personalBests to ${result.modifiedCount} tag documents`);
  },

  async down({ db, log, dryRun }) {
    const collection = db.collection("tags");
    const count = await collection.countDocuments({
      personalBests: { $exists: true },
    });

    log(`Found ${count} tag documents to roll back`);

    if (dryRun) {
      log(`Would remove personalBests from ${count} tag documents`);
      return;
    }

    const result = await collection.updateMany(
      {},
      { $unset: { personalBests: "" } }
    );
    log(`Rolled back: removed personalBests from ${result.modifiedCount} tag documents`);
  },
};

export default migration;
