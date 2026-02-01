import { NextResponse, type NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/server/models/User";
import { updatePresetSchema } from "@/server/validators/tags";
import { requireAuth } from "@/server/middleware/auth";

type RouteParams = { params: Promise<{ presetId: string }> };

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const authResult = await requireAuth();
  if ("error" in authResult) return authResult.error;
  const { session } = authResult;
  const { presetId } = await params;

  const body = await request.json();
  const parsed = updatePresetSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.issues },
      { status: 400 }
    );
  }

  await connectDB();
  const user = await User.findById(session.user!.id).select("presets");
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const preset = (user.presets as unknown as import("mongoose").Types.DocumentArray<import("@/server/models/User").IPreset>).id(presetId);
  if (!preset) {
    return NextResponse.json({ error: "Preset not found" }, { status: 404 });
  }

  if (parsed.data.name !== undefined) preset.name = parsed.data.name;
  if (parsed.data.config !== undefined) preset.config = parsed.data.config;
  await user.save();

  return NextResponse.json({ preset });
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const authResult = await requireAuth();
  if ("error" in authResult) return authResult.error;
  const { session } = authResult;
  const { presetId } = await params;

  await connectDB();
  const result = await User.findByIdAndUpdate(
    session.user!.id,
    { $pull: { presets: { _id: presetId } } },
    { new: true }
  );

  if (!result) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({ message: "Preset deleted" });
}
