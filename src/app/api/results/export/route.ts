import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Result } from "@/server/models/Result";
import { requireAuth } from "@/server/middleware/auth";

const MAX_EXPORT_RESULTS = 5000;

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

  // Stream CSV using a cursor to avoid loading all results into memory
  const cursor = Result.find({ userId: session.user!.id })
    .sort({ timestamp: -1 })
    .limit(MAX_EXPORT_RESULTS)
    .select(headers.join(" "))
    .lean()
    .cursor();

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      // Write header row
      controller.enqueue(encoder.encode(headers.join(",") + "\n"));

      try {
        for await (const doc of cursor) {
          const row = headers
            .map((h) => escapeCsvValue(doc[h as keyof typeof doc]))
            .join(",");
          controller.enqueue(encoder.encode(row + "\n"));
        }
      } finally {
        await cursor.close();
        controller.close();
      }
    },
  });

  return new NextResponse(stream, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": "attachment; filename=kreotype-results.csv",
      "Transfer-Encoding": "chunked",
    },
  });
}
