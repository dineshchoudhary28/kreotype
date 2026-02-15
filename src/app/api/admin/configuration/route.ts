import { NextResponse, type NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { Configuration } from "@/server/models/Configuration";
import { requireAdmin } from "@/server/middleware/admin";
import { getConfiguration } from "@/lib/configuration";
import { addLog } from "@/lib/audit-log";
import { z } from "zod";

const updateConfigSchema = z.object({
  maintenance: z.boolean().optional(),
  registrationEnabled: z.boolean().optional(),
  maxTestsPerDay: z.number().int().min(0).optional(),
  resultObjectHashEnabled: z.boolean().optional(),
  leaderboards: z.object({
    maxResults: z.number().int().min(1).max(500).optional(),
    cacheDurationSeconds: z.number().int().min(0).max(3600).optional(),
  }).optional(),
  rateLimiting: z.object({
    enabled: z.boolean().optional(),
  }).optional(),
  dailyLeaderboards: z.object({
    enabled: z.boolean().optional(),
    maxResults: z.number().int().min(1).max(500).optional(),
    leaderboardExpirationTimeInDays: z.number().int().min(1).max(30).optional(),
  }).optional(),
}).strict();

export async function GET() {
  const adminResult = await requireAdmin();
  if ("error" in adminResult) return adminResult.error;

  const config = await getConfiguration();
  return NextResponse.json({ configuration: config });
}

export async function PATCH(request: NextRequest) {
  const adminResult = await requireAdmin();
  if ("error" in adminResult) return adminResult.error;
  const { session } = adminResult;

  const body = await request.json();
  const parsed = updateConfigSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid configuration", details: parsed.error.issues },
      { status: 400 }
    );
  }

  await connectDB();
  const config = await Configuration.findOneAndUpdate({}, { $set: parsed.data }, { new: true, upsert: true });

  await addLog(
    "admin_action",
    "Configuration updated",
    { changes: parsed.data },
    session.user!.id,
    true
  );

  return NextResponse.json({ configuration: config });
}
