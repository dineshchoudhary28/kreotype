import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Result } from "@/server/models/Result";
import { requireAuth } from "@/server/middleware/auth";

const MAX_EXPORT_RESULTS = 10000;

function escapeCsvValue(val: unknown): string {
  const str = val instanceof Date ? val.toISOString() : String(val ?? "");
  // Prefix formula-triggering characters to prevent CSV injection
  const needsFormulaEscape = /^[=+\-@\t\r]/.test(str);
  const escaped = needsFormulaEscape ? `'${str}` : str;
  // Wrap in quotes if contains comma, quote, or newline; escape internal quotes
  if (escaped.includes(",") || escaped.includes('"') || escaped.includes("\n") || needsFormulaEscape) {
    return `"${escaped.replace(/"/g, '""')}"`;
  }
  return escaped;
}

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

  // Safety cap to prevent OOM on large result sets
  const results = await Result.find({ userId: session.user!.id })
    .sort({ timestamp: -1 })
    .limit(MAX_EXPORT_RESULTS)
    .select(headers.join(" "))
    .lean();

  const rows = results.map((r) =>
    headers
      .map((h) => escapeCsvValue(r[h as keyof typeof r]))
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
