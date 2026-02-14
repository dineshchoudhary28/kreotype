import type { Db } from "mongodb";
import type mongoose from "mongoose";

export interface Migration {
  name: string;
  description: string;
  up: (context: MigrationContext) => Promise<void>;
  down: (context: MigrationContext) => Promise<void>;
}

export interface MigrationContext {
  db: Db;
  mongoose: typeof mongoose;
  log: (msg: string) => void;
  dryRun: boolean;
  batchSize: number;
}

export interface MigrationRecord {
  name: string;
  description: string;
  executedAt: Date;
  durationMs: number;
  direction: "up" | "down";
}
