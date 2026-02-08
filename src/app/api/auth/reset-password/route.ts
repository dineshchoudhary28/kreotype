import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/server/models/User";
import { verifyOTP } from "@/lib/otp";
import bcrypt from "bcrypt";
import { z } from "zod";

const resetSchema = z.object({
  identifier: z.string().min(1),
  otp: z.string().length(6),
  newPassword: z.string().min(8).max(128),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = resetSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    const { identifier, otp, newPassword } = parsed.data;
    await connectDB();

    const user = await User.findOne({
      $or: [
        { email: identifier.toLowerCase() },
        { username: identifier }
      ]
    }).collation({ locale: 'en', strength: 2 });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const isValid = await verifyOTP(user.email, otp);
    if (!isValid) {
      return NextResponse.json({ error: "Invalid or expired code" }, { status: 400 });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    user.passwordHash = passwordHash;
    await user.save();

    return NextResponse.json({ message: "Password reset successfully" });
  } catch (error) {
    console.error("Password reset error:", error);
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 });
  }
}
