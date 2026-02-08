import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/server/models/User";
import { generateOTP, sendOTP } from "@/lib/otp";
import { z } from "zod";

const requestSchema = z.object({
  email: z.string().email(),
  type: z.enum(["login", "signup"]),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = requestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    const { email, type } = parsed.data;
    await connectDB();

    const user = await User.findOne({ email: email.toLowerCase() });

    if (type === "login" && !user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (type === "signup" && user) {
      return NextResponse.json({ error: "Email already registered" }, { status: 400 });
    }

    const otp = await generateOTP(email);

    try {
      await sendOTP(email, otp, type);
    } catch (emailError) {
      console.error("Failed to send OTP email");
      return NextResponse.json({ error: "Email delivery failed. Please check SMTP settings." }, { status: 500 });
    }

    return NextResponse.json({ message: "OTP sent successfully" });
  } catch (error) {
    console.error("General OTP request error:", error);
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 });
  }
}
