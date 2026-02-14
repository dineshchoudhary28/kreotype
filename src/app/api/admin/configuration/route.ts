import { NextResponse, type NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { Configuration } from "@/server/models/Configuration";
import { requireAdmin } from "@/server/middleware/admin";
import { getConfiguration } from "@/lib/configuration";
import { addLog } from "@/lib/audit-log";

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

  await connectDB();
  const config = await Configuration.findOneAndUpdate({}, { $set: body }, { new: true, upsert: true });

  await addLog(
    "admin_action",
    "Configuration updated",
    { changes: body },
    session.user!.id,
    true
  );

  return NextResponse.json({ configuration: config });
}
