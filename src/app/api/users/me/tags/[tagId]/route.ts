import { NextResponse, type NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/server/models/User";
import { updateTagSchema } from "@/server/validators/tags";
import { requireAuth } from "@/server/middleware/auth";

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
  const user = await User.findById(session.user!.id).select("tags");
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const tag = (user.tags as unknown as import("mongoose").Types.DocumentArray<import("@/server/models/User").ITag>).id(tagId);
  if (!tag) {
    return NextResponse.json({ error: "Tag not found" }, { status: 404 });
  }

  if (parsed.data.name !== undefined) tag.name = parsed.data.name;
  if (parsed.data.color !== undefined) tag.color = parsed.data.color;
  await user.save();

  return NextResponse.json({ tag });
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const authResult = await requireAuth();
  if ("error" in authResult) return authResult.error;
  const { session } = authResult;
  const { tagId } = await params;

  await connectDB();
  const result = await User.findByIdAndUpdate(
    session.user!.id,
    { $pull: { tags: { _id: tagId } } },
    { new: true }
  );

  if (!result) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({ message: "Tag deleted" });
}
