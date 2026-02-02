import Redis from "ioredis";

declare global {
  var _redisClient: Redis | undefined;
}

let redisAvailable = true;

function getRedisClient(): Redis {
  if (global._redisClient) {
    return global._redisClient;
  }

  const url = process.env.REDIS_URL;
  if (!url) {
    throw new Error("REDIS_URL environment variable is not defined");
  }

  global._redisClient = new Redis(url, {
    maxRetriesPerRequest: 1,
    lazyConnect: true,
    retryStrategy(times) {
      if (times > 3) {
        redisAvailable = false;
        return null; // stop retrying
      }
      return Math.min(times * 500, 2000);
    },
    reconnectOnError() {
      return false;
    },
  });

  global._redisClient.on("error", () => {
    // Silently mark as unavailable — prevents unhandled error crashes
    redisAvailable = false;
  });

  global._redisClient.on("connect", () => {
    redisAvailable = true;
  });

  return global._redisClient;
}

// Proxy that silently no-ops when Redis is unavailable
export const redis = new Proxy({} as Redis, {
  get(_target, prop) {
    const client = getRedisClient();

    if (!redisAvailable) {
      if (typeof prop === "string") {
        // Return a no-op pipeline that mirrors the chainable API
        if (prop === "pipeline") {
          const noopChain = new Proxy({} as Record<string, unknown>, {
            get(_, method) {
              if (method === "exec") return async () => [];
              return () => noopChain; // chainable no-ops (zadd, zcard, etc.)
            },
          });
          return () => noopChain;
        }
        // Return no-op functions for common operations when Redis is down
        if (["get", "set", "setex", "del", "expire", "zremrangebyscore", "zadd", "zcard"].includes(prop)) {
          return async () => null;
        }
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const value = (client as any)[prop];
    if (typeof value === "function") {
      return value.bind(client);
    }
    return value;
  },
});
