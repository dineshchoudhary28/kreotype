import { NextResponse, type NextRequest } from "next/server";
import { warmLeaderboardCache } from "@/lib/cache-warmer";
import { logError } from "@/lib/logger";

export const dynamic = "force-dynamic";

/**
 * Cache Warming Endpoint
 *
 * Triggers leaderboard cache warming to eliminate cold-start latency.
 *
 * Usage:
 * - Manual: GET /api/admin/warm-cache
 * - System Cron: called every 5 minutes via /etc/cron.d/kreotype-cache
 *
 * Security:
 * - Protected by CRON_SECRET environment variable
 * - Only accessible with valid secret
 */

export async function GET(request: NextRequest) {
  // Security: Verify cron secret
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  // If CRON_SECRET is set, require authorization
  if (cronSecret) {
    if (!authHeader || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
  } else if (process.env.NODE_ENV === "production") {
    // In production, CRON_SECRET is mandatory — deny access
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const result = await warmLeaderboardCache();

    return NextResponse.json({
      message: "Cache warming completed",
      ...result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logError(error, { endpoint: "/api/admin/warm-cache", action: "GET" });
    return NextResponse.json(
      { error: "Cache warming failed" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  return GET(request);
}
