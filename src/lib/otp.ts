import { redis } from "./redis";
import { sendEmail } from "./email";

const OTP_EXPIRY = 60 * 5; // 5 minutes

export async function generateOTP(email: string): Promise<string> {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const success = await redis.setex(`otp:${email.toLowerCase()}`, OTP_EXPIRY, otp);
  
  if (success === null) {
    throw new Error("OTP storage unavailable. Please check Redis connection.");
  }
  
  return otp;
}

export async function verifyOTP(email: string, otp: string): Promise<boolean> {
  const storedOtp = await redis.get(`otp:${email.toLowerCase()}`);
  if (storedOtp === otp) {
    await redis.del(`otp:${email.toLowerCase()}`);
    return true;
  }
  return false;
}

export async function sendOTP(email: string, otp: string, type: "login" | "signup") {
  const subject = type === "signup" ? "Verify your Kreotype account" : "Your Kreotype Login Code";
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; rounded: 8px;">
      <h2 style="color: #685ACA; text-align: center;">KREOTYPE</h2>
      <p>Hello,</p>
      <p>Your verification code is:</p>
      <div style="background: #f4f4f4; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #685ACA; margin: 20px 0;">
        ${otp}
      </div>
      <p>This code will expire in 5 minutes.</p>
      <p>If you didn't request this code, you can safely ignore this email.</p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
      <p style="color: #666; font-size: 12px; text-align: center;">&copy; 2026 Kreotype. All rights reserved.</p>
    </div>
  `;

  await sendEmail({ to: email, subject, html });
}