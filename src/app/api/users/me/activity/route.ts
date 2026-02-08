import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Result } from "@/server/models/Result";
import { requireAuth } from "@/server/middleware/auth";
import { redis } from "@/lib/redis";
import mongoose from "mongoose";

export async function GET() {
  const authResult = await requireAuth();
  if ("error" in authResult) return authResult.error;
  const { session } = authResult;
  const userId = session.user!.id;

  // Check Redis cache
  const cacheKey = `activity:${userId}`;
  try {
    const cached = await redis.get(cacheKey);
    if (cached) {
      return NextResponse.json({ activity: JSON.parse(cached) });
    }
  } catch {
    // Cache miss — proceed to DB
  }

  await connectDB();

  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

  const activity = await Result.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        timestamp: { $gte: oneYearAgo },
      },
    },
    {
      $group: {
        _id: {
          $dateToString: { format: "%Y-%m-%d", date: "$timestamp" },
        },
        count: { $sum: 1 },
        avgWpm: { $avg: "$wpm" },
      },
    },
    { $sort: { _id: 1 } },
    {
      $project: {
        _id: 0,
        date: "$_id",
        count: 1,
        avgWpm: { $round: ["$avgWpm", 1] },
      },
    },
  ]);

  // Cache for 5 minutes
  try {
    await redis.setex(cacheKey, 300, JSON.stringify(activity));
  } catch {
    // Non-critical — continue without caching
  }

  return NextResponse.json({ activity });
}
