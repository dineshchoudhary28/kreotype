"use client";

import { useState, FormEvent, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { MAINTENANCE_MODE, showMaintenanceToast } from "@/lib/maintenance";

export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    if (MAINTENANCE_MODE) {
      showMaintenanceToast();
      router.replace("/");
    }
  }, [router]);

  if (MAINTENANCE_MODE) return null;
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [useOtp, setUseOtp] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loginError, setLoginError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setLoading(true);

    try {
      const res = await signIn("credentials", {
        email: loginEmail,
        password: useOtp ? undefined : loginPassword,
        otp: useOtp ? otp : undefined,
        redirect: false,
      });

      if (res?.error) {
        setLoginError(useOtp ? "Invalid or expired code" : "Invalid email/username or password");
      } else {
        router.push("/");
      }
    } catch {
      setLoginError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const requestOtp = async () => {
    if (!loginEmail) {
      setLoginError("Please enter your email or username first");
      return;
    }

    setLoading(true);
    setLoginError("");
    try {
      const res = await fetch("/api/auth/otp/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: loginEmail,
          type: "login",
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setLoginError(data.error || "Failed to send code");
        return;
      }

      setOtpSent(true);
    } catch {
      setLoginError("Failed to request code");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[400px] mx-auto px-6 py-20 flex flex-col justify-center min-h-[80vh]">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-text mb-2 tracking-tight">
          {otpSent ? "Enter code" : "Welcome back"}
        </h1>
        <p className="text-secondary text-sm">
          {otpSent 
            ? `We sent a code to your registered email` 
            : "Please enter your details to sign in."}
        </p>
      </div>
      
      {!otpSent && (
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
            Continue with Google
          </button>
        </div>
      )}

      {!otpSent && (
        <div className="flex items-center gap-4 mb-8">
          <div className="flex-1 h-px bg-surface" />
          <span className="text-xs text-secondary font-bold uppercase tracking-widest opacity-30">or</span>
          <div className="flex-1 h-px bg-surface" />
        </div>
      )}

      {loginError && (
        <p className="text-error text-xs mb-6 p-3 bg-error/10 border border-error/20 rounded-xl text-center font-medium">{loginError}</p>
      )}

      <form onSubmit={handleLogin} className="flex flex-col gap-4">
        {!otpSent && (
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-secondary uppercase tracking-wider ml-1">Email or Username</label>
            <input
              type="text"
              placeholder="Email or Username"
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
              disabled={otpSent}
              className="w-full px-4 py-3.5 bg-surface border border-surface rounded-xl text-text outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all placeholder:text-secondary/30 text-sm disabled:opacity-50"
              autoComplete="username"
              required
            />
          </div>
        )}

        {useOtp ? (
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-secondary uppercase tracking-wider ml-1">
              {otpSent ? "Verification Code" : "Password (switched to code)"}
            </label>
            {otpSent ? (
              <input
                type="text"
                placeholder="123456"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full px-4 py-3.5 bg-surface border border-surface rounded-xl text-text outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all placeholder:text-secondary/30 text-center text-2xl tracking-[0.5em] font-bold"
                maxLength={6}
                required
              />
            ) : (
              <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl text-center">
                <p className="text-xs text-secondary mb-3">Request a code to sign in without a password.</p>
                <button
                  type="button"
                  onClick={requestOtp}
                  disabled={loading}
                  className="px-4 py-2 bg-primary text-background text-xs font-bold rounded-lg hover:opacity-90 transition-all cursor-pointer"
                >
                  {loading ? "Sending..." : "Send Code"}
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-secondary uppercase tracking-wider ml-1">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              className="w-full px-4 py-3.5 bg-surface border border-surface rounded-xl text-text outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all placeholder:text-secondary/30 text-sm"
              autoComplete="current-password"
              required
            />
          </div>
        )}
        
        {!otpSent && (
          <div className="flex justify-between items-center mt-1">
            <label className="flex items-center gap-2 text-xs text-secondary cursor-pointer group">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-surface bg-surface text-primary focus:ring-primary focus:ring-offset-background accent-primary"
              />
              <span className="group-hover:text-text transition-colors">Remember me</span>
            </label>
            <button
              type="button"
              onClick={() => setUseOtp(!useOtp)}
              className="text-xs text-secondary hover:text-primary transition-colors font-bold"
            >
              {useOtp ? "Use password instead" : "Sign in with code"}
            </button>
          </div>
        )}

        <button
          type="submit"
          disabled={loading || (useOtp && !otpSent)}
          className="w-full px-4 py-4 mt-4 rounded-xl bg-primary text-background text-sm font-bold hover:opacity-90 transition-all duration-200 disabled:opacity-50 shadow-lg shadow-primary/20 cursor-pointer"
        >
          {loading ? "Please wait..." : "Sign in"}
        </button>

        {otpSent && (
          <button
            type="button"
            onClick={() => { setOtpSent(false); setOtp(""); }}
            className="text-xs text-secondary hover:text-text transition-colors text-center mt-2"
          >
            ← Back to options
          </button>
        )}
      </form>

      <p className="mt-10 text-sm text-secondary text-center">
        Don&apos;t have an account?{" "}
        <Link href="/sign-up" className="text-text hover:text-primary transition-colors font-bold underline underline-offset-4">
          Create one for free
        </Link>
      </p>
    </div>
  );
}
