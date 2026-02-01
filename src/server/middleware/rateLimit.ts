import { NextResponse, type NextRequest } from "next/server";
import { redis } from "@/lib/redis";

interface RateLimitConfig {
  maxRequests: number;
  windowSeconds: number;
}

const RATE_LIMITS: Record<string, RateLimitConfig> = {
  register: { maxRequests: 5, windowSeconds: 3600 },
  login: { maxRequests: 10, windowSeconds: 60 },
  resultSubmit: { maxRequests: 30, windowSeconds: 60 },
  general: { maxRequests: 60, windowSeconds: 60 },
};

function getClientIp(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

export async function rateLimit(
  request: NextRequest,
  key: string,
  identifier?: string
): Promise<NextResponse | null> {
  const config = RATE_LIMITS[key] ?? RATE_LIMITS.general!;
  const id = identifier || getClientIp(request);
  const redisKey = `ratelimit:${id}:${key}`;
  const now = Date.now();
  const windowStart = now - config.windowSeconds * 1000;

  try {
    const pipeline = redis.pipeline();
    pipeline.zremrangebyscore(redisKey, 0, windowStart);
    pipeline.zadd(redisKey, now, `${now}`);
    pipeline.zcard(redisKey);
    pipeline.expire(redisKey, config.windowSeconds);
    const results = await pipeline.exec();

    const count = results?.[2]?.[1] as number;
    if (count > config.maxRequests) {
      return NextResponse.json(
        { error: "Too many requests" },
        { status: 429, headers: { "Retry-After": String(config.windowSeconds) } }
      );
    }
  } catch {
    // If Redis is down, allow the request through
  }

  return null;
}
