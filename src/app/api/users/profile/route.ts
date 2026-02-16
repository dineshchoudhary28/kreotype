import { NextResponse, type NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/server/models/User";
import { requireAuth } from "@/server/middleware/auth";
import { updateProfileSchema } from "@/server/validators/profile";

export async function PATCH(request: NextRequest) {
  const authResult = await requireAuth();
  if ("error" in authResult) return authResult.error;
  const { session } = authResult;

  const body = await request.json();
  const parsed = updateProfileSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid profile data", details: parsed.error.issues },
      { status: 400 }
    );
  }

  const { bio, keyboard, socialProfiles } = parsed.data;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updates: Record<string, any> = {};
  if (bio !== undefined) updates["profileDetails.bio"] = bio;
  if (keyboard !== undefined) updates["profileDetails.keyboard"] = keyboard;
  if (socialProfiles !== undefined) updates["profileDetails.socialProfiles"] = socialProfiles;

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ message: "No changes to apply" });
  }

  await connectDB();
  await User.findByIdAndUpdate(session.user!.id, { $set: updates });

  return NextResponse.json({ message: "Profile updated successfully" });
}
