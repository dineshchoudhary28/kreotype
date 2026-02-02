import { NextResponse, type NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { Result } from "@/server/models/Result";
import { User, type IPersonalBest } from "@/server/models/User";
import { completedEventSchema } from "@/server/validators/result";
import { requireAuth } from "@/server/middleware/auth";
import { rateLimit } from "@/server/middleware/rateLimit";
import { evaluateBadges, buildEarnedBadgeIds } from "@/core/badge-engine";

export async function POST(request: NextRequest) {
  const authResult = await requireAuth();
  if ("error" in authResult) return authResult.error;
  const { session } = authResult;
  const userId = session.user!.id;

  const limited = await rateLimit(request, "resultSubmit", userId);
  if (limited) return limited;

  const body = await request.json();
  const parsed = completedEventSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.issues },
      { status: 400 }
    );
  }

  const data = parsed.data;

  await connectDB();

  // Check for PB
  const pbKey = `${data.mode}|${data.mode2}`;
  const user = await User.findById(userId);
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const currentPb = user.personalBests.get(pbKey);
  const isPb = data.validation.isValid && (!currentPb || data.wpm > currentPb.wpm);

  const result = await Result.create({
    userId,
    wpm: data.wpm,
    rawWpm: data.rawWpm,
    accuracy: data.accuracy,
    consistency: data.consistency,
    keyConsistency: data.keyConsistency,
    mode: data.mode,
    mode2: data.mode2,
    testDuration: data.testDuration,
    afkDuration: data.afkDuration,
    language: data.language,
    difficulty: data.difficulty,
    punctuation: data.punctuation,
    numbers: data.numbers,
    blindMode: data.blindMode,
    charStats: data.charStats,
    wpmHistory: data.wpmHistory,
    rawHistory: data.rawHistory,
    burstHistory: data.burstHistory,
    errorHistory: data.errorHistory,
    keypressTimings: data.keypressTimings,
    isValid: data.validation.isValid,
    invalidReasons: data.validation.invalidReasons,
    tags: data.tags ?? [],
    isPb,
    timestamp: new Date(data.timestamp),
  });

  // Update user stats (only PBs and badges — testsCompleted/timeTyping are computed from Results)
  const updates: Record<string, unknown> = {};

  if (isPb) {
    const pb: IPersonalBest = {
      wpm: data.wpm,
      rawWpm: data.rawWpm,
      accuracy: data.accuracy,
      consistency: data.consistency,
      timestamp: new Date(data.timestamp),
    };
    updates.$set = { [`personalBests.${pbKey}`]: pb };
  }

  // Evaluate badges — compute testsCompleted from Results (source of truth)
  const [recentResults, totalResults] = await Promise.all([
    Result.find({ userId })
      .sort({ timestamp: -1 })
      .limit(30)
      .select("timestamp")
      .lean(),
    Result.countDocuments({ userId }),
  ]);

  const recentTestDates = recentResults.map((r) =>
    r.timestamp.toISOString().slice(0, 10)
  );

  const newBadgeIds = evaluateBadges({
    wpm: data.wpm,
    accuracy: data.accuracy,
    consistency: data.consistency,
    timestamp: new Date(data.timestamp),
    testsCompleted: totalResults,
    earnedBadgeIds: buildEarnedBadgeIds(user.badges ?? []),
    recentTestDates,
  });

  if (newBadgeIds.length > 0) {
    const now = new Date();
    const badgeEntries = newBadgeIds.map((badgeId) => ({
      badgeId,
      earnedAt: now,
    }));
    updates.$push = { badges: { $each: badgeEntries } };
  }

  // Only update if there's something to write (PBs or badges)
  if (Object.keys(updates).length > 0) {
    await User.findByIdAndUpdate(userId, updates);
  }

  return NextResponse.json({
    message: "Result saved",
    resultId: result._id,
    isPb,
    newBadges: newBadgeIds,
  });
}

export async function GET(request: NextRequest) {
  const authResult = await requireAuth();
  if ("error" in authResult) return authResult.error;
  const { session } = authResult;

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "25")));
  const mode = searchParams.get("mode");

  await connectDB();

  const filter: Record<string, unknown> = { userId: session.user!.id };
  if (mode) filter.mode = mode;

  const [results, total] = await Promise.all([
    Result.find(filter)
      .sort({ timestamp: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Result.countDocuments(filter),
  ]);

  return NextResponse.json({
    results,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
}
