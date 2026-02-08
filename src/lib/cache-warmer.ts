/**
 * Cache Warmer for Leaderboards
 *
 * Preloads frequently accessed leaderboard data into Redis cache
 * to eliminate cold-start latency for users.
 *
 * Can be triggered via:
 * - API endpoint (manual or external cron service)
 * - Vercel Cron Jobs
 * - Background worker
 */

import { connectDB } from "./db";
import { Result } from "@/server/models/Result";
import { User } from "@/server/models/User";
import { redis } from "./redis";
import mongoose from "mongoose";

interface LeaderboardConfig {
  type: "allTime" | "daily" | "weekly";
  mode: string;
  mode2: string | number;
  page: number;
}

// Common leaderboard configurations to warm
const LEADERBOARD_CONFIGS: LeaderboardConfig[] = [
  // All-time leaderboards (most popular)
  { type: "allTime", mode: "time", mode2: 15, page: 1 },
  { type: "allTime", mode: "time", mode2: 30, page: 1 },
  { type: "allTime", mode: "time", mode2: 60, page: 1 },
  { type: "allTime", mode: "words", mode2: 10, page: 1 },
  { type: "allTime", mode: "words", mode2: 25, page: 1 },
  { type: "allTime", mode: "words", mode2: 50, page: 1 },
  // Daily leaderboards
  { type: "daily", mode: "time", mode2: 15, page: 1 },
  { type: "daily", mode: "time", mode2: 30, page: 1 },
  { type: "daily", mode: "time", mode2: 60, page: 1 },
  // Weekly leaderboards
  { type: "weekly", mode: "time", mode2: 15, page: 1 },
  { type: "weekly", mode: "time", mode2: 30, page: 1 },
];

export async function warmLeaderboardCache(): Promise<{
  success: boolean;
  warmed: number;
  failed: number;
  duration: number;
}> {
  const startTime = Date.now();
  let warmed = 0;
  let failed = 0;

  try {
    await connectDB();

    for (const config of LEADERBOARD_CONFIGS) {
      try {
        const cacheKey = buildCacheKey(config);
        const leaderboardData = await fetchLeaderboard(config);

        if (leaderboardData) {
          const ttl = config.type === "allTime" ? 300 : 120; // 5min for all-time, 2min for time-based
          await redis.setex(cacheKey, ttl, JSON.stringify(leaderboardData));
          warmed++;
        }
      } catch (error) {
        console.error(`Failed to warm cache for ${JSON.stringify(config)}:`, error);
        failed++;
      }
    }

    const duration = Date.now() - startTime;
    return { success: true, warmed, failed, duration };
  } catch (error) {
    console.error("Cache warming failed:", error);
    return {
      success: false,
      warmed,
      failed,
      duration: Date.now() - startTime,
    };
  }
}

function buildCacheKey(config: LeaderboardConfig): string {
  const { type, mode, mode2, page } = config;

  if (type === "allTime") {
    return `lb:allTime:${mode}:${mode2}:page:${page}`;
  } else if (type === "daily") {
    const now = new Date();
    const date = now.toISOString().split("T")[0];
    return `lb:daily:${mode}:${mode2}:${date}:page:${page}`;
  } else {
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    const week = weekStart.toISOString().split("T")[0];
    return `lb:weekly:${mode}:${mode2}:${week}:page:${page}`;
  }
}

async function fetchLeaderboard(config: LeaderboardConfig) {
  const { type, mode, mode2, page } = config;
  const limit = 50; // Standard leaderboard page size

  const matchStage: Record<string, unknown> = {
    mode,
    mode2: typeof mode2 === "string" && isNaN(Number(mode2)) ? mode2 : Number(mode2),
    isValid: true,
  };

  const now = new Date();
  if (type === "daily") {
    const dayStart = new Date(now);
    dayStart.setHours(0, 0, 0, 0);
    matchStage.timestamp = { $gte: dayStart };
  } else if (type === "weekly") {
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    weekStart.setHours(0, 0, 0, 0);
    matchStage.timestamp = { $gte: weekStart };
  }

  const pipeline: mongoose.PipelineStage[] = [
    { $match: matchStage },
    { $sort: { wpm: -1 as const } },
    {
      $group: {
        _id: "$userId",
        wpm: { $max: "$wpm" },
        rawWpm: { $first: "$rawWpm" },
        accuracy: { $first: "$accuracy" },
        consistency: { $first: "$consistency" },
        timestamp: { $first: "$timestamp" },
      },
    },
    { $sort: { wpm: -1 as const } },
    { $skip: (page - 1) * limit },
    { $limit: limit },
  ];

  const [entries, totalAgg] = await Promise.all([
    Result.aggregate(pipeline),
    Result.aggregate([
      { $match: matchStage },
      { $group: { _id: "$userId" } },
      { $count: "total" },
    ]),
  ]);

  const total = totalAgg[0]?.total ?? 0;

  // Populate usernames
  const userIds = entries.map((e: { _id: mongoose.Types.ObjectId }) => e._id);
  const users = await User.find({ _id: { $in: userIds } })
    .select("username image")
    .lean();
  const userMap = new Map(users.map((u) => [u._id.toString(), u]));

  const leaderboard = entries.map((e: Record<string, unknown>, i: number) => {
    const user = userMap.get((e._id as mongoose.Types.ObjectId).toString());
    return {
      rank: (page - 1) * limit + i + 1,
      userId: e._id,
      username: user?.username ?? "unknown",
      image: user?.image ?? null,
      wpm: e.wpm,
      rawWpm: e.rawWpm,
      accuracy: e.accuracy,
      consistency: e.consistency,
      timestamp: e.timestamp,
    };
  });

  return {
    leaderboard,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  };
}
