import type { Migration } from "../types.js";

const NEW_FIELDS = {
  streak: 0,
  maxStreak: 0,
  lastResultTimestamp: null,
  xp: 0,
  profileDetails: {
    bio: "",
    keyboard: "",
    socialProfiles: {},
  },
  inventory: {
    badges: [],
  },
  banned: false,
  verified: false,
  lbPersonalBests: {
    time: {},
  },
  testActivity: {},
  autoBanTimestamps: [],
  lastReultHashes: [],
} as const;

const FIELD_NAMES = Object.keys(NEW_FIELDS);

const migration: Migration = {
  name: "20260213_001_add_user_fields",
  description:
    "Add 12 missing fields to User documents (streak, xp, profileDetails, inventory, banned, verified, lbPersonalBests, testActivity, autoBanTimestamps, lastReultHashes)",

  async up({ db, log, dryRun, batchSize }) {
    const collection = db.collection("users");

    // Only target documents missing the first new field (sentinel check)
    const filter = { streak: { $exists: false } };
    const count = await collection.countDocuments(filter);

    log(`Found ${count} user documents to migrate`);

    if (count === 0 || dryRun) {
      if (dryRun && count > 0) {
        log(`Would add ${FIELD_NAMES.length} fields to ${count} user documents`);
        log(`Fields: ${FIELD_NAMES.join(", ")}`);
      }
      return;
    }

    // Process in batches using cursor-based _id pagination
    // (updateMany doesn't support limit, so we fetch IDs in batches)
    let processed = 0;
    let lastId: unknown = null;

    while (true) {
      const batchFilter: Record<string, unknown> = { streak: { $exists: false } };
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
      log(`Progress: ${processed}/${count} users updated`);
    }

    log(`Completed: added ${FIELD_NAMES.length} fields to ${processed} user documents`);
  },

  async down({ db, log, dryRun }) {
    const collection = db.collection("users");
    const count = await collection.countDocuments({
      streak: { $exists: true },
    });

    log(`Found ${count} user documents to roll back`);

    if (dryRun) {
      log(`Would remove ${FIELD_NAMES.length} fields from ${count} user documents`);
      return;
    }

    const unsetFields: Record<string, ""> = {};
    for (const field of FIELD_NAMES) {
      unsetFields[field] = "";
    }

    const result = await collection.updateMany({}, { $unset: unsetFields });
    log(`Rolled back: removed fields from ${result.modifiedCount} user documents`);
  },
};

export default migration;
