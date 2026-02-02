import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/server/models/User";
import { requireAuth } from "@/server/middleware/auth";

export async function POST() {
  const authResult = await requireAuth();
  if ("error" in authResult) return authResult.error;
  const { session } = authResult;

  await connectDB();
  await User.findByIdAndUpdate(session.user!.id, {
    $inc: { testsStarted: 1 },
  });

  return NextResponse.json({ ok: true });
}
