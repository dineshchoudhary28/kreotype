import { NextResponse, type NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { Tag } from "@/server/models/Tag";
import { requireAuth } from "@/server/middleware/auth";
import { z } from "zod";

const createTagSchema = z.object({
  name: z.string().min(1).max(32).trim(),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
});

export async function GET() {
  const authResult = await requireAuth();
  if ("error" in authResult) return authResult.error;
  const { session } = authResult;

  await connectDB();
  const tags = await Tag.find({ userId: session.user!.id }).sort({ createdAt: -1 });

  return NextResponse.json({ tags });
}

export async function POST(request: NextRequest) {
  const authResult = await requireAuth();
  if ("error" in authResult) return authResult.error;
  const { session } = authResult;

  const body = await request.json();
  const parsed = createTagSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.issues },
      { status: 400 }
    );
  }

  await connectDB();
  
  // Check if tag already exists for this user
  const existing = await Tag.findOne({ 
    userId: session.user!.id, 
    name: parsed.data.name 
  });

  if (existing) {
    return NextResponse.json(
      { error: "Tag with this name already exists" }, 
      { status: 409 }
    );
  }

  const tag = await Tag.create({
    userId: session.user!.id,
    ...parsed.data,
  });

  return NextResponse.json({ tag }, { status: 201 });
}