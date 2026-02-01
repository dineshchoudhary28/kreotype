import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/server/models/User";
import { Result } from "@/server/models/Result";
import { requireAuth } from "@/server/middleware/auth";

export async function POST() {
  const authResult = await requireAuth();
  if ("error" in authResult) return authResult.error;
  const { session } = authResult;

  await connectDB();

  await Promise.all([
    Result.deleteMany({ userId: session.user!.id }),
    User.findByIdAndUpdate(session.user!.id, {
      $set: {
        testsStarted: 0,
        testsCompleted: 0,
        timeTyping: 0,
        personalBests: {},
      },
    }),
  ]);

  return NextResponse.json({ message: "Account reset successfully" });
}
