import { NextResponse, type NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { ApeKey } from "@/server/models/ApeKey";
import { requireAuth } from "@/server/middleware/auth";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ keyId: string }> }
) {
  const authResult = await requireAuth();
  if ("error" in authResult) return authResult.error;
  const { session } = authResult;
  const { keyId } = await params;

  await connectDB();
  const key = await ApeKey.findOneAndDelete({
    _id: keyId,
    userId: session.user!.id,
  });

  if (!key) {
    return NextResponse.json({ error: "Key not found" }, { status: 404 });
  }

  return NextResponse.json({ message: "Key deleted" });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ keyId: string }> }
) {
  const authResult = await requireAuth();
  if ("error" in authResult) return authResult.error;
  const { session } = authResult;
  const { keyId } = await params;

  const { active } = await request.json();
  if (typeof active !== "boolean") {
    return NextResponse.json({ error: "active must be a boolean" }, { status: 400 });
  }

  await connectDB();
  const key = await ApeKey.findOneAndUpdate(
    { _id: keyId, userId: session.user!.id },
    { $set: { active } },
    { new: true }
  );

  if (!key) {
    return NextResponse.json({ error: "Key not found" }, { status: 404 });
  }

  return NextResponse.json({ message: `Key ${active ? "activated" : "deactivated"}` });
}
