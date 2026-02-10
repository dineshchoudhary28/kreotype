"use client";

import { useState, FormEvent, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

const ADJECTIVES = [
  "swift", "silent", "rapid", "cosmic", "lunar", "stellar", "neon", "cyber",
  "turbo", "hyper", "ultra", "mega", "pixel", "glitch", "blur", "flash",
  "crisp", "sharp", "slick", "bold", "fierce", "zen", "frost", "ember",
];

const NOUNS = [
  "typer", "keys", "fox", "wolf", "hawk", "lynx", "puma", "raven",
  "spark", "bolt", "dash", "byte", "bit", "code", "node", "pulse",
  "ghost", "shade", "storm", "blaze", "flare", "drift", "echo", "void",
];

function generateRandomUsername(): string {
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)]!;
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)]!;
  const num = Math.floor(Math.random() * 999);
  return `${adj}_${noun}${num}`;
}

export default function CompleteProfilePage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
    if (status === "authenticated" && session && !session.needsUsername) {
      router.push("/");
    }
  }, [status, session, router]);

  const handleRandomize = () => {
    setUsername(generateRandomUsername());
    setError("");
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    const trimmed = username.trim();
    if (trimmed.length < 3) {
      setError("Username must be at least 3 characters");
      return;
    }
    if (trimmed.length > 16) {
      setError("Username must be at most 16 characters");
      return;
    }
    if (!/^[a-zA-Z0-9_]+$/.test(trimmed)) {
      setError("Only letters, numbers, and underscores allowed");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/account/setup-username", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: trimmed }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to set username");
        return;
      }

      // Refresh the session to clear needsUsername flag
      await update();
      router.push("/");
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="w-full max-w-[400px] mx-auto px-6 py-20 flex flex-col justify-center min-h-[80vh]">
        <div className="h-48 rounded-3xl bg-surface animate-pulse" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-[400px] mx-auto px-6 py-20 flex flex-col justify-center min-h-[80vh]">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-text mb-2 tracking-tight">
          Choose a username
        </h1>
        <p className="text-secondary text-sm">
          Pick a unique username for your profile. This is how others will find you.
        </p>
      </div>

      {error && (
        <p className="text-error text-xs mb-6 p-3 bg-error/10 border border-error/20 rounded-xl text-center font-medium">
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-secondary uppercase tracking-wider ml-1">
            Username
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="your_username"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                setError("");
              }}
              className="flex-1 px-4 py-3.5 bg-surface border border-surface rounded-xl text-text outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all placeholder:text-secondary/30 text-sm"
              maxLength={16}
              autoFocus
              required
            />
            <button
              type="button"
              onClick={handleRandomize}
              className="px-4 py-3.5 rounded-xl bg-surface border border-surface text-secondary hover:text-text hover:border-primary/30 transition-all text-xs font-bold shrink-0 cursor-pointer"
              title="Generate random username"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="2" y="2" width="20" height="20" rx="2" />
                <circle cx="8" cy="8" r="1.5" fill="currentColor" />
                <circle cx="16" cy="8" r="1.5" fill="currentColor" />
                <circle cx="8" cy="16" r="1.5" fill="currentColor" />
                <circle cx="16" cy="16" r="1.5" fill="currentColor" />
                <circle cx="12" cy="12" r="1.5" fill="currentColor" />
              </svg>
            </button>
          </div>
          <p className="text-[10px] text-secondary/60 ml-1">
            3-16 characters. Letters, numbers, and underscores only.
          </p>
        </div>

        <button
          type="submit"
          disabled={loading || !username.trim()}
          className="w-full px-4 py-4 mt-4 rounded-xl bg-primary text-background text-sm font-bold hover:opacity-90 transition-all duration-200 disabled:opacity-50 shadow-lg shadow-primary/20 cursor-pointer"
        >
          {loading ? "Setting up..." : "Continue"}
        </button>
      </form>
    </div>
  );
}
