import Redis from "ioredis";

declare global {
  var _redisClient: Redis | undefined;
}

function getRedisClient(): Redis {
  if (global._redisClient) {
    return global._redisClient;
  }

  const url = process.env.REDIS_URL;
  if (!url) {
    throw new Error("REDIS_URL environment variable is not defined");
  }

  global._redisClient = new Redis(url, {
    maxRetriesPerRequest: 3,
    lazyConnect: true,
  });

  return global._redisClient;
}

export const redis = new Proxy({} as Redis, {
  get(_target, prop) {
    const client = getRedisClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const value = (client as any)[prop];
    if (typeof value === "function") {
      return value.bind(client);
    }
    return value;
  },
});
