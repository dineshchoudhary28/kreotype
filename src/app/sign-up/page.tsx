"use client";

import { useState, FormEvent } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignUpPage() {
  const router = useRouter();
  const [registerUsername, setRegisterUsername] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [showOtpStep, setShowOtpStep] = useState(false);
  const [registerError, setRegisterError] = useState("");
  const [loading, setLoading] = useState(false);

  const requestOtp = async (e: FormEvent) => {
    e.preventDefault();
    setRegisterError("");

    setLoading(true);
    try {
      const res = await fetch("/api/auth/otp/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: registerEmail,
          type: "signup",
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setRegisterError(data.error || "Failed to send OTP");
        return;
      }

      setShowOtpStep(true);
    } catch {
      setRegisterError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    setRegisterError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: registerUsername,
          email: registerEmail,
          password: registerPassword,
          otp,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setRegisterError(data.error || "Registration failed");
        return;
      }

      // Auto-login after successful registration
      const loginRes = await signIn("credentials", {
        email: registerEmail,
        password: registerPassword,
        redirect: false,
      });

      if (loginRes?.error) {
        setRegisterError("Registered but failed to sign in. Please log in manually.");
      } else {
        router.push("/");
      }
    } catch {
      setRegisterError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[400px] mx-auto px-6 py-12 flex flex-col justify-center min-h-[80vh]">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-text mb-2 tracking-tight">Create an account</h1>
        <p className="text-secondary text-sm">Join the Kreotype community today.</p>
      </div>

      {!showOtpStep ? (
        <>
          <div className="flex flex-col gap-3 mb-8">
            <button
              onClick={() => signIn("google", { callbackUrl: "/" })}
              disabled={loading}
              className="flex items-center justify-center gap-3 w-full px-4 py-3 rounded-xl bg-white text-black font-bold hover:bg-gray-200 transition-all duration-200 text-sm disabled:opacity-50 cursor-pointer"
            >
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-1 .67-2.28 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.67-.35-1.39-.35-2.09s.13-1.42.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Register with Google
            </button>
          </div>

          <div className="flex items-center gap-4 mb-8">
            <div className="flex-1 h-px bg-surface" />
            <span className="text-xs text-secondary font-bold uppercase tracking-widest opacity-30">or</span>
            <div className="flex-1 h-px bg-surface" />
          </div>

          {registerError && (
            <p className="text-error text-xs mb-6 p-3 bg-error/10 border border-error/20 rounded-xl text-center font-medium">{registerError}</p>
          )}

          <form onSubmit={requestOtp} className="flex flex-col gap-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-secondary uppercase tracking-wider ml-1">Username</label>
              <input
                type="text"
                placeholder="johndoe"
                value={registerUsername}
                onChange={(e) => setRegisterUsername(e.target.value)}
                className="w-full px-4 py-3.5 bg-surface border border-surface rounded-xl text-text outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all placeholder:text-secondary/30 text-sm"
                autoComplete="username"
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-secondary uppercase tracking-wider ml-1">Email</label>
              <input
                type="email"
                placeholder="name@example.com"
                value={registerEmail}
                onChange={(e) => setRegisterEmail(e.target.value)}
                className="w-full px-4 py-3.5 bg-surface border border-surface rounded-xl text-text outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all placeholder:text-secondary/30 text-sm"
                autoComplete="email"
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-secondary uppercase tracking-wider ml-1">Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={registerPassword}
                onChange={(e) => setRegisterPassword(e.target.value)}
                className="w-full px-4 py-3.5 bg-surface border border-surface rounded-xl text-text outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all placeholder:text-secondary/30 text-sm"
                autoComplete="new-password"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-4 mt-6 rounded-xl bg-primary text-background text-sm font-bold hover:opacity-90 transition-all duration-200 disabled:opacity-50 shadow-lg shadow-primary/20 cursor-pointer"
            >
              {loading ? "Sending Code..." : "Register"}
            </button>
          </form>
        </>
      ) : (
        <>
          <div className="mb-6">
            <h2 className="text-xl font-bold text-text mb-2">Verify your email</h2>
            <p className="text-secondary text-sm">We&apos;ve sent a 6-digit code to <span className="text-text font-medium">{registerEmail}</span>.</p>
          </div>

          {registerError && (
            <p className="text-error text-xs mb-6 p-3 bg-error/10 border border-error/20 rounded-xl text-center font-medium">{registerError}</p>
          )}

          <form onSubmit={handleRegister} className="flex flex-col gap-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-secondary uppercase tracking-wider ml-1">Verification Code</label>
              <input
                type="text"
                placeholder="123456"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full px-4 py-3.5 bg-surface border border-surface rounded-xl text-text outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all placeholder:text-secondary/30 text-center text-2xl tracking-[0.5em] font-bold"
                maxLength={6}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-4 mt-2 rounded-xl bg-primary text-background text-sm font-bold hover:opacity-90 transition-all duration-200 disabled:opacity-50 shadow-lg shadow-primary/20 cursor-pointer"
            >
              {loading ? "Verifying..." : "Complete Registration"}
            </button>

            <button
              type="button"
              onClick={() => setShowOtpStep(false)}
              className="text-xs text-secondary hover:text-text transition-colors mt-2"
            >
              ← Go back
            </button>
          </form>
        </>
      )}

      <p className="mt-10 text-sm text-secondary text-center">
        Already have an account?{" "}
        <Link href="/login" className="text-text hover:text-primary transition-colors font-bold underline underline-offset-4">
          Sign in here
        </Link>
      </p>
    </div>
  );
}
