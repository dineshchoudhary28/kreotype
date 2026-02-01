import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Result } from "@/server/models/Result";
import { User } from "@/server/models/User";
import { requireAuth } from "@/server/middleware/auth";
import mongoose from "mongoose";

export async function GET() {
  const authResult = await requireAuth();
  if ("error" in authResult) return authResult.error;
  const { session } = authResult;

  await connectDB();

  const userId = new mongoose.Types.ObjectId(session.user!.id);

  const [user, allTimeStats, last10Stats] = await Promise.all([
    User.findById(session.user!.id)
      .select("testsStarted testsCompleted timeTyping")
      .lean(),
    Result.aggregate([
      { $match: { userId } },
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
      { $match: { userId } },
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

  const all = allTimeStats[0] || {};
  const recent = last10Stats[0] || {};

  return NextResponse.json({
    testsStarted: user?.testsStarted ?? 0,
    testsCompleted: user?.testsCompleted ?? 0,
    timeTyping: user?.timeTyping ?? 0,
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
  });
}
