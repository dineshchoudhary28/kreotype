import { NextResponse, type NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { Tag } from "@/server/models/Tag";
import { Result } from "@/server/models/Result";
import { updateTagSchema } from "@/server/validators/tags";
import { requireAuth } from "@/server/middleware/auth";
import mongoose from "mongoose";

type RouteParams = { params: Promise<{ tagId: string }> };

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const authResult = await requireAuth();
  if ("error" in authResult) return authResult.error;
  const { session } = authResult;
  const { tagId } = await params;

  const body = await request.json();
  const parsed = updateTagSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.issues },
      { status: 400 }
    );
  }

  await connectDB();

  // Validate ObjectId
  if (!mongoose.Types.ObjectId.isValid(tagId)) {
    return NextResponse.json({ error: "Invalid tag ID" }, { status: 400 });
  }

  // Find and update tag owned by user
  const tag = await Tag.findOneAndUpdate(
    { _id: tagId, userId: session.user!.id },
    { $set: parsed.data },
    { new: true, runValidators: true }
  );

  if (!tag) {
    return NextResponse.json({ error: "Tag not found" }, { status: 404 });
  }

  return NextResponse.json({ tag });
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const authResult = await requireAuth();
  if ("error" in authResult) return authResult.error;
  const { session } = authResult;
  const { tagId } = await params;

  await connectDB();

  // Validate ObjectId
  if (!mongoose.Types.ObjectId.isValid(tagId)) {
    return NextResponse.json({ error: "Invalid tag ID" }, { status: 400 });
  }

  // Note: Transaction removed for development compatibility
  // Delete tag owned by user
  const tag = await Tag.findOneAndDelete({
    _id: tagId,
    userId: session.user!.id
  });

  if (!tag) {
    return NextResponse.json({ error: "Tag not found" }, { status: 404 });
  }

  // Cascade delete: Remove tag from all results
  await Result.updateMany(
    { tags: tagId },
    { $pull: { tags: tagId } }
  );

  return NextResponse.json({ message: "Tag deleted" });
}
