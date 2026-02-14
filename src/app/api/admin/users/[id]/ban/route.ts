import { NextResponse, type NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/server/models/User";
import { requireAdmin } from "@/server/middleware/admin";
import { addLog } from "@/lib/audit-log";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const adminResult = await requireAdmin();
  if ("error" in adminResult) return adminResult.error;
  const { session } = adminResult;
  
  const { id: targetUserId } = params;

  await connectDB();
  const targetUser = await User.findById(targetUserId);

  if (!targetUser) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  targetUser.banned = true;
  await targetUser.save();

  await addLog(
    "admin_action",
    `User ${targetUser.username} banned by ${session.user!.name}`,
    { targetUserId: targetUser._id },
    session.user!.id,
    true
  );

  return NextResponse.json({ message: "User has been banned" });
}
