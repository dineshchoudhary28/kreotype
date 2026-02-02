"use client";

import { useState, FormEvent } from "react";
import { useSession } from "next-auth/react";

interface ProfileUser {
  _id: string;
  username: string;
  image?: string;
  testsStarted: number;
  testsCompleted: number;
  timeTyping: number;
  personalBests: Record<string, { wpm: number; accuracy: number }>;
  badges: Array<{ badgeId: string; earnedAt: string }>;
  createdAt: string;
}

interface ActivityDay {
  date: string;
  count: number;
  avgWpm: number;
}

const PB_TIMES = [
  { label: "15 seconds", key: "time|15" },
  { label: "30 seconds", key: "time|30" },
  { label: "60 seconds", key: "time|60" },
  { label: "120 seconds", key: "time|120" },
];

const PB_WORDS = [
  { label: "10 words", key: "words|10" },
  { label: "25 words", key: "words|25" },
  { label: "50 words", key: "words|50" },
  { label: "100 words", key: "words|100" },
];

function formatTime(seconds: number): string {
  if (seconds < 60) return `${Math.round(seconds)}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
}

export default function ProfilePage() {
  const { data: session } = useSession();
  const [username, setUsername] = useState("");
  const [profile, setProfile] = useState<ProfileUser | null>(null);
  const [activity, setActivity] = useState<ActivityDay[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [friendSent, setFriendSent] = useState(false);

  const handleSearch = async (e: FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;
    setError("");
    setProfile(null);
    setActivity([]);
    setFriendSent(false);
    setLoading(true);
    try {
      const res = await fetch(`/api/users/${encodeURIComponent(username.trim())}?include=activity`);
      if (res.status === 404) {
        setError("User not found");
        return;
      }
      if (!res.ok) {
        setError("Failed to load profile");
        return;
      }
      const data = await res.json();
      setProfile(data.user);
      setActivity(data.activity ?? []);
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleSendFriendRequest = async () => {
    if (!profile) return;
    try {
      const res = await fetch("/api/friends/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: profile.username }),
      });
      if (res.ok) {
        setFriendSent(true);
      } else {
        const data = await res.json();
        setError(data.error || "Failed to send request");
      }
    } catch {
      setError("Something went wrong");
    }
  };

  const isSelf = session?.user?.id === profile?._id;
  const pbs = profile?.personalBests ?? {};

  // Simple heatmap: last 52 weeks
  const activityMap = new Map(activity.map((a) => [a.date, a]));

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col gap-8 px-4 py-8 font-mono">
      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-2 items-center">
        <div className="text-sm text-text">Profile lookup</div>
        <input
          type="text"
          placeholder="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="flex-1 px-3 py-1.5 bg-background border border-secondary rounded text-text text-sm outline-none focus:border-primary transition-colors placeholder:text-secondary"
        />
        <button
          type="submit"
          disabled={loading}
          className="px-3 py-1.5 rounded bg-primary text-background text-sm disabled:opacity-50"
        >
          {loading ? "..." : "search"}
        </button>
      </form>

      {error && <p className="text-xs text-error">{error}</p>}

      {!profile && !loading && !error && (
        <>
          {/* Placeholder profile */}
          <div className="flex items-start gap-6">
            <div className="w-16 h-16 rounded-full bg-secondary bg-opacity-20 flex items-center justify-center text-secondary">?</div>
            <div className="flex flex-col gap-1">
              <div className="text-lg text-text">-</div>
              <div className="text-xs text-secondary">-</div>
            </div>
          </div>
        </>
      )}

      {loading && (
        <div className="flex flex-col gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-12 rounded bg-secondary bg-opacity-10 animate-pulse" />
          ))}
        </div>
      )}

      {profile && (
        <>
          {/* Profile Details */}
          <div className="flex items-start gap-6">
            <div className="w-16 h-16 rounded-full bg-secondary bg-opacity-20 flex items-center justify-center text-secondary overflow-hidden">
              {profile.image ? (
                <img src={profile.image} alt="" className="w-full h-full object-cover" />
              ) : (
                "?"
              )}
            </div>
            <div className="flex flex-col gap-1 flex-1">
              <div className="flex items-center gap-3">
                <div className="text-lg text-text">{profile.username}</div>
                {session && !isSelf && !friendSent && (
                  <button
                    onClick={handleSendFriendRequest}
                    className="px-2 py-1 rounded text-xs bg-primary text-background"
                  >
                    add friend
                  </button>
                )}
                {friendSent && (
                  <span className="text-xs text-primary">request sent</span>
                )}
              </div>
              <div className="text-xs text-secondary">
                joined {new Date(profile.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
              </div>
              <div className="flex gap-6 mt-2 text-xs text-secondary">
                <div>
                  <div className="text-secondary">tests started</div>
                  <div className="text-text">{profile.testsStarted}</div>
                </div>
                <div>
                  <div className="text-secondary">tests completed</div>
                  <div className="text-text">{profile.testsCompleted}</div>
                </div>
                <div>
                  <div className="text-secondary">time typing</div>
                  <div className="text-text">{formatTime(profile.timeTyping)}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Leaderboard positions */}
          <section>
            <h3 className="text-sm text-primary mb-3">All-Time English Leaderboards</h3>
            <div className="flex gap-6 text-xs">
              <div>
                <div className="text-secondary">15 seconds</div>
                <div className="text-text">{pbs["time|15"] ? `${Math.round(pbs["time|15"].wpm)} wpm` : "-"}</div>
              </div>
              <div>
                <div className="text-secondary">60 seconds</div>
                <div className="text-text">{pbs["time|60"] ? `${Math.round(pbs["time|60"].wpm)} wpm` : "-"}</div>
              </div>
            </div>
          </section>

          {/* Personal Bests - Words */}
          <section>
            <h3 className="text-sm text-secondary mb-2">personal bests — words</h3>
            <div className="grid grid-cols-4 gap-3">
              {PB_WORDS.map(({ label, key }) => {
                const pb = pbs[key];
                return (
                  <div key={key} className="text-xs">
                    <div className="text-secondary">{label}</div>
                    <div className="text-text">{pb ? `${Math.round(pb.wpm)} wpm` : "- wpm"}</div>
                    <div className="text-secondary">{pb ? `${Math.round(pb.accuracy)}% acc` : "- acc"}</div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Personal Bests - Time */}
          <section>
            <h3 className="text-sm text-secondary mb-2">personal bests — time</h3>
            <div className="grid grid-cols-4 gap-3">
              {PB_TIMES.map(({ label, key }) => {
                const pb = pbs[key];
                return (
                  <div key={key} className="text-xs">
                    <div className="text-secondary">{label}</div>
                    <div className="text-text">{pb ? `${Math.round(pb.wpm)} wpm` : "- wpm"}</div>
                    <div className="text-secondary">{pb ? `${Math.round(pb.accuracy)}% acc` : "- acc"}</div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Test Activity Heatmap */}
          <section>
            <h3 className="text-sm text-secondary mb-2">test activity</h3>
            {activity.length === 0 ? (
              <div className="h-24 rounded bg-secondary bg-opacity-5 flex items-center justify-center text-xs text-secondary">
                No data found.
              </div>
            ) : (
              <div className="flex gap-[2px] flex-wrap">
                {(() => {
                  const today = new Date();
                  const cells = [];
                  for (let i = 364; i >= 0; i--) {
                    const d = new Date(today);
                    d.setDate(d.getDate() - i);
                    const key = d.toISOString().slice(0, 10);
                    const day = activityMap.get(key);
                    const count = day?.count ?? 0;
                    const opacity = count === 0 ? 0.05 : Math.min(0.2 + count * 0.15, 1);
                    cells.push(
                      <div
                        key={key}
                        className="w-[10px] h-[10px] rounded-[2px]"
                        style={{ backgroundColor: `rgba(var(--primary-rgb, 128,128,128), ${opacity})`, opacity: count === 0 ? 0.3 : 1 }}
                        title={`${key}: ${count} tests${day ? `, avg ${Math.round(day.avgWpm)} wpm` : ""}`}
                      />
                    );
                  }
                  return cells;
                })()}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
