import { NextResponse, type NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/server/models/User";
import { FriendRequest } from "@/server/models/FriendRequest";
import { sendRequestSchema, handleRequestSchema } from "@/server/validators/friends";
import { requireAuth } from "@/server/middleware/auth";

export async function GET() {
  const authResult = await requireAuth();
  if ("error" in authResult) return authResult.error;
  const { session } = authResult;

  await connectDB();
  const requests = await FriendRequest.find({
    to: session.user!.id,
    status: "pending",
  })
    .populate("from", "username image")
    .lean();

  return NextResponse.json({ requests });
}

export async function POST(request: NextRequest) {
  const authResult = await requireAuth();
  if ("error" in authResult) return authResult.error;
  const { session } = authResult;

  const body = await request.json();
  const parsed = sendRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.issues },
      { status: 400 }
    );
  }

  await connectDB();
  const targetUser = await User.findOne({ username: parsed.data.username });
  if (!targetUser) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  if (targetUser._id.toString() === session.user!.id) {
    return NextResponse.json({ error: "Cannot send friend request to yourself" }, { status: 400 });
  }

  // Check if blocked
  if (targetUser.blockedUsers.some((id) => id.toString() === session.user!.id)) {
    return NextResponse.json({ error: "Cannot send friend request" }, { status: 403 });
  }

  // Check if already friends
  const currentUser = await User.findById(session.user!.id).select("friends");
  if (currentUser?.friends.some((id) => id.toString() === targetUser._id.toString())) {
    return NextResponse.json({ error: "Already friends" }, { status: 409 });
  }

  // Check existing request
  const existing = await FriendRequest.findOne({
    $or: [
      { from: session.user!.id, to: targetUser._id },
      { from: targetUser._id, to: session.user!.id },
    ],
    status: "pending",
  });
  if (existing) {
    return NextResponse.json({ error: "Friend request already pending" }, { status: 409 });
  }

  await FriendRequest.create({
    from: session.user!.id,
    to: targetUser._id,
  });

  return NextResponse.json({ message: "Friend request sent" }, { status: 201 });
}

export async function PATCH(request: NextRequest) {
  const authResult = await requireAuth();
  if ("error" in authResult) return authResult.error;
  const { session } = authResult;

  const body = await request.json();
  const parsed = handleRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.issues },
      { status: 400 }
    );
  }

  await connectDB();
  const friendRequest = await FriendRequest.findOne({
    _id: parsed.data.requestId,
    to: session.user!.id,
    status: "pending",
  });

  if (!friendRequest) {
    return NextResponse.json({ error: "Request not found" }, { status: 404 });
  }

  if (parsed.data.action === "accept") {
    friendRequest.status = "accepted";
    await friendRequest.save();

    // Add to both users' friends arrays
    await Promise.all([
      User.findByIdAndUpdate(session.user!.id, {
        $addToSet: { friends: friendRequest.from },
      }),
      User.findByIdAndUpdate(friendRequest.from, {
        $addToSet: { friends: session.user!.id },
      }),
    ]);

    return NextResponse.json({ message: "Friend request accepted" });
  }

  friendRequest.status = "rejected";
  await friendRequest.save();
  return NextResponse.json({ message: "Friend request rejected" });
}
