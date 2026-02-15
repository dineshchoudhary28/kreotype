import { NextResponse, type NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/server/models/User";
import { Result } from "@/server/models/Result";
import { profileQuerySchema } from "@/server/validators/profile";
import { rateLimit } from "@/server/middleware/rateLimit";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  // Rate limit by IP to prevent scraping/enumeration
  const limited = await rateLimit(request, "publicProfile");
  if (limited) return limited;

  const { username } = await params;
  const { searchParams } = new URL(request.url);

  const query = profileQuerySchema.safeParse({
    include: searchParams.get("include") ?? undefined,
  });

  const includes = query.success ? (query.data.include ?? []) : [];

  await connectDB();
  const user = await User.findOne({ username })
    .select(
      "username image testsStarted personalBests badges createdAt profileDetails streak maxStreak xp inventory"
    )
    .lean();

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Compute testsCompleted and timeTyping from Results (source of truth)
  const [countStats] = await Result.aggregate([
    { $match: { userId: user._id } },
    {
      $group: {
        _id: null,
        testsCompleted: { $sum: 1 },
        timeTyping: { $sum: "$testDuration" },
      },
    },
  ]);

  const userWithStats = {
    ...user,
    testsCompleted: countStats?.testsCompleted ?? 0,
    timeTyping: countStats?.timeTyping ?? 0,
    streak: user.streak ?? 0,
    maxStreak: user.maxStreak ?? 0,
    xp: user.xp ?? 0,
    badges: user.inventory?.badges ?? [],
  };

  const response: Record<string, unknown> = { user: userWithStats };

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
