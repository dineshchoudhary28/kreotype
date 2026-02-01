import { NextResponse, type NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/server/models/User";
import { requireAuth } from "@/server/middleware/auth";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ friendId: string }> }
) {
  const authResult = await requireAuth();
  if ("error" in authResult) return authResult.error;
  const { session } = authResult;
  const { friendId } = await params;

  await connectDB();

  await Promise.all([
    User.findByIdAndUpdate(session.user!.id, {
      $pull: { friends: friendId },
    }),
    User.findByIdAndUpdate(friendId, {
      $pull: { friends: session.user!.id },
    }),
  ]);

  return NextResponse.json({ message: "Friend removed" });
}
