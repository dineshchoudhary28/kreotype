import { NextResponse, type NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/server/models/User";
import { requireAuth } from "@/server/middleware/auth";
import { z } from "zod";

const updateProfileSchema = z.object({
  image: z.string().url().refine(
    (url) => url.startsWith("https://"),
    "Image URL must use HTTPS"
  ),
});

export async function GET() {
  const authResult = await requireAuth();
  if ("error" in authResult) return authResult.error;
  const { session } = authResult;

  await connectDB();
  const user = await User.findById(session.user!.id)
    .select("-passwordHash -blockedUsers")
    .lean();

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({ user });
}

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

  await connectDB();
  await User.findByIdAndUpdate(session.user!.id, { $set: { image: parsed.data.image } });

  return NextResponse.json({ message: "Profile updated" });
}
