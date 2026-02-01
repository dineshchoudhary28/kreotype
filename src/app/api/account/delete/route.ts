import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/server/models/User";
import { Result } from "@/server/models/Result";
import { FriendRequest } from "@/server/models/FriendRequest";
import { ApeKey } from "@/server/models/ApeKey";
import { requireAuth } from "@/server/middleware/auth";

export async function POST() {
  const authResult = await requireAuth();
  if ("error" in authResult) return authResult.error;
  const { session } = authResult;
  if (!session?.user?.id) {
    return NextResponse.json({ error: "User ID missing" }, { status: 401 });
  }
  const userId = session.user!.id;

  await connectDB();

  await Promise.all([
    Result.deleteMany({ userId }),
    FriendRequest.deleteMany({ $or: [{ from: userId }, { to: userId }] }),
    ApeKey.deleteMany({ userId }),
    // Remove from others' friends lists
    User.updateMany(
      { friends: userId },
      { $pull: { friends: userId } }
    ),
    User.updateMany(
      { blockedUsers: userId },
      { $pull: { blockedUsers: userId } }
    ),
  ]);

  await User.findByIdAndDelete(userId);

  return NextResponse.json({ message: "Account deleted" });
}
