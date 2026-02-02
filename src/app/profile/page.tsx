"use client";

import { useState, useEffect, FormEvent, useCallback } from "react";
import { useSession } from "next-auth/react";

interface ProfileUser {
  _id: string;
  username: string;
  image?: string;
  testsStarted: number;
  testsCompleted: number;
  timeTyping: number;
  personalBests: Record<string, { wpm: number; accuracy: number; consistency: number }>;
  badges: Array<{ badgeId: string; earnedAt: string }>;
  createdAt: string;
}

interface ActivityDay {
  date: string;
  count: number;
  avgWpm: number;
}

interface RecentTest {
  _id: string;
  wpm: number;
  accuracy: number;
  mode: string;
  mode2: number | string;
  timestamp: string;
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
  const { data: session, status: authStatus } = useSession();
  const [username, setUsername] = useState("");
  const [profile, setProfile] = useState<ProfileUser | null>(null);
  const [activity, setActivity] = useState<ActivityDay[]>([]);
  const [recentTests, setRecentTests] = useState<RecentTest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [friendSent, setFriendSent] = useState(false);

  const loadProfile = useCallback(async (name: string) => {
    setError("");
    setProfile(null);
    setActivity([]);
    setRecentTests([]);
    setFriendSent(false);
    setLoading(true);
    try {
      const res = await fetch(`/api/users/${encodeURIComponent(name)}?include=activity,recentTests`);
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
      setRecentTests(data.recentTests ?? []);
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-load own profile when logged in
  useEffect(() => {
    if (authStatus === "authenticated" && session?.user?.name && !profile) {
      setUsername(session.user.name);
      loadProfile(session.user.name);
    }
  }, [authStatus, session, loadProfile, profile]);

  const handleSearch = async (e: FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;
    loadProfile(username.trim());
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
    <div className="w-full max-w-3xl mx-auto flex flex-col gap-8 px-4 py-8">
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
        <div className="flex items-start gap-6">
          <div className="w-16 h-16 rounded-full bg-secondary bg-opacity-20 flex items-center justify-center text-secondary">?</div>
          <div className="flex flex-col gap-1">
            <div className="text-lg text-text">-</div>
            <div className="text-xs text-secondary">
              {authStatus === "unauthenticated" ? "Sign in to view your profile" : "Loading..."}
            </div>
          </div>
        </div>
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

          {/* Recent Tests Speed Chart */}
          {recentTests.length > 0 && (
            <section>
              <h3 className="text-sm text-secondary mb-2">recent tests</h3>
              <RecentTestsChart tests={recentTests} />
            </section>
          )}

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

function RecentTestsChart({ tests }: { tests: RecentTest[] }) {
  // Reverse so oldest is on left
  const sorted = [...tests].reverse();
  const maxWpm = Math.max(...sorted.map((t) => t.wpm), 1);
  const chartHeight = 120;

  return (
    <div className="flex flex-col gap-1">
      {/* SVG chart */}
      <div className="w-full bg-surface/30 rounded-lg border border-secondary/10 p-3">
        <svg
          viewBox={`0 0 ${sorted.length * 40} ${chartHeight + 20}`}
          className="w-full h-32"
          preserveAspectRatio="none"
        >
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((frac) => (
            <line
              key={frac}
              x1={0}
              y1={chartHeight - frac * chartHeight}
              x2={sorted.length * 40}
              y2={chartHeight - frac * chartHeight}
              stroke="var(--secondary)"
              strokeOpacity={0.15}
              strokeWidth={1}
            />
          ))}
          {/* WPM line */}
          <polyline
            fill="none"
            stroke="var(--primary)"
            strokeWidth={2}
            strokeLinejoin="round"
            strokeLinecap="round"
            points={sorted
              .map((t, i) => `${i * 40 + 20},${chartHeight - (t.wpm / maxWpm) * chartHeight}`)
              .join(" ")}
          />
          {/* WPM dots */}
          {sorted.map((t, i) => (
            <circle
              key={t._id}
              cx={i * 40 + 20}
              cy={chartHeight - (t.wpm / maxWpm) * chartHeight}
              r={3}
              fill="var(--primary)"
            >
              <title>{`${Math.round(t.wpm)} wpm | ${Math.round(t.accuracy)}% acc | ${t.mode} ${t.mode2}`}</title>
            </circle>
          ))}
          {/* X axis labels */}
          {sorted.map((t, i) => (
            <text
              key={`label-${t._id}`}
              x={i * 40 + 20}
              y={chartHeight + 14}
              textAnchor="middle"
              fontSize={9}
              fill="var(--secondary)"
            >
              {new Date(t.timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            </text>
          ))}
        </svg>
      </div>
      {/* Table below chart */}
      <div className="grid grid-cols-5 gap-2 text-xs">
        <div className="text-secondary">mode</div>
        <div className="text-secondary">wpm</div>
        <div className="text-secondary">accuracy</div>
        <div className="text-secondary">date</div>
        <div className="text-secondary">time</div>
      </div>
      {tests.map((t) => (
        <div key={t._id} className="grid grid-cols-5 gap-2 text-xs py-1 border-b border-secondary/5">
          <div className="text-text">{t.mode} {t.mode2}</div>
          <div className="text-text">{Math.round(t.wpm)}</div>
          <div className="text-text">{Math.round(t.accuracy)}%</div>
          <div className="text-secondary">
            {new Date(t.timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
          </div>
          <div className="text-secondary">
            {new Date(t.timestamp).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
          </div>
        </div>
      ))}
    </div>
  );
}
