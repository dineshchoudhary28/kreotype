import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Result } from "@/server/models/Result";
import { requireAuth } from "@/server/middleware/auth";

export async function GET() {
  const authResult = await requireAuth();
  if ("error" in authResult) return authResult.error;
  const { session } = authResult;

  await connectDB();

  const headers = [
    "wpm",
    "rawWpm",
    "accuracy",
    "consistency",
    "mode",
    "mode2",
    "testDuration",
    "language",
    "difficulty",
    "punctuation",
    "numbers",
    "blindMode",
    "isValid",
    "isPb",
    "timestamp",
  ];

  // Only fetch the fields needed for CSV export (excludes large history arrays)
  const results = await Result.find({ userId: session.user!.id })
    .sort({ timestamp: -1 })
    .select(headers.join(" "))
    .lean();

  const rows = results.map((r) =>
    headers
      .map((h) => {
        const val = r[h as keyof typeof r];
        if (val instanceof Date) return val.toISOString();
        return String(val ?? "");
      })
      .join(",")
  );

  const csv = [headers.join(","), ...rows].join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": "attachment; filename=kreotype-results.csv",
    },
  });
}
