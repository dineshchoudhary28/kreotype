import Redis from "ioredis";

declare global {
  var _redisClient: Redis | undefined;
  var _redisMemoryStorage: Map<string, { value: string; expires: number }> | undefined;
}

let redisAvailable = true;
if (!global._redisMemoryStorage) {
  global._redisMemoryStorage = new Map();
}

function getRedisClient(): Redis {
  if (global._redisClient) {
    return global._redisClient;
  }

  const url = process.env.REDIS_URL || "redis://localhost:6379";

  global._redisClient = new Redis(url, {
    maxRetriesPerRequest: 1,
    lazyConnect: true,
    connectTimeout: 1000,
    retryStrategy(times) {
      if (times > 1) {
        redisAvailable = false;
        return null;
      }
      return 500;
    },
  });

  global._redisClient.on("error", () => {
    redisAvailable = false;
  });

  global._redisClient.on("connect", () => {
    redisAvailable = true;
  });

  return global._redisClient;
}

// Memory Fallback Implementation
const memoryFallback = {
  get: async (key: string) => {
    const entry = global._redisMemoryStorage?.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expires) {
      global._redisMemoryStorage?.delete(key);
      return null;
    }
    return entry.value;
  },
  setex: async (key: string, seconds: number, value: string) => {
    global._redisMemoryStorage?.set(key, {
      value,
      expires: Date.now() + seconds * 1000,
    });
    return "OK";
  },
  del: async (key: string) => {
    global._redisMemoryStorage?.delete(key);
    return 1;
  },
  pipeline: () => ({
    zremrangebyscore: () => {},
    zadd: () => {},
    zcard: () => {},
    expire: () => {},
    exec: async () => [[null, 0], [null, 0], [null, 0]],
  }),
};

export const redis = new Proxy({} as Redis, {
  get(_target, prop) {
    if (!redisAvailable) {
      return (memoryFallback as any)[prop] || (async () => null);
    }

    try {
      const client = getRedisClient();
      const value = (client as any)[prop];
      if (typeof value === "function") {
        return async (...args: any[]) => {
          try {
            const result = await value.apply(client, args);
            // If ioredis returns null or throws, we might be disconnected
            return result;
          } catch {
            redisAvailable = false;
            return (memoryFallback as any)[prop]?.(...args) || null;
          }
        };
      }
      return value;
    } catch {
      redisAvailable = false;
      return (memoryFallback as any)[prop] || (async () => null);
    }
  },
});
