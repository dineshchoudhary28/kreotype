import { NextResponse, type NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/server/models/User";
import { requireAuth } from "@/server/middleware/auth";
import { z } from "zod/v4";

const setupUsernameSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(16, "Username must be at most 16 characters")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Username can only contain letters, numbers, and underscores"
    ),
});

export async function POST(request: NextRequest) {
  const authResult = await requireAuth();
  if ("error" in authResult) return authResult.error;
  const { session } = authResult;

  const body = await request.json();
  const parsed = setupUsernameSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Invalid username" },
      { status: 400 }
    );
  }

  const { username } = parsed.data;

  await connectDB();

  const user = await User.findById(session.user!.id);
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  if (!user.needsUsername) {
    return NextResponse.json(
      { error: "Username already set" },
      { status: 400 }
    );
  }

  const existing = await User.findOne({ username });
  if (existing && existing._id.toString() !== session.user!.id) {
    return NextResponse.json(
      { error: "Username already taken" },
      { status: 409 }
    );
  }

  user.username = username;
  user.needsUsername = false;
  await user.save();

  return NextResponse.json({ message: "Username set successfully" });
}
