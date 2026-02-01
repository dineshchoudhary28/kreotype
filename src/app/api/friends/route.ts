import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/server/models/User";
import { requireAuth } from "@/server/middleware/auth";

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
    .select("username image testsCompleted timeTyping personalBests createdAt")
    .lean();

  return NextResponse.json({ friends });
}
