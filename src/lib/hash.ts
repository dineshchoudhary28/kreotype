import { createHash } from "crypto";
import { type CompletedEventInput } from "@/server/validators/result";

/**
 * Generates a SHA-256 hash for a given result object to be used for deduplication.
 * The hash is created from a consistent set of core result properties.
 */
export function generateResultHash(data: CompletedEventInput): string {
  const hash = createHash("sha256");
  const dataString = JSON.stringify({
    wpm: data.wpm,
    accuracy: data.accuracy,
    mode: data.mode,
    mode2: data.mode2,
    testDuration: data.testDuration,
    timestamp: data.timestamp,
  });
  hash.update(dataString);
  return hash.digest("hex");
}
