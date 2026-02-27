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
  TrendingUp,
  Award,
  Flame,
  Zap
} from "lucide-react";
import { XpProgressBar } from "@/components/features/XpProgressBar";
import { cn } from "@/lib/utils";
import { MAINTENANCE_MODE, showMaintenanceToast } from "@/lib/maintenance";

interface ProfileUser {
  _id: string;
  username: string;
  name: string | null;
  image?: string;
  testsStarted: number;
  testsCompleted: number;
  timeTyping: number;
  personalBests: Record<string, { wpm: number; accuracy: number; consistency: number }>;
  badges: string[];
  streak: number;
  maxStreak: number;
  xp: number;
  createdAt: string;
  profileDetails?: {
    bio?: string;
    keyboard?: string;
    socialProfiles?: {
      twitter?: string;
      github?: string;
      website?: string;
    };
  };
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
    if (MAINTENANCE_MODE) {
      showMaintenanceToast();
      return;
    }
    if (authStatus === "authenticated" && session?.user?.name && !profile) {
      setUsername(session.user.name);
      loadProfile(session.user.name);
    }
  }, [authStatus, session, loadProfile, profile]);

  const handleSearch = async (e: FormEvent) => {
    e.preventDefault();
    if (MAINTENANCE_MODE) {
      showMaintenanceToast();
      return;
    }
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
            className="w-full pl-12 pr-4 py-3 bg-surface border border-surface rounded-2xl text-text outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all placeholder:text-secondary/50 text-sm"
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
        <div className="flex flex-col items-center justify-center py-20 text-center gap-4 bg-surface/30 rounded-3xl border border-dashed border-surface/50">
          <div className="p-4 rounded-full bg-surface border border-surface text-secondary/30">
            <User size={48} />
          </div>
          <div className="flex flex-col gap-1">
            <h2 className="text-lg font-bold text-text">
              {MAINTENANCE_MODE ? "Profiles unavailable" : "No profile selected"}
            </h2>
            <p className="text-sm text-secondary">
              {MAINTENANCE_MODE
                ? "Backend services are currently on hold. Core typing features remain available."
                : "Search for a user to see their typing performance."}
            </p>
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
          <div className="relative overflow-hidden rounded-3xl bg-surface border border-surface/50 p-8 shadow-sm">
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

                {profile.profileDetails?.bio && (
                  <p className="text-sm text-text mt-2">{profile.profileDetails.bio}</p>
                )}

                <div className="flex items-center gap-4 mt-2">
                  {profile.profileDetails?.keyboard && (
                    <div className="text-xs flex items-center gap-2">
                      <span className="font-bold">Keyboard:</span>
                      <span>{profile.profileDetails.keyboard}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    {profile.profileDetails?.socialProfiles?.twitter && (
                      <a href={profile.profileDetails.socialProfiles.twitter} target="_blank" rel="noopener noreferrer">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                      </a>
                    )}
                    {profile.profileDetails?.socialProfiles?.github && (
                      <a href={profile.profileDetails.socialProfiles.github} target="_blank" rel="noopener noreferrer">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.91 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                      </a>
                    )}
                    {profile.profileDetails?.socialProfiles?.website && (
                      <a href={profile.profileDetails.socialProfiles.website} target="_blank" rel="noopener noreferrer">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L8 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1h-2v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>
                      </a>
                    )}
                  </div>
                </div>

                {/* Streak & XP */}
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 mt-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Flame size={16} className="text-orange-400" />
                    <span className="font-bold text-text">{profile.streak}</span>
                    <span className="text-secondary text-xs">day streak</span>
                    {profile.maxStreak > 0 && (
                      <span className="text-secondary/50 text-xs">(best: {profile.maxStreak})</span>
                    )}
                  </div>
                  <div className="w-48">
                    <XpProgressBar xp={profile.xp} />
                  </div>
                </div>

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
            <div className="rounded-2xl bg-surface border border-surface/50 p-6 shadow-sm relative overflow-hidden group">
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

            <div className="rounded-2xl bg-surface border border-surface/50 p-6 shadow-sm relative overflow-hidden group">
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
            <section className="rounded-2xl bg-surface border border-surface/50 p-6 shadow-sm">
              <h3 className="text-[11px] font-bold text-secondary uppercase tracking-widest mb-6 flex items-center gap-2">
                <Clock size={14} className="text-primary" /> Time Breakdown
              </h3>
              <div className="space-y-2">
                {PB_TIMES.map(({ label, key }) => {
                  const pb = pbs[key];
                  return (
                    <div key={key} className="flex items-center justify-between p-3 rounded-xl hover:bg-background/50 transition-colors border border-transparent hover:border-surface/50 group">
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

            <section className="rounded-2xl bg-surface border border-surface/50 p-6 shadow-sm">
              <h3 className="text-[11px] font-bold text-secondary uppercase tracking-widest mb-6 flex items-center gap-2">
                <Activity size={14} className="text-primary" /> Words Breakdown
              </h3>
              <div className="space-y-2">
                {PB_WORDS.map(({ label, key }) => {
                  const pb = pbs[key];
                  return (
                    <div key={key} className="flex items-center justify-between p-3 rounded-xl hover:bg-background/50 transition-colors border border-transparent hover:border-surface/50 group">
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
            <section className="rounded-2xl bg-surface border border-surface/50 p-6 shadow-sm">
              <h3 className="text-[11px] font-bold text-secondary uppercase tracking-widest mb-6 flex items-center gap-2">
                <Activity size={14} className="text-primary" /> Recent Performance
              </h3>
              <RecentTestsChart tests={recentTests} />
            </section>
          )}

          {/* Test Activity Heatmap */}
          <section className="rounded-2xl bg-surface border border-surface/50 p-6 shadow-sm">
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
                            backgroundColor: count === 0 ? 'var(--color-secondary)' : 'var(--color-primary)',
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
      <div className="w-full bg-background/50 rounded-2xl border border-surface/50 p-6">
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
              stroke="var(--color-secondary)"
              strokeOpacity={0.1}
              strokeWidth={1}
            />
          ))}
          {/* WPM line */}
          <polyline
            fill="none"
            stroke="var(--color-primary)"
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
              fill="var(--color-primary)"
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
          <div key={t._id} className="flex items-center justify-between p-4 rounded-xl bg-background/30 border border-surface/30 group hover:border-primary/20 transition-all">
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
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

