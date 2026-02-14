import type { Migration } from "../types.js";

const BASE_CONFIGURATION = {
  maintenance: false,
  registrationEnabled: true,
  maxTestsPerDay: 0, // 0 = unlimited
  resultObjectHashEnabled: false,
  leaderboards: {
    maxResults: 100,
    cacheDurationSeconds: 300,
  },
  rateLimiting: {
    enabled: true,
  },
  dailyLeaderboards: {
    enabled: false,
    maxResults: 100,
    leaderboardExpirationTimeInDays: 1,
  },
  updatedAt: new Date(),
};

const migration: Migration = {
  name: "20260213_004_create_system_collections",
  description:
    "Create logs collection (with TTL index) and configuration collection (with seed document)",

  async up({ db, log, dryRun }) {
    // ── Logs collection ───────────────────────────────────────────
    const existingCollections = await db
      .listCollections({}, { nameOnly: true })
      .toArray();
    const collectionNames = new Set(existingCollections.map((c) => c.name));

    if (!collectionNames.has("logs")) {
      log("Creating logs collection");
      if (!dryRun) {
        await db.createCollection("logs");
      }
    } else {
      log("logs collection already exists — skipping creation");
    }

    if (!dryRun) {
      const logsCollection = db.collection("logs");

      // Index for querying recent logs
      await logsCollection.createIndex(
        { timestamp: -1 },
        { name: "idx_logs_timestamp" }
      );
      log("Created index: idx_logs_timestamp");

      // Compound index for filtered queries
      await logsCollection.createIndex(
        { type: 1, timestamp: -1 },
        { name: "idx_logs_type_timestamp" }
      );
      log("Created index: idx_logs_type_timestamp");

      // TTL index: auto-delete logs older than 30 days
      await logsCollection.createIndex(
        { timestamp: 1 },
        {
          name: "idx_logs_ttl",
          expireAfterSeconds: 30 * 24 * 60 * 60, // 30 days
        }
      );
      log("Created TTL index: idx_logs_ttl (30-day expiry)");
    } else {
      log("Would create 3 indexes on logs collection (timestamp, type+timestamp, TTL)");
    }

    // ── Configuration collection ──────────────────────────────────
    if (!collectionNames.has("configuration")) {
      log("Creating configuration collection");
      if (!dryRun) {
        await db.createCollection("configuration");
      }
    } else {
      log("configuration collection already exists — skipping creation");
    }

    if (!dryRun) {
      const configCollection = db.collection("configuration");
      const existing = await configCollection.countDocuments();

      if (existing === 0) {
        await configCollection.insertOne(BASE_CONFIGURATION);
        log("Seeded base configuration document");
      } else {
        log("Configuration document already exists — skipping seed");
      }
    } else {
      log("Would seed base configuration document");
    }
  },

  async down({ db, log, dryRun }) {
    if (dryRun) {
      log("Would drop logs and configuration collections");
      return;
    }

    const existingCollections = await db
      .listCollections({}, { nameOnly: true })
      .toArray();
    const collectionNames = new Set(existingCollections.map((c) => c.name));

    if (collectionNames.has("logs")) {
      await db.dropCollection("logs");
      log("Dropped logs collection");
    } else {
      log("logs collection does not exist — nothing to drop");
    }

    if (collectionNames.has("configuration")) {
      await db.dropCollection("configuration");
      log("Dropped configuration collection");
    } else {
      log("configuration collection does not exist — nothing to drop");
    }
  },
};

export default migration;
