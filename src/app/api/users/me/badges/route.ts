import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/server/models/User";
import { BADGE_MAP } from "@/server/models/Badge";
import { requireAuth } from "@/server/middleware/auth";

export async function GET() {
  const authResult = await requireAuth();
  if ("error" in authResult) return authResult.error;
  const { session } = authResult;

  await connectDB();
  const user = await User.findById(session.user!.id).select("badges").lean();

  const badges = (user?.badges ?? []).map((b) => ({
    ...b,
    ...(BADGE_MAP.get(b.badgeId) ?? {}),
  }));

  return NextResponse.json({ badges });
}
