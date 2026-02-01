import { NextResponse, type NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { Preset } from "@/server/models/Preset";
import { requireAuth } from "@/server/middleware/auth";
import { z } from "zod";

const createPresetSchema = z.object({
  name: z.string().min(1).max(32).trim(),
  config: z.object({
    mode: z.enum(["time", "words", "quote", "zen", "custom"]),
    mode2: z.union([z.string(), z.number()]),
    punctuation: z.boolean().optional(),
    numbers: z.boolean().optional(),
    blindMode: z.boolean().optional(),
    language: z.string().optional(),
    difficulty: z.string().optional(),
  }),
});

export async function GET() {
  const authResult = await requireAuth();
  if ("error" in authResult) return authResult.error;
  const { session } = authResult;

  await connectDB();
  const presets = await Preset.find({ userId: session.user!.id }).sort({ createdAt: -1 });

  return NextResponse.json({ presets });
}

export async function POST(request: NextRequest) {
  const authResult = await requireAuth();
  if ("error" in authResult) return authResult.error;
  const { session } = authResult;

  const body = await request.json();
  const parsed = createPresetSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.issues },
      { status: 400 }
    );
  }

  await connectDB();
  
  // Check if preset already exists for this user
  const existing = await Preset.findOne({ 
    userId: session.user!.id, 
    name: parsed.data.name 
  });

  if (existing) {
    return NextResponse.json(
      { error: "Preset with this name already exists" }, 
      { status: 409 }
    );
  }

  const preset = await Preset.create({
    userId: session.user!.id,
    ...parsed.data,
  });

  return NextResponse.json({ preset }, { status: 201 });
}