import { NextResponse, type NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { Result } from "@/server/models/Result";
import { User } from "@/server/models/User";
import { leaderboardQuerySchema } from "@/server/validators/leaderboard";
import { redis } from "@/lib/redis";
import { auth } from "@/lib/auth";
import mongoose from "mongoose";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const parsed = leaderboardQuerySchema.safeParse(Object.fromEntries(searchParams));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid query", details: parsed.error.issues },
      { status: 400 }
    );
  }

  const { type, mode, mode2, page, limit } = parsed.data;

  // Build cache key
  let cacheKey: string;
  let cacheTtl: number;
  const now = new Date();

  if (type === "allTime") {
    cacheKey = `lb:allTime:${mode}:${mode2}:page:${page}`;
    cacheTtl = 300;
  } else if (type === "daily") {
    const date = now.toISOString().split("T")[0];
    cacheKey = `lb:daily:${mode}:${mode2}:${date}:page:${page}`;
    cacheTtl = 120;
  } else {
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    const week = weekStart.toISOString().split("T")[0];
    cacheKey = `lb:weekly:${mode}:${mode2}:${week}:page:${page}`;
    cacheTtl = 120;
  }

  // Check cache
  try {
    const cached = await redis.get(cacheKey);
    if (cached) {
      const data = JSON.parse(cached);
      // Still need to compute user rank if authed
      const session = await auth();
      if (session?.user?.id) {
        data.userRank = await getUserRank(session.user!.id, mode, mode2, type);
      }
      return NextResponse.json(data);
    }
  } catch {
    // Cache miss or Redis down
  }

  await connectDB();

  // Build time filter
  const matchStage: Record<string, unknown> = {
    mode,
    mode2: isNaN(Number(mode2)) ? mode2 : Number(mode2),
    isValid: true,
  };

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

  const responseData = {
    leaderboard,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  };

  // Cache result
  try {
    await redis.setex(cacheKey, cacheTtl, JSON.stringify(responseData));
  } catch {
    // Redis down, continue without caching
  }

  // Add user rank if authenticated
  const session = await auth();
  if (session?.user?.id) {
    (responseData as Record<string, unknown>).userRank = await getUserRank(
      session.user!.id,
      mode,
      mode2,
      type
    );
  }

  return NextResponse.json(responseData);
}

async function getUserRank(
  userId: string,
  mode: string,
  mode2: string,
  type: string
): Promise<number | null> {
  const cacheKey = `lb:rank:${userId}:${mode}:${mode2}`;

  try {
    const cached = await redis.get(cacheKey);
    if (cached) return parseInt(cached);
  } catch {
    // Continue
  }

  const matchStage: Record<string, unknown> = {
    mode,
    mode2: isNaN(Number(mode2)) ? mode2 : Number(mode2),
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

  const userBest = await Result.findOne({
    ...matchStage,
    userId: new mongoose.Types.ObjectId(userId),
  })
    .sort({ wpm: -1 })
    .select("wpm")
    .lean();

  if (!userBest) return null;

  const higherCount = await Result.aggregate([
    { $match: matchStage },
    { $group: { _id: "$userId", maxWpm: { $max: "$wpm" } } },
    { $match: { maxWpm: { $gt: userBest.wpm } } },
    { $count: "count" },
  ]);

  const rank = (higherCount[0]?.count ?? 0) + 1;

  try {
    await redis.setex(cacheKey, 300, String(rank));
  } catch {
    // Continue
  }

  return rank;
}
