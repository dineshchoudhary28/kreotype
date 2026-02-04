import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/server/models/User";
import { Result } from "@/server/models/Result";
import { requireAuth } from "@/server/middleware/auth";
import mongoose from "mongoose";

export async function GET() {
  const authResult = await requireAuth();
  if ("error" in authResult) return authResult.error;
  const { session } = authResult;

  await connectDB();
  const user = await User.findById(session.user!.id).select("friends").lean();
  if (!user || user.friends.length === 0) {
    return NextResponse.json({ friends: [] });
  }

  const friends = await User.find({ _id: { $in: user.friends } })
    .select("username image personalBests createdAt")
    .lean();

  // Compute stats from Results for each friend
  const friendStats = await Result.aggregate([
    { $match: { userId: { $in: user.friends } } },
    {
      $group: {
        _id: "$userId",
        testsCompleted: { $sum: 1 },
        timeTyping: { $sum: "$testDuration" },
      },
    },
  ]);

  const statsMap = new Map(
    friendStats.map(
      (s: { _id: mongoose.Types.ObjectId; testsCompleted: number; timeTyping: number }) => [
        s._id.toString(),
        { testsCompleted: s.testsCompleted, timeTyping: s.timeTyping },
      ]
    )
  );

  const enrichedFriends = friends.map((f) => ({
    ...f,
    testsCompleted: statsMap.get(f._id.toString())?.testsCompleted ?? 0,
    timeTyping: statsMap.get(f._id.toString())?.timeTyping ?? 0,
  }));

  return NextResponse.json({ friends: enrichedFriends });
}
