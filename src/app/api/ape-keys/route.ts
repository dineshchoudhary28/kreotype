import { NextResponse, type NextRequest } from "next/server";
import crypto from "crypto";
import bcrypt from "bcrypt";
import { connectDB } from "@/lib/db";
import { ApeKey } from "@/server/models/ApeKey";
import { requireAuth } from "@/server/middleware/auth";

export async function GET() {
  const authResult = await requireAuth();
  if ("error" in authResult) return authResult.error;
  const { session } = authResult;

  await connectDB();
  const keys = await ApeKey.find({ userId: session.user!.id })
    .select("-keyHash")
    .lean();

  return NextResponse.json({ keys });
}

export async function POST(request: NextRequest) {
  const authResult = await requireAuth();
  if ("error" in authResult) return authResult.error;
  const { session } = authResult;

  const { name } = await request.json();
  if (!name || typeof name !== "string") {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  await connectDB();

  // Limit to 5 keys per user
  const count = await ApeKey.countDocuments({ userId: session.user!.id });
  if (count >= 5) {
    return NextResponse.json({ error: "Maximum 5 API keys allowed" }, { status: 400 });
  }

  const rawKey = `kre_${crypto.randomBytes(32).toString("hex")}`;
  const keyHash = await bcrypt.hash(rawKey, 10);

  const apeKey = await ApeKey.create({
    userId: session.user!.id,
    name,
    keyHash,
  });

  return NextResponse.json(
    {
      key: {
        id: apeKey._id,
        name: apeKey.name,
        rawKey, // Only shown once
        createdAt: apeKey.createdAt,
      },
    },
    { status: 201 }
  );
}
