import { NextResponse } from "next/server";
import { requireAuth } from "./auth";
import { User } from "@/server/models/User";

// This is a placeholder for a real admin check.
// In a real application, you would check for an admin role or specific user IDs.
const ADMIN_USER_IDS = process.env.ADMIN_USER_IDS?.split(",") || [];

export async function requireAdmin() {
  const authResult = await requireAuth();
  if ("error" in authResult) {
    return authResult;
  }

  const { session } = authResult;
  const user = await User.findById(session.user!.id).select("username").lean();

  if (!user || !ADMIN_USER_IDS.includes(user._id.toString())) {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }

  return authResult;
}
