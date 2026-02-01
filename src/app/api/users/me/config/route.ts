import { NextResponse, type NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/server/models/User";
import { configSchema } from "@/server/validators/user";
import { mergeWithDefaults } from "@/types/config";
import { requireAuth } from "@/server/middleware/auth";

export async function GET() {
  const authResult = await requireAuth();
  if ("error" in authResult) return authResult.error;
  const { session } = authResult;

  await connectDB();
  const user = await User.findById(session.user!.id).select("config").lean();

  return NextResponse.json({ config: user?.config ?? null });
}

export async function PUT(request: NextRequest) {
  const authResult = await requireAuth();
  if ("error" in authResult) return authResult.error;
  const { session } = authResult;

  const body = await request.json();

  // Accept partial config — merge with defaults, then validate the full result
  const merged = mergeWithDefaults(body);
  const parsed = configSchema.safeParse(merged);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid config", details: parsed.error.issues },
      { status: 400 }
    );
  }

  await connectDB();
  await User.findByIdAndUpdate(session.user!.id, { $set: { config: parsed.data } });

  return NextResponse.json({ message: "Config saved" });
}
