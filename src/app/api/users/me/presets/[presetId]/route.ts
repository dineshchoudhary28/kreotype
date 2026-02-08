import { NextResponse, type NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { Preset } from "@/server/models/Preset";
import { updatePresetSchema } from "@/server/validators/tags";
import { requireAuth } from "@/server/middleware/auth";
import mongoose from "mongoose";

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

  // Validate ObjectId
  if (!mongoose.Types.ObjectId.isValid(presetId)) {
    return NextResponse.json({ error: "Invalid preset ID" }, { status: 400 });
  }

  // Find and update preset owned by user
  const preset = await Preset.findOneAndUpdate(
    { _id: presetId, userId: session.user!.id },
    { $set: parsed.data },
    { new: true, runValidators: true }
  );

  if (!preset) {
    return NextResponse.json({ error: "Preset not found" }, { status: 404 });
  }

  return NextResponse.json({ preset });
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const authResult = await requireAuth();
  if ("error" in authResult) return authResult.error;
  const { session } = authResult;
  const { presetId } = await params;

  await connectDB();

  // Validate ObjectId
  if (!mongoose.Types.ObjectId.isValid(presetId)) {
    return NextResponse.json({ error: "Invalid preset ID" }, { status: 400 });
  }

  // Delete preset owned by user
  const preset = await Preset.findOneAndDelete({
    _id: presetId,
    userId: session.user!.id
  });

  if (!preset) {
    return NextResponse.json({ error: "Preset not found" }, { status: 404 });
  }

  return NextResponse.json({ message: "Preset deleted" });
}
