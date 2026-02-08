import { NextResponse, type NextRequest } from "next/server";
import { warmLeaderboardCache } from "@/lib/cache-warmer";

/**
 * Cache Warming Endpoint
 *
 * Triggers leaderboard cache warming to eliminate cold-start latency.
 *
 * Usage:
 * - Manual: GET /api/admin/warm-cache
 * - Vercel Cron: Add to vercel.json
 * - External Cron: cURL this endpoint every 5 minutes
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
  } else {
    // In development, allow without auth but warn
    console.warn("⚠️  CRON_SECRET not set - cache warming endpoint is unprotected!");
  }

  try {
    const result = await warmLeaderboardCache();

    return NextResponse.json({
      message: "Cache warming completed",
      ...result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Cache warming error:", error);
    return NextResponse.json(
      {
        error: "Cache warming failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// Support POST as well for Vercel Cron compatibility
export async function POST(request: NextRequest) {
  return GET(request);
}
