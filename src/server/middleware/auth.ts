import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { User } from "@/server/models/User";

export async function requireAuth() {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  await connectDB();
  const user = await User.findById(session.user.id).lean();

  if (!user) {
    return { error: NextResponse.json({ error: "User not found" }, { status: 404 }) };
  }

  if (user.banned) {
    return { error: NextResponse.json({ error: "User is banned" }, { status: 403 }) };
  }
  
  // Return the full user object along with the session
  return { session, user };
}
