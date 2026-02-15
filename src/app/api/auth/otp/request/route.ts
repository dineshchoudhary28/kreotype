import { NextResponse, type NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/server/models/User";
import { generateOTP, sendOTP } from "@/lib/otp";
import { rateLimit } from "@/server/middleware/rateLimit";
import { z } from "zod";
import { logError } from "@/lib/logger";

const requestSchema = z.object({
  email: z.string().min(1), // Renamed identifier internally, but keeping key as 'email' for compatibility
  type: z.enum(["login", "signup", "reset"]),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = requestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid identifier" }, { status: 400 });
    }

    const { email: identifier, type } = parsed.data;

    // Rate limit OTP requests by IP to prevent email bombing
    const limited = await rateLimit(req, "otpRequest");
    if (limited) return limited;

    await connectDB();

    const user = await User.findOne({
      $or: [
        { email: identifier.toLowerCase() },
        { username: identifier }
      ]
    }).collation({ locale: 'en', strength: 2 });

    if ((type === "login" || type === "reset") && !user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (type === "signup" && user) {
      return NextResponse.json({ error: "Email or username already registered" }, { status: 400 });
    }

    // For signup, we expect a real email
    const targetEmail = user ? user.email : identifier;

    // Simple email validation for signup or if identifier isn't an email for login
    if (!targetEmail.includes("@")) {
      return NextResponse.json({ error: "Please provide a valid email address" }, { status: 400 });
    }

    const otp = await generateOTP(targetEmail);

    try {
      await sendOTP(targetEmail, otp, type);
    } catch (emailError) {
      logError(emailError, { endpoint: "/api/auth/otp/request", action: "sendOTP" });
      return NextResponse.json({ error: "Email delivery failed. Please check SMTP settings." }, { status: 500 });
    }

    return NextResponse.json({ message: "OTP sent successfully" });
  } catch (error) {
    logError(error, { endpoint: "/api/auth/otp/request", action: "POST" });
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 });
  }
}
