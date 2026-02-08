import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";

let cachedTransporter: Transporter | null = null;

function getTransporter(): Transporter {
  if (!cachedTransporter) {
    cachedTransporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  return cachedTransporter;
}

export async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }) {
  // If no SMTP configured, log sanitized message (no sensitive data)
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log(`[Email] OTP email would be sent to: ${to} | Subject: ${subject}`);
    return;
  }

  const transporter = getTransporter();

  try {
    await transporter.sendMail({
      from: `"Kreotype" <${process.env.SMTP_FROM || "noreply@kreotype.com"}>`,
      to,
      subject,
      html,
    });
  } catch (error) {
    console.error("Nodemailer error:", error);
    throw error;
  }
}
