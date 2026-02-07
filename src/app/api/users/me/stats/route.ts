import { NextResponse, type NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { Result } from "@/server/models/Result";
import { User } from "@/server/models/User";
import { requireAuth } from "@/server/middleware/auth";
import mongoose from "mongoose";
import { corsHeaders, handleCorsOptions } from "@/server/middleware/cors";
import { redis } from "@/lib/redis";

export async function OPTIONS(request: NextRequest) {
  return handleCorsOptions(request) || NextResponse.json({});
}

export async function GET(request: NextRequest) {
  const authResult = await requireAuth();
  if ("error" in authResult) return authResult.error;
  const { session } = authResult;

  const userId = session.user!.id;
  const cacheKey = `stats:${userId}`;

  // Check cache
  try {
    const cached = await redis.get(cacheKey);
    if (cached) {
      return NextResponse.json(JSON.parse(cached), {
        headers: { ...corsHeaders(request), "Cache-Control": "private, max-age=60" },
      });
    }
  } catch {
    // Continue to compute
  }

  await connectDB();

  const userIdObj = new mongoose.Types.ObjectId(userId);

  // Compute testsCompleted and timeTyping from Results (source of truth)
  // Only testsStarted lives on User (cannot be derived from completed results)
  const [user, countStats, allTimeStats, last10Stats] = await Promise.all([
    User.findById(userId)
      .select("testsStarted")
      .lean(),
    Result.aggregate([
      { $match: { userId: userIdObj } },
      {
        $group: {
          _id: null,
          testsCompleted: { $sum: 1 },
          timeTyping: { $sum: "$testDuration" },
        },
      },
    ]),
    Result.aggregate([
      { $match: { userId: userIdObj } },
      {
        $group: {
          _id: null,
          highestWpm: { $max: "$wpm" },
          avgWpm: { $avg: "$wpm" },
          highestRawWpm: { $max: "$rawWpm" },
          avgRawWpm: { $avg: "$rawWpm" },
          highestAccuracy: { $max: "$accuracy" },
          avgAccuracy: { $avg: "$accuracy" },
          highestConsistency: { $max: "$consistency" },
          avgConsistency: { $avg: "$consistency" },
        },
      },
    ]),
    Result.aggregate([
      { $match: { userId: userIdObj } },
      { $sort: { timestamp: -1 } },
      { $limit: 10 },
      {
        $group: {
          _id: null,
          avgWpmLast10: { $avg: "$wpm" },
          avgRawWpmLast10: { $avg: "$rawWpm" },
          avgAccuracyLast10: { $avg: "$accuracy" },
          avgConsistencyLast10: { $avg: "$consistency" },
        },
      },
    ]),
  ]);

  const counts = countStats[0] || { testsCompleted: 0, timeTyping: 0 };
  const all = allTimeStats[0] || {};
  const recent = last10Stats[0] || {};

  const stats = {
    testsStarted: user?.testsStarted ?? 0,
    testsCompleted: counts.testsCompleted,
    timeTyping: counts.timeTyping,
    highestWpm: all.highestWpm ?? 0,
    avgWpm: Math.round((all.avgWpm ?? 0) * 100) / 100,
    avgWpmLast10: Math.round((recent.avgWpmLast10 ?? 0) * 100) / 100,
    highestRawWpm: all.highestRawWpm ?? 0,
    avgRawWpm: Math.round((all.avgRawWpm ?? 0) * 100) / 100,
    avgRawWpmLast10: Math.round((recent.avgRawWpmLast10 ?? 0) * 100) / 100,
    highestAccuracy: all.highestAccuracy ?? 0,
    avgAccuracy: Math.round((all.avgAccuracy ?? 0) * 100) / 100,
    avgAccuracyLast10: Math.round((recent.avgAccuracyLast10 ?? 0) * 100) / 100,
    highestConsistency: all.highestConsistency ?? 0,
    avgConsistency: Math.round((all.avgConsistency ?? 0) * 100) / 100,
    avgConsistencyLast10: Math.round((recent.avgConsistencyLast10 ?? 0) * 100) / 100,
  };

  // Cache the result
  try {
    await redis.set(cacheKey, JSON.stringify(stats), { ex: 3600 }); // Cache for 1 hour
  } catch {
    // Fail silently if cache write fails
  }

  console.log({
    userId,
    counts,
    all,
    recent,
  });

  return NextResponse.json(
    stats,
    {
      headers: { ...corsHeaders(request), "Cache-control": "private, max-age=60" },
    }
  );
}
