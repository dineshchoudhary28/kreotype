"use client";

import { useState, useEffect, FormEvent, useCallback } from "react";
import { useSession } from "next-auth/react";
import { 
  Search, 
  User, 
  Calendar, 
  Trophy, 
  Activity, 
  Clock, 
  UserPlus, 
  Check, 
  AlertTriangle,
  ChevronRight,
  TrendingUp,
  Award
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ProfileUser {
  _id: string;
  username: string;
  name: string | null;
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
  { label: "15s", key: "time|15" },
  { label: "30s", key: "time|30" },
  { label: "60s", key: "time|60" },
  { label: "120s", key: "time|120" },
];

const PB_WORDS = [
  { label: "10", key: "words|10" },
  { label: "25", key: "words|25" },
  { label: "50", key: "words|50" },
  { label: "100", key: "words|100" },
];

function formatTime(seconds: number): string {
  if (seconds < 60) return `${Math.round(seconds)}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
}

function formatDate(ts: string): string {
  return new Date(ts).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
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
  const activityMap = new Map(activity.map((a) => [a.date, a]));

  return (
    <div className="w-full max-w-[1500px] mx-auto flex flex-col gap-10 px-6 py-12">
      {/* Profile Search UI */}
      <div className="flex flex-col gap-6">
        <form onSubmit={handleSearch} className="relative group max-w-md">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-secondary group-focus-within:text-primary transition-colors">
            <Search size={18} />
          </div>
          <input
            type="text"
            placeholder="Search for a profile..."
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-surface border border-gray-900 rounded-2xl text-text outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all placeholder:text-secondary/50 text-sm"
          />
          <button
            type="submit"
            disabled={loading}
            className="absolute inset-y-2 right-2 px-4 rounded-xl bg-primary text-background text-xs font-bold hover:opacity-90 transition-all disabled:opacity-50 cursor-pointer"
          >
            {loading ? "..." : "Search"}
          </button>
        </form>

        {error && (
          <div className="flex items-center gap-2 text-error text-xs font-bold px-1 animate-in fade-in">
            <AlertTriangle size={14} />
            {error}
          </div>
        )}
      </div>

      {!profile && !loading && !error && (
        <div className="flex flex-col items-center justify-center py-20 text-center gap-4 bg-surface/30 rounded-3xl border border-dashed border-gray-900/50">
          <div className="p-4 rounded-full bg-surface border border-gray-900 text-secondary/30">
            <User size={48} />
          </div>
          <div className="flex flex-col gap-1">
            <h2 className="text-lg font-bold text-text">No profile selected</h2>
            <p className="text-sm text-secondary">Search for a user to see their typing performance.</p>
          </div>
        </div>
      )}

      {loading && (
        <div className="flex flex-col gap-8">
          <div className="h-32 rounded-3xl bg-surface animate-pulse" />
          <div className="grid grid-cols-2 gap-6">
            <div className="h-48 rounded-3xl bg-surface animate-pulse" />
            <div className="h-48 rounded-3xl bg-surface animate-pulse" />
          </div>
        </div>
      )}

      {profile && (
        <>
          {/* Profile Header */}
          <div className="relative overflow-hidden rounded-3xl bg-surface border border-gray-900/50 p-8 shadow-sm">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl" />
            
            <div className="relative flex flex-col md:flex-row items-center md:items-start gap-8">
              <div className="w-24 h-24 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 overflow-hidden shadow-2xl shadow-primary/10">
                {profile.image ? (
                  <img src={profile.image} alt="" className="w-full h-full object-cover" />
                ) : (
                  <User size={40} />
                )}
              </div>
              
              <div className="flex flex-col gap-4 flex-1 text-center md:text-left">
                <div className="flex flex-col md:flex-row md:items-center gap-3">
                  <div className="flex flex-col">
                    <h1 className="text-3xl font-bold text-text tracking-tight">{profile.name || "Anonymous"}</h1>
                    <p className="text-primary text-sm font-bold tracking-tight">@{profile.username}</p>
                  </div>
                  {session && !isSelf && !friendSent && (
                    <button
                      onClick={handleSendFriendRequest}
                      className="inline-flex items-center justify-center gap-2 px-3 py-1.5 rounded-xl bg-primary text-background text-xs font-bold hover:opacity-90 transition-all cursor-pointer"
                    >
                      <UserPlus size={14} />
                      Add Friend
                    </button>
                  )}
                  {friendSent && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary/10 text-primary text-xs font-bold border border-primary/20">
                      <Check size={14} />
                      Request Sent
                    </span>
                  )}
                </div>
                
                <p className="text-secondary text-sm flex items-center justify-center md:justify-start gap-2">
                  <Calendar size={14} />
                  Joined {new Date(profile.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                </p>

                <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 mt-2 text-xs font-bold uppercase tracking-widest text-secondary/60">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-secondary/40 mb-1">Started</span>
                    <span className="text-text">{profile.testsStarted}</span>
                  </div>
                  <div className="w-px h-6 bg-gray-900 hidden md:block" />
                  <div className="flex flex-col">
                    <span className="text-[10px] text-secondary/40 mb-1">Completed</span>
                    <span className="text-text">{profile.testsCompleted}</span>
                  </div>
                  <div className="w-px h-6 bg-gray-900 hidden md:block" />
                  <div className="flex flex-col">
                    <span className="text-[10px] text-secondary/40 mb-1">Time</span>
                    <span className="text-text">{formatTime(profile.timeTyping)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Leaderboard snapshot */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-2xl bg-surface border border-gray-900/50 p-6 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 text-primary/10 group-hover:text-primary/20 transition-colors">
                <Trophy size={64} />
              </div>
              <h3 className="text-[11px] font-bold text-secondary uppercase tracking-widest mb-6 flex items-center gap-2">
                <TrendingUp size={14} className="text-primary" /> English 15s Best
              </h3>
              <div className="relative">
                <span className="text-4xl font-black text-text tracking-tighter">
                  {pbs["time|15"] ? Math.round(pbs["time|15"].wpm) : "-"}
                </span>
                <span className="ml-2 text-sm font-bold text-secondary uppercase tracking-widest">WPM</span>
                <div className="mt-2 text-sm font-medium text-primary">
                  {pbs["time|15"] ? `${Math.round(pbs["time|15"].accuracy)}% accuracy` : "No record"}
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-surface border border-gray-900/50 p-6 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 text-primary/10 group-hover:text-primary/20 transition-colors">
                <Award size={64} />
              </div>
              <h3 className="text-[11px] font-bold text-secondary uppercase tracking-widest mb-6 flex items-center gap-2">
                <TrendingUp size={14} className="text-primary" /> English 60s Best
              </h3>
              <div className="relative">
                <span className="text-4xl font-black text-text tracking-tighter">
                  {pbs["time|60"] ? Math.round(pbs["time|60"].wpm) : "-"}
                </span>
                <span className="ml-2 text-sm font-bold text-secondary uppercase tracking-widest">WPM</span>
                <div className="mt-2 text-sm font-medium text-primary">
                  {pbs["time|60"] ? `${Math.round(pbs["time|60"].accuracy)}% accuracy` : "No record"}
                </div>
              </div>
            </div>
          </div>

          {/* PB Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <section className="rounded-2xl bg-surface border border-gray-900/50 p-6 shadow-sm">
              <h3 className="text-[11px] font-bold text-secondary uppercase tracking-widest mb-6 flex items-center gap-2">
                <Clock size={14} className="text-primary" /> Time Breakdown
              </h3>
              <div className="space-y-2">
                {PB_TIMES.map(({ label, key }) => {
                  const pb = pbs[key];
                  return (
                    <div key={key} className="flex items-center justify-between p-3 rounded-xl hover:bg-background/50 transition-colors border border-transparent hover:border-gray-900/50 group">
                      <span className="text-sm font-medium text-secondary group-hover:text-text">{label}</span>
                      <div className="flex items-center gap-4">
                        <span className="text-sm font-bold text-text">{pb ? `${Math.round(pb.wpm)} wpm` : "-"}</span>
                        <span className="text-xs text-secondary/50 font-medium">{pb ? `${Math.round(pb.accuracy)}%` : "-"}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="rounded-2xl bg-surface border border-gray-900/50 p-6 shadow-sm">
              <h3 className="text-[11px] font-bold text-secondary uppercase tracking-widest mb-6 flex items-center gap-2">
                <Activity size={14} className="text-primary" /> Words Breakdown
              </h3>
              <div className="space-y-2">
                {PB_WORDS.map(({ label, key }) => {
                  const pb = pbs[key];
                  return (
                    <div key={key} className="flex items-center justify-between p-3 rounded-xl hover:bg-background/50 transition-colors border border-transparent hover:border-gray-900/50 group">
                      <span className="text-sm font-medium text-secondary group-hover:text-text">{label} words</span>
                      <div className="flex items-center gap-4">
                        <span className="text-sm font-bold text-text">{pb ? `${Math.round(pb.wpm)} wpm` : "-"}</span>
                        <span className="text-xs text-secondary/50 font-medium">{pb ? `${Math.round(pb.accuracy)}%` : "-"}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>

          {/* Recent Tests Speed Chart */}
          {recentTests.length > 0 && (
            <section className="rounded-2xl bg-surface border border-gray-900/50 p-6 shadow-sm">
              <h3 className="text-[11px] font-bold text-secondary uppercase tracking-widest mb-6 flex items-center gap-2">
                <Activity size={14} className="text-primary" /> Recent Performance
              </h3>
              <RecentTestsChart tests={recentTests} />
            </section>
          )}

          {/* Test Activity Heatmap */}
          <section className="rounded-2xl bg-surface border border-gray-900/50 p-6 shadow-sm">
            <h3 className="text-[11px] font-bold text-secondary uppercase tracking-widest mb-6 flex items-center gap-2">
              <Calendar size={14} className="text-primary" /> Activity Map
            </h3>
            {activity.length === 0 ? (
              <div className="py-12 flex flex-col items-center justify-center gap-2 text-secondary/40 italic text-sm">
                No activity records found.
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <div className="flex gap-[3px] flex-wrap justify-center">
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
                          className="w-[11px] h-[11px] rounded-[2px] cursor-default transition-all hover:scale-150 hover:z-10"
                          style={{ 
                            backgroundColor: count === 0 ? 'var(--secondary)' : 'var(--primary)',
                            opacity: opacity 
                          }}
                          title={`${key}: ${count} tests${day ? `, avg ${Math.round(day.avgWpm)} wpm` : ""}`}
                        />
                      );
                    }
                    return cells;
                  })()}
                </div>
                <div className="flex justify-between items-center px-4 text-[10px] font-bold text-secondary uppercase tracking-widest">
                  <span>Last 12 Months</span>
                  <div className="flex items-center gap-2">
                    <span>Less</span>
                    <div className="flex gap-[2px]">
                       <div className="w-[10px] h-[10px] rounded-[2px] bg-secondary opacity-5" />
                       <div className="w-[10px] h-[10px] rounded-[2px] bg-primary opacity-20" />
                       <div className="w-[10px] h-[10px] rounded-[2px] bg-primary opacity-50" />
                       <div className="w-[10px] h-[10px] rounded-[2px] bg-primary opacity-80" />
                       <div className="w-[10px] h-[10px] rounded-[2px] bg-primary opacity-100" />
                    </div>
                    <span>More</span>
                  </div>
                </div>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}

function RecentTestsChart({ tests }: { tests: RecentTest[] }) {
  const sorted = [...tests].reverse();
  const maxWpm = Math.max(...sorted.map((t) => t.wpm), 1);
  const chartHeight = 120;

  return (
    <div className="flex flex-col gap-6">
      {/* SVG chart */}
      <div className="w-full bg-background/50 rounded-2xl border border-gray-900/50 p-6">
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
              stroke="currentColor"
              className="text-secondary/10"
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
            className="drop-shadow-[0_0_8px_rgba(var(--primary-rgb),0.5)]"
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
              className="cursor-pointer hover:r-4 transition-all"
            >
              <title>{`${Math.round(t.wpm)} wpm | ${Math.round(t.accuracy)}% acc`}</title>
            </circle>
          ))}
        </svg>
      </div>
      
      {/* List below chart */}
      <div className="space-y-3">
        {tests.map((t) => (
          <div key={t._id} className="flex items-center justify-between p-4 rounded-xl bg-background/30 border border-gray-900/30 group hover:border-primary/20 transition-all">
            <div className="flex flex-col">
              <span className="text-sm font-bold text-text capitalize">{t.mode} {t.mode2}</span>
              <span className="text-[10px] text-secondary font-medium">{formatDate(t.timestamp)}</span>
            </div>
            <div className="flex items-center gap-8">
              <div className="flex flex-col items-end">
                <span className="text-lg font-bold text-primary">{Math.round(t.wpm)}</span>
                <span className="text-[9px] font-bold text-secondary uppercase tracking-tighter">WPM</span>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-lg font-bold text-text">{Math.round(t.accuracy)}%</span>
                <span className="text-[9px] font-bold text-secondary uppercase tracking-tighter">ACC</span>
              </div>
              <ChevronRight size={14} className="text-secondary/20 group-hover:text-primary transition-colors" />
            </div>
          </div>
        ))}
      </div>
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
