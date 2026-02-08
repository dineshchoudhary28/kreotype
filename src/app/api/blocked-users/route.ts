import { NextResponse, type NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/server/models/User";
import { requireAuth } from "@/server/middleware/auth";
import mongoose from "mongoose";

export async function GET() {
  const authResult = await requireAuth();
  if ("error" in authResult) return authResult.error;
  const { session } = authResult;

  await connectDB();
  const user = await User.findById(session.user!.id)
    .select("blockedUsers")
    .populate("blockedUsers", "username")
    .lean();

  return NextResponse.json({ blockedUsers: user?.blockedUsers ?? [] });
}

export async function POST(request: NextRequest) {
  const authResult = await requireAuth();
  if ("error" in authResult) return authResult.error;
  const { session } = authResult;

  const { username } = await request.json();
  if (!username) {
    return NextResponse.json({ error: "Username required" }, { status: 400 });
  }

  await connectDB();
  const targetUser = await User.findOne({ username });
  if (!targetUser) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  await User.findByIdAndUpdate(session.user!.id, {
    $addToSet: { blockedUsers: targetUser._id },
    $pull: { friends: targetUser._id },
  });

  // Remove from their friends too
  await User.findByIdAndUpdate(targetUser._id, {
    $pull: { friends: session.user!.id },
  });

  return NextResponse.json({ message: "User blocked" });
}

export async function DELETE(request: NextRequest) {
  const authResult = await requireAuth();
  if ("error" in authResult) return authResult.error;
  const { session } = authResult;

  const { userId } = await request.json();
  if (!userId) {
    return NextResponse.json({ error: "User ID required" }, { status: 400 });
  }

  // Validate ObjectId
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return NextResponse.json(
      { error: "Invalid user ID" },
      { status: 400 }
    );
  }

  await connectDB();
  await User.findByIdAndUpdate(session.user!.id, {
    $pull: { blockedUsers: userId },
  });

  return NextResponse.json({ message: "User unblocked" });
}
