import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/server/models/User";
import { requireAuth } from "@/server/middleware/auth";

export async function GET() {
  const authResult = await requireAuth();
  if ("error" in authResult) return authResult.error;
  const { session } = authResult;

  await connectDB();
  const user = await User.findById(session.user!.id).select("personalBests").lean();

  return NextResponse.json({ personalBests: user?.personalBests ?? {} });
}

export async function DELETE() {
  const authResult = await requireAuth();
  if ("error" in authResult) return authResult.error;
  const { session } = authResult;

  await connectDB();
  await User.findByIdAndUpdate(session.user!.id, {
    $set: { personalBests: {} },
  });

  return NextResponse.json({ message: "Personal bests cleared" });
}
