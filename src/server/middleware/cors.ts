import { NextResponse, type NextRequest } from "next/server";

const ALLOWED_ORIGINS = [
  "http://localhost:3000",
  "http://localhost:3001",
  process.env.NEXTAUTH_URL || "",
].filter(Boolean);

export function corsHeaders(request: NextRequest): Record<string, string> {
  const origin = request.headers.get("origin") || "";

  if (ALLOWED_ORIGINS.includes(origin)) {
    return {
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Allow-Credentials": "true",
    };
  }
  return {};
}

export function handleCorsOptions(request: NextRequest): NextResponse | null {
  if (request.method === "OPTIONS") {
    return NextResponse.json({}, { headers: corsHeaders(request) });
  }
  return null;
}
