import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/server/models/User";
import { requireAuth } from "@/server/middleware/auth";

export async function GET() {
  const authResult = await requireAuth();
  if ("error" in authResult) return authResult.error;
  const { session } = authResult;
  const userId = session.user!.id;

  await connectDB();

  const user = await User.findById(userId).select("testActivity").lean();

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({ activity: user.testActivity || {} });
}
