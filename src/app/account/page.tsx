"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback, useMemo } from "react";
import { XpProgressBar } from "@/components/features/XpProgressBar";
import { MAINTENANCE_MODE, showMaintenanceToast } from "@/lib/maintenance";
import {
  User,
  Mail,
  Calendar,
  Trophy,
  TrendingUp,
  Target,
  Clock,
  Zap,
  Download,
  History,
  Activity,
  Award,
  Flame,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface UserProfile {
  username: string;
  name: string | null;
  email: string;
  image?: string;
  createdAt?: string;
  streak?: number;
  maxStreak?: number;
  xp?: number;
}

interface Stats {
  testsStarted: number;
  testsCompleted: number;
  timeTyping: number;
  highestWpm: number;
  avgWpm: number;
  avgWpmLast10: number;
  highestRawWpm: number;
  avgRawWpm: number;
  avgRawWpmLast10: number;
  highestAccuracy: number;
  avgAccuracy: number;
  avgAccuracyLast10: number;
  highestConsistency: number;
  avgConsistency: number;
  avgConsistencyLast10: number;
}

interface PersonalBest {
  wpm: number;
  rawWpm: number;
  accuracy: number;
  consistency: number;
  timestamp: string;
}

interface ActivityDay {
  date: string;
  count: number;
  avgWpm: number;
}

interface ResultEntry {
  _id: string;
  wpm: number;
  rawWpm: number;
  accuracy: number;
  consistency: number;
  charStats: { correct: number; incorrect: number; extra: number; missed: number };
  mode: string;
  mode2: number | string;
  timestamp: string;
  isPb: boolean;
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

export default function AccountPage() {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (MAINTENANCE_MODE) {
      showMaintenanceToast();
      router.replace("/");
    }
  }, [router]);

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [pbs, setPbs] = useState<Record<string, PersonalBest>>({});
  const [results, setResults] = useState<ResultEntry[]>([]);
  const [activity, setActivity] = useState<Record<string, Record<string, number>>>({});
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [userRes, statsRes, pbsRes, resultsRes, activityRes] = await Promise.all([
        fetch("/api/users/me"),
        fetch("/api/users/me/stats"),
        fetch("/api/users/me/personal-bests"),
        fetch("/api/results?limit=25"),
        fetch("/api/users/me/activity"),
      ]);

      if (userRes.ok) {
        const { user } = await userRes.json();
        setProfile({
          username: user.username,
          name: user.name,
          email: user.email,
          image: user.image,
          createdAt: user.createdAt,
          streak: user.streak,
          maxStreak: user.maxStreak,
          xp: user.xp,
        });
      }
      if (statsRes.ok) setStats(await statsRes.json());
      if (pbsRes.ok) {
        const { personalBests } = await pbsRes.json();
        setPbs(personalBests ?? {});
      }
      if (resultsRes.ok) {
        const { results: r } = await resultsRes.json();
        setResults(r);
      }
      if (activityRes.ok) {
        const { activity: a } = await activityRes.json();
        setActivity(a ?? {});
      }
    } catch (err) {
      console.error("Failed to fetch account data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleExportCsv = useCallback(async () => {
    setExporting(true);
    try {
      const res = await fetch("/api/results/export");
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "kreotype-results.csv";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("CSV export failed:", err);
    } finally {
      setExporting(false);
    }
  }, []);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }
    if (status === "authenticated") {
      fetchData();
    }
  }, [status, router, fetchData]);

  const activityMap = useMemo(() => {
    const map = new Map<string, ActivityDay>();
    const pad = (n: number) => String(n).padStart(2, "0");
    const toLocalDate = (d: Date) =>
      `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    for (const [year, days] of Object.entries(activity)) {
      for (const [dayOfYear, count] of Object.entries(days)) {
        const d = new Date(Number(year), 0);
        d.setDate(Number(dayOfYear));
        const key = toLocalDate(d);
        map.set(key, { date: key, count, avgWpm: 0 });
      }
    }
    return map;
  }, [activity]);

  if (MAINTENANCE_MODE) return null;

  if (status === "loading" || loading) {
    return (
      <div className="w-full max-w-5xl mx-auto px-6 py-12">
        <div className="flex flex-col gap-8">
          <div className="h-32 rounded-2xl bg-surface animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="h-48 rounded-2xl bg-surface animate-pulse" />
            <div className="h-48 rounded-2xl bg-surface animate-pulse" />
            <div className="h-48 rounded-2xl bg-surface animate-pulse" />
          </div>
          <div className="h-64 rounded-2xl bg-surface animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1500px] mx-auto flex flex-col gap-10 px-6 py-12">
      {/* Profile Header */}
      <div className="relative overflow-hidden rounded-3xl bg-surface border border-surface p-8">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl" />
        
        <div className="relative flex flex-col md:flex-row items-center md:items-start gap-8">
          <div className="relative group">
            <div className="w-24 h-24 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 overflow-hidden shadow-2xl shadow-primary/10">
              {profile?.image ? (
                <img src={profile.image} alt="" className="w-full h-full object-cover" />
              ) : (
                <User size={40} />
              )}
            </div>
          </div>
          
          <div className="flex flex-col gap-4 flex-1 text-center md:text-left">
            <div>
              <h1 className="text-3xl font-bold text-text tracking-tight mb-1">{profile?.name || "Anonymous"}</h1>
              <p className="text-primary text-sm font-bold tracking-tight mb-2">@{profile?.username ?? "username"}</p>
              <p className="text-secondary text-[11px] font-medium flex items-center justify-center md:justify-start gap-2 uppercase tracking-widest opacity-70">
                <Mail size={12} />
                {profile?.email ?? "no email"}
              </p>
            </div>
            
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 text-xs font-bold uppercase tracking-widest text-secondary/60">
              <div className="flex items-center gap-2 bg-background/50 px-3 py-1.5 rounded-full border border-surface">
                <Calendar size={14} className="text-primary" />
                <span>Joined {profile?.createdAt ? formatDate(profile.createdAt) : "Recently"}</span>
              </div>
              <div className="flex items-center gap-2 bg-background/50 px-3 py-1.5 rounded-full border border-surface">
                <Flame size={14} className="text-primary" />
                <span>{profile?.streak ?? 0} Day Streak</span>
              </div>
              <div className="flex items-center gap-2 bg-background/50 px-3 py-1.5 rounded-full border border-surface">
                <Activity size={14} className="text-primary" />
                <span>{stats?.testsCompleted ?? 0} Tests</span>
              </div>
              <div className="flex items-center gap-2 bg-background/50 px-3 py-1.5 rounded-full border border-surface">
                <Clock size={14} className="text-primary" />
                <span>{stats ? formatTime(stats.timeTyping) : "0s"} Typing</span>
              </div>
            </div>

            {profile?.xp !== undefined && (
              <div className="mt-4">
                <XpProgressBar xp={profile.xp} />
              </div>
            )}
          </div>

          <div className="flex flex-col items-center md:items-end gap-2">
             <button 
                onClick={() => router.push("/account-settings")}
                className="px-4 py-2 bg-surface hover:bg-surface-hover text-text text-xs font-bold rounded-xl transition-all border border-surface cursor-pointer"
             >
                Edit Profile
             </button>
          </div>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Speed Stats */}
        <div className="rounded-2xl bg-surface border border-surface p-6 flex flex-col gap-6 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Zap size={18} />
            </div>
            <h2 className="text-[11px] font-bold text-secondary uppercase tracking-widest">Speed Performance</h2>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <StatItem label="Highest WPM" value={stats?.highestWpm} icon={<Trophy size={14} />} primary />
            <StatItem label="Average WPM" value={stats?.avgWpm} icon={<TrendingUp size={14} />} />
            <StatItem label="Highest Raw" value={stats?.highestRawWpm} />
            <StatItem label="Avg Raw" value={stats?.avgRawWpm} />
          </div>
        </div>

        {/* Accuracy Stats */}
        <div className="rounded-2xl bg-surface border border-surface p-6 flex flex-col gap-6 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Target size={18} />
            </div>
            <h2 className="text-[11px] font-bold text-secondary uppercase tracking-widest">Accuracy & Quality</h2>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <StatItem label="Highest Acc" value={`${stats?.highestAccuracy}%`} icon={<Award size={14} />} primary />
            <StatItem label="Average Acc" value={`${stats?.avgAccuracy}%`} />
            <StatItem label="Consistency" value={`${stats?.avgConsistency}%`} />
            <StatItem label="Last 10 Avg" value={`${stats?.avgAccuracyLast10}%`} />
          </div>
        </div>

        {/* Personal Bests Card */}
        <div className="rounded-2xl bg-surface border border-surface p-6 flex flex-col gap-6 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Trophy size={18} />
            </div>
            <h2 className="text-[11px] font-bold text-secondary uppercase tracking-widest">All-Time Bests</h2>
          </div>
          
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center bg-background/50 p-3 rounded-xl border border-surface">
              <div className="flex flex-col">
                <span className="text-[10px] text-secondary uppercase font-bold tracking-wider">Time 15s</span>
                <span className="text-xl font-bold text-text">{pbs["time|15"] ? Math.round(pbs["time|15"].wpm) : "-"} <span className="text-[10px] text-secondary font-normal">wpm</span></span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-secondary uppercase font-bold tracking-wider">Acc</span>
                <div className="text-sm font-bold text-primary">{pbs["time|15"] ? `${Math.round(pbs["time|15"].accuracy)}%` : "-"}</div>
              </div>
            </div>

            <div className="flex justify-between items-center bg-background/50 p-3 rounded-xl border border-surface">
              <div className="flex flex-col">
                <span className="text-[10px] text-secondary uppercase font-bold tracking-wider">Time 60s</span>
                <span className="text-xl font-bold text-text">{pbs["time|60"] ? Math.round(pbs["time|60"].wpm) : "-"} <span className="text-[10px] text-secondary font-normal">wpm</span></span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-secondary uppercase font-bold tracking-wider">Acc</span>
                <div className="text-sm font-bold text-primary">{pbs["time|60"] ? `${Math.round(pbs["time|60"].accuracy)}%` : "-"}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* PB Detailed Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <section className="rounded-2xl bg-surface border border-surface p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-[11px] font-bold text-secondary uppercase tracking-widest flex items-center gap-2">
              <Clock size={14} className="text-primary" /> Time Personal Bests
            </h3>
          </div>
          <div className="space-y-3">
            {PB_TIMES.map(({ label, key }) => {
              const pb = pbs[key];
              return (
                <div key={key} className="flex items-center justify-between group p-2 hover:bg-background/50 rounded-xl transition-all border border-transparent hover:border-surface">
                  <span className="text-sm font-medium text-secondary group-hover:text-text transition-colors">{label}</span>
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-bold text-text">
                      {pb ? `${Math.round(pb.wpm)} wpm` : "-"}
                    </span>
                    <span className="text-xs text-secondary/60">
                      {pb ? `${Math.round(pb.accuracy)}%` : "-"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="rounded-2xl bg-surface border border-surface p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-[11px] font-bold text-secondary uppercase tracking-widest flex items-center gap-2">
              <History size={14} className="text-primary" /> Word Personal Bests
            </h3>
          </div>
          <div className="space-y-3">
            {PB_WORDS.map(({ label, key }) => {
              const pb = pbs[key];
              return (
                <div key={key} className="flex items-center justify-between group p-2 hover:bg-background/50 rounded-xl transition-all border border-transparent hover:border-surface">
                  <span className="text-sm font-medium text-secondary group-hover:text-text transition-colors">{label} Words</span>
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-bold text-text">
                      {pb ? `${Math.round(pb.wpm)} wpm` : "-"}
                    </span>
                    <span className="text-xs text-secondary/60">
                      {pb ? `${Math.round(pb.accuracy)}%` : "-"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {/* Daily Streak Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-2xl bg-surface border border-surface p-5 flex flex-col gap-2 shadow-sm">
          <div className="flex items-center gap-2 text-[10px] font-bold text-secondary uppercase tracking-widest">
            <Flame size={13} className="text-orange-400" /> Current Streak
          </div>
          <div className="text-3xl font-bold text-text tabular-nums">{profile?.streak ?? 0}</div>
          <div className="text-[10px] text-secondary/60 font-medium">consecutive days</div>
        </div>
        <div className="rounded-2xl bg-surface border border-surface p-5 flex flex-col gap-2 shadow-sm">
          <div className="flex items-center gap-2 text-[10px] font-bold text-secondary uppercase tracking-widest">
            <Trophy size={13} className="text-primary" /> Best Streak
          </div>
          <div className="text-3xl font-bold text-text tabular-nums">{profile?.maxStreak ?? 0}</div>
          <div className="text-[10px] text-secondary/60 font-medium">consecutive days</div>
        </div>
        <div className="rounded-2xl bg-surface border border-surface p-5 flex flex-col gap-2 shadow-sm">
          <div className="flex items-center gap-2 text-[10px] font-bold text-secondary uppercase tracking-widest">
            <Activity size={13} className="text-green-400" /> Active Days (30d)
          </div>
          <div className="text-3xl font-bold text-text tabular-nums">
            {(() => {
              const today = new Date();
              const pad = (n: number) => String(n).padStart(2, "0");
              const toLocalDate = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
              let count = 0;
              for (let i = 0; i < 30; i++) {
                const d = new Date(today);
                d.setDate(d.getDate() - i);
                if (activityMap.has(toLocalDate(d))) count++;
              }
              return count;
            })()}
          </div>
          <div className="text-[10px] text-secondary/60 font-medium">days in last 30 days</div>
        </div>
        <div className="rounded-2xl bg-surface border border-surface p-5 flex flex-col gap-2 shadow-sm">
          <div className="flex items-center gap-2 text-[10px] font-bold text-secondary uppercase tracking-widest">
            <Activity size={13} className="text-green-400" /> Active Days (1yr)
          </div>
          <div className="text-3xl font-bold text-text tabular-nums">
            {(() => {
              const today = new Date();
              const pad = (n: number) => String(n).padStart(2, "0");
              const toLocalDate = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
              let count = 0;
              for (let i = 0; i < 365; i++) {
                const d = new Date(today);
                d.setDate(d.getDate() - i);
                if (activityMap.has(toLocalDate(d))) count++;
              }
              return count;
            })()}
          </div>
          <div className="text-[10px] text-secondary/60 font-medium">days in last 12 months</div>
        </div>
      </div>

      {/* Active Days Heatmap */}
      <section className="rounded-2xl bg-surface border border-surface p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-[11px] font-bold text-secondary uppercase tracking-widest flex items-center gap-2">
            <Calendar size={14} className="text-green-400" /> Active Days
          </h3>
          <span className="text-[10px] text-secondary/50 font-bold uppercase tracking-widest">Last 12 Months</span>
        </div>

        {activityMap.size === 0 ? (
          <div className="py-12 flex flex-col items-center justify-center gap-2 text-secondary/40 italic text-sm">
            No activity yet. Complete a test to start tracking your active days.
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="flex gap-[3px] flex-wrap justify-center">
              {(() => {
                const today = new Date();
                const cells = [];
                const pad = (n: number) => String(n).padStart(2, "0");
                const toLocalDate = (d: Date) =>
                  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
                for (let i = 364; i >= 0; i--) {
                  const d = new Date(today);
                  d.setDate(d.getDate() - i);
                  const key = toLocalDate(d);
                  const day = activityMap.get(key);
                  const count = day?.count ?? 0;
                  const opacity = count === 0 ? 0.05 : Math.min(0.2 + count * 0.15, 1);
                  cells.push(
                    <div
                      key={key}
                      className="w-[11px] h-[11px] rounded-[2px] cursor-default transition-all hover:scale-150 hover:z-10"
                      style={{
                        backgroundColor: count === 0 ? 'var(--color-secondary)' : '#4ade80',
                        opacity,
                      }}
                      title={`${key}: ${count} test${count !== 1 ? 's' : ''}`}
                    />
                  );
                }
                return cells;
              })()}
            </div>
            <div className="flex justify-between items-center px-4 text-[10px] font-bold text-secondary uppercase tracking-widest">
              <span>Each cell = 1 day</span>
              <div className="flex items-center gap-2">
                <span>Less</span>
                <div className="flex gap-[2px]">
                  <div className="w-[10px] h-[10px] rounded-[2px]" style={{ backgroundColor: 'var(--color-secondary)', opacity: 0.05 }} />
                  <div className="w-[10px] h-[10px] rounded-[2px]" style={{ backgroundColor: '#4ade80', opacity: 0.2 }} />
                  <div className="w-[10px] h-[10px] rounded-[2px]" style={{ backgroundColor: '#4ade80', opacity: 0.5 }} />
                  <div className="w-[10px] h-[10px] rounded-[2px]" style={{ backgroundColor: '#4ade80', opacity: 0.8 }} />
                  <div className="w-[10px] h-[10px] rounded-[2px]" style={{ backgroundColor: '#4ade80', opacity: 1 }} />
                </div>
                <span>More</span>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Result history */}
      <section className="rounded-2xl bg-surface border border-surface overflow-hidden shadow-sm">
        <div className="p-6 border-b border-surface flex items-center justify-between bg-surface/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <History size={18} />
            </div>
            <h2 className="text-[11px] font-bold text-secondary uppercase tracking-widest">Result History</h2>
          </div>
          <button
            onClick={handleExportCsv}
            disabled={exporting}
            className="flex items-center gap-2 px-3 py-1.5 bg-background border border-surface rounded-lg text-[10px] font-bold text-secondary hover:text-text transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download size={12} className={exporting ? "animate-pulse" : ""} />
            {exporting ? "EXPORTING..." : "EXPORT CSV"}
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-background/50 text-[10px] font-bold text-secondary uppercase tracking-widest">
                <th className="px-4 md:px-6 py-4">WPM</th>
                <th className="hidden sm:table-cell px-6 py-4">Raw</th>
                <th className="px-4 md:px-6 py-4">Acc</th>
                <th className="hidden md:table-cell px-6 py-4">Consistency</th>
                <th className="hidden lg:table-cell px-6 py-4">Chars</th>
                <th className="px-4 md:px-6 py-4">Mode</th>
                <th className="hidden sm:table-cell px-6 py-4 text-right">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-900/30">
              {results.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-secondary text-sm italic">
                    No results yet. Complete a test to see your history.
                  </td>
                </tr>
              ) : (
                results?.map((r) => (
                  <tr
                    key={r._id}
                    className={cn(
                      "hover:bg-primary/[0.02] transition-colors group cursor-default",
                      r.isPb ? "bg-primary/[0.03]" : ""
                    )}
                  >
                    <td className="px-4 md:px-6 py-4">
                      <div className="flex flex-col">
                        <span className={cn("text-base md:text-lg font-bold", r.isPb ? "text-primary" : "text-text")}>
                          {Math.round(r.wpm)}
                        </span>
                        {r.isPb && <span className="text-[8px] md:text-[9px] font-bold text-primary uppercase tracking-tighter">PB</span>}
                      </div>
                    </td>
                    <td className="hidden sm:table-cell px-6 py-4 text-sm text-secondary font-medium">{Math.round(r.rawWpm)}</td>
                    <td className="px-4 md:px-6 py-4 text-sm text-text font-bold">{Math.round(r.accuracy)}%</td>
                    <td className="hidden md:table-cell px-6 py-4 text-sm text-secondary">{Math.round(r.consistency)}%</td>
                    <td className="hidden lg:table-cell px-6 py-4 text-xs font-mono text-secondary">
                      <span className="text-text">{r.charStats.correct}</span>/
                      <span className="text-error">{r.charStats.incorrect}</span>/
                      <span className="text-secondary/60">{r.charStats.extra}</span>/
                      <span className="text-secondary/60">{r.charStats.missed}</span>
                    </td>
                    <td className="px-4 md:px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-[10px] md:text-xs font-bold text-text capitalize">{r.mode}</span>
                        <span className="text-[8px] md:text-[10px] text-secondary">{r.mode2}</span>
                      </div>
                    </td>
                    <td className="hidden sm:table-cell px-6 py-4 text-right text-[10px] md:text-xs text-secondary font-medium">{formatDate(r.timestamp)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function StatItem({ label, value, icon, primary }: { label: string; value: string | number | undefined; icon?: React.ReactNode; primary?: boolean }) {
  return (
    <div className="flex flex-col gap-1">
      <div className="text-[10px] font-bold text-secondary uppercase tracking-wider flex items-center gap-1.5">
        {icon}
        {label}
      </div>
      <div className={cn(
        "text-2xl font-bold tracking-tight",
        primary ? "text-primary" : "text-text"
      )}>
        {value ?? "-"}
      </div>
    </div>
  );
}

