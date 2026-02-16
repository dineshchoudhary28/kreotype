import { NextResponse, type NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { Log } from "@/server/models/Log";
import { requireAdmin } from "@/server/middleware/admin";
import { z } from "zod";

const logsQuerySchema = z.object({
  type: z.string().optional(),
  limit: z.coerce.number().int().positive().max(100).optional().default(25),
});

export async function GET(request: NextRequest) {
  const adminResult = await requireAdmin();
  if ("error" in adminResult) return adminResult.error;

  const { searchParams } = new URL(request.url);
  const query = logsQuerySchema.safeParse({
    type: searchParams.get("type"),
    limit: searchParams.get("limit"),
  });

  if (!query.success) {
    return NextResponse.json({ error: "Invalid query parameters" }, { status: 400 });
  }

  const { type, limit } = query.data;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const filter: Record<string, any> = {};
  if (type) {
    filter.type = type;
  }

  await connectDB();
  const logs = await Log.find(filter)
    .sort({ timestamp: -1 })
    .limit(limit)
    .lean();

  return NextResponse.json({ logs });
}
