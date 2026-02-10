import { NextResponse, type NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/server/models/User";
import { updateNameSchema } from "@/server/validators/user";
import { requireAuth } from "@/server/middleware/auth";

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

export async function PATCH(request: NextRequest) {
  const authResult = await requireAuth();
  if ("error" in authResult) return authResult.error;
  const { session } = authResult;

  const body = await request.json();
  const parsed = updateNameSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.issues },
      { status: 400 }
    );
  }

  const { username, name } = parsed.data;

  await connectDB();
  const user = await User.findById(session.user!.id);
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Handle name update (display name)
  if (name !== undefined) {
    user.name = name;
  }

  // Handle username update (handle, unique)
  if (username !== undefined && username !== user.username) {
    if (user.lastNameChange && Date.now() - user.lastNameChange.getTime() < THIRTY_DAYS_MS) {
      const nextAllowed = new Date(user.lastNameChange.getTime() + THIRTY_DAYS_MS);
      return NextResponse.json(
        { error: `Username change available after ${nextAllowed.toISOString()}` },
        { status: 429 }
      );
    }

    const existing = await User.findOne({ username }).collation({
      locale: "en",
      strength: 2,
    });
    if (existing && existing._id.toString() !== session.user!.id) {
      return NextResponse.json({ error: "Username already taken" }, { status: 409 });
    }

    user.username = username;
    user.lastNameChange = new Date();
  }

  await user.save();

  return NextResponse.json({ message: "Account details updated" });
}