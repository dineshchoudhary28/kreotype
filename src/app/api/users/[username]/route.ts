import { NextResponse, type NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/server/models/User";
import { Result } from "@/server/models/Result";
import { profileQuerySchema } from "@/server/validators/profile";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  const { username } = await params;
  const { searchParams } = new URL(request.url);

  const query = profileQuerySchema.safeParse({
    include: searchParams.get("include") ?? undefined,
  });

  const includes = query.success ? (query.data.include ?? []) : [];

  await connectDB();
  const user = await User.findOne({ username })
    .select(
      "username image testsStarted testsCompleted timeTyping personalBests badges createdAt"
    )
    .lean();

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const response: Record<string, unknown> = { user };

  if (includes.includes("activity")) {
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    const activity = await Result.aggregate([
      {
        $match: {
          userId: user._id,
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

    response.activity = activity;
  }

  if (includes.includes("recentTests")) {
    const recentTests = await Result.find({ userId: user._id })
      .sort({ timestamp: -1 })
      .limit(10)
      .select("wpm accuracy mode mode2 timestamp")
      .lean();

    response.recentTests = recentTests;
  }

  return NextResponse.json(response);
}
