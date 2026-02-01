import { NextResponse, type NextRequest } from "next/server";
import bcrypt from "bcrypt";
import { connectDB } from "@/lib/db";
import { User } from "@/server/models/User";
import { registerSchema } from "@/server/validators/auth";
import { rateLimit } from "@/server/middleware/rateLimit";

export async function POST(request: NextRequest) {
  const limited = await rateLimit(request, "register");
  if (limited) return limited;

  const body = await request.json();
  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.issues },
      { status: 400 }
    );
  }

  const { username, email, password } = parsed.data;

  await connectDB();

  const existingUsername = await User.findOne({ username });
  if (existingUsername) {
    return NextResponse.json({ error: "Username already taken" }, { status: 409 });
  }

  const existingEmail = await User.findOne({ email: email.toLowerCase() });
  if (existingEmail) {
    return NextResponse.json({ error: "Email already registered" }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await User.create({
    username,
    email: email.toLowerCase(),
    passwordHash,
  });

  return NextResponse.json({ message: "Account created successfully" }, { status: 201 });
}
