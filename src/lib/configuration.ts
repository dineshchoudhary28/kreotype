import { connectDB } from "@/lib/db";
import { Configuration } from "@/server/models/Configuration";
import { logError } from "@/lib/logger";

// In-memory cache for the configuration
let cachedConfig: any = null;
let lastFetchTimestamp = 0;
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

/**
 * Fetches the application configuration from the database or from an in-memory cache.
 * The cache is invalidated after a 10-minute TTL.
 *
 * @returns The application configuration object, or a default if not found/error.
 */
export async function getConfiguration() {
  const now = Date.now();

  // Return cached config if it's still valid
  if (cachedConfig && now - lastFetchTimestamp < CACHE_TTL) {
    return cachedConfig;
  }

  try {
    await connectDB();
    const config = await Configuration.findOne();

    if (config) {
      cachedConfig = config.toObject();
      lastFetchTimestamp = now;
      return cachedConfig;
    }

    // If no config in DB, return a default and don't cache
    return {
      maintenance: false,
      registrationEnabled: true,
      rateLimiting: {
        enabled: true,
        requests: 100,
        window: "1m",
      },
    };
  } catch (error) {
    logError(error, { action: "getConfiguration" });
    // In case of error, return default and don't cache
    return {
      maintenance: false,
      registrationEnabled: true,
      rateLimiting: {
        enabled: true,
        requests: 100,
        window: "1m",
      },
    };
  }
}
