import { NextResponse, type NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { Result } from "@/server/models/Result";
import { User, type IPersonalBest } from "@/server/models/User";
import { Tag } from "@/server/models/Tag";
import { completedEventSchema } from "@/server/validators/result";
import { resultsQuerySchema } from "@/server/validators/query";
import { requireAuth } from "@/server/middleware/auth";
import { rateLimit } from "@/server/middleware/rateLimit";
import { evaluateBadges, buildEarnedBadgeIds } from "@/core/badge-engine";
import { corsHeaders, handleCorsOptions } from "@/server/middleware/cors";
import { redis } from "@/lib/redis";
import { logError } from "@/lib/logger";
import mongoose from "mongoose";
import { randomUUID } from "crypto";

export async function OPTIONS(request: NextRequest) {
  return handleCorsOptions(request) || NextResponse.json({});
}

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
      { status: 400, headers: corsHeaders(request) }
    );
  }

  const data = parsed.data;

  await connectDB();

  // Note: Transactions removed for development compatibility
  // In production with replica sets, re-enable transactions for atomicity
  try {
    // Check for PB
    const pbKey = `${data.mode}|${data.mode2}`;
    const user = await User.findById(userId).select("username personalBests");
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404, headers: corsHeaders(request) }
      );
    }

    const currentPb = user.personalBests.get(pbKey);
    const isPb = data.validation.isValid && (!currentPb || data.wpm > currentPb.wpm);

    // Validate tag ownership
    const tags = data.tags ?? [];
    if (tags.length > 0) {
      const userTags = await Tag.find({
        userId: new mongoose.Types.ObjectId(userId),
        _id: { $in: tags.map(id => new mongoose.Types.ObjectId(id)) }
      });

      if (userTags.length !== tags.length) {
        return NextResponse.json(
          { error: "Some tags do not belong to user" },
          { status: 403, headers: corsHeaders(request) }
        );
      }
    }

    // Use client testId if provided (for deduplication), otherwise generate server-side
    const testId = data.testId || randomUUID();

    // Deduplication check using the unique (userId, testId) index
    const existingResult = await Result.findOne({
      userId,
      testId,
    });

    if (existingResult) {
      return NextResponse.json(
        {
          message: "Result already saved",
          resultId: existingResult._id,
          isPb: existingResult.isPb,
          newBadges: [],
        },
        { headers: corsHeaders(request) }
      );
    }

    const result = await Result.create({
      userId,
      testId,
      name: user.username,
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

    // Update user stats (only PBs and badges)
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

    // Evaluate badges
    // Optimize: Use aggregation to get both recent results and count in single query
    const [stats] = await Result.aggregate<{
      recent: Array<{ timestamp: Date }>;
      total: Array<{ count: number }>;
    }>([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      {
        $facet: {
          recent: [
            { $sort: { timestamp: -1 } },
            { $limit: 30 },
            { $project: { timestamp: 1 } }
          ],
          total: [{ $count: "count" }]
        }
      }
    ]);

    const recentResults = stats?.recent ?? [];
    const totalResults = stats?.total[0]?.count ?? 0;

    const recentTestDates = recentResults.map((r: { timestamp: Date }) =>
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

    // Only update if there's something to write
    if (Object.keys(updates).length > 0) {
      await User.findByIdAndUpdate(userId, updates);
    }

    // Invalidate cache
    try {
      await redis.del(`stats:${userId}`);
    } catch (err) {
      logError(err, { userId, action: "cache_invalidation" });
    }

    return NextResponse.json(
      {
        message: "Result saved",
        resultId: result._id,
        isPb,
        newBadges: newBadgeIds,
      },
      { headers: corsHeaders(request) }
    );
  } catch (error) {
    logError(error, { userId, endpoint: "/api/results", action: "POST" });

    return NextResponse.json(
      { error: "Failed to save result" },
      { status: 500, headers: corsHeaders(request) }
    );
  }
}

export async function GET(request: NextRequest) {
  const authResult = await requireAuth();
  if ("error" in authResult) return authResult.error;
  const { session } = authResult;

  // Rate limiting for GET requests
  const limited = await rateLimit(request, "resultsGet", session.user!.id);
  if (limited) return limited;

  const { searchParams } = new URL(request.url);

  // Validate query parameters
  const queryValidation = resultsQuerySchema.safeParse({
    cursor: searchParams.get("cursor"),
    limit: searchParams.get("limit"),
    mode: searchParams.get("mode"),
  });

  if (!queryValidation.success) {
    return NextResponse.json(
      { error: "Invalid query parameters", details: queryValidation.error.issues },
      { status: 400, headers: corsHeaders(request) }
    );
  }

  const { cursor, limit, mode } = queryValidation.data;

  await connectDB();

  // Decode cursor
  let cursorData = null;
  if (cursor) {
    try {
      cursorData = JSON.parse(Buffer.from(cursor, "base64").toString());
    } catch (error) {
      return NextResponse.json(
        { error: "Invalid cursor" },
        { status: 400, headers: corsHeaders(request) }
      );
    }
  }

  // Build filter
  const filter: Record<string, unknown> = { userId: session.user!.id };
  if (mode) filter.mode = mode;

  if (cursorData) {
    filter.$or = [
      { timestamp: { $lt: new Date(cursorData.timestamp) } },
      {
        timestamp: new Date(cursorData.timestamp),
        _id: { $lt: new mongoose.Types.ObjectId(cursorData._id) },
      },
    ];
  }

  // Fetch limit + 1 to check if more exist
  // Use projection to only fetch needed fields (excludes large history arrays)
  const results = await Result.find(filter)
    .sort({ timestamp: -1, _id: -1 })
    .limit(limit + 1)
    .select('userId wpm rawWpm accuracy consistency keyConsistency mode mode2 difficulty language punctuation numbers blindMode testDuration timestamp isPb tags isValid invalidReasons charStats')
    .lean();

  const hasMore = results.length > limit;
  const data = results.slice(0, limit);

  // Generate next cursor
  const nextCursor =
    hasMore && data.length > 0
      ? Buffer.from(
        JSON.stringify({
          timestamp: data[data.length - 1].timestamp.toISOString(),
          _id: data[data.length - 1]._id.toString(),
        })
      ).toString("base64")
      : null;

  return NextResponse.json(
    {
      results: data,
      pagination: { nextCursor, hasMore },
    },
    { headers: corsHeaders(request) }
  );
}
