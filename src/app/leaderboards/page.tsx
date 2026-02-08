"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { ExternalLink } from "lucide-react";

type LeaderboardType = "allTime" | "weekly" | "daily";
type TimeMode = "15" | "60";

interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  image: string | null;
  wpm: number;
  rawWpm: number;
  accuracy: number;
  consistency: number;
  timestamp: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

const CACHE_TTL: Record<LeaderboardType, number> = {
  allTime: 300,
  daily: 120,
  weekly: 120,
};

function formatDate(ts: string): string {
  return new Date(ts).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
}

export default function LeaderboardsPage() {
  const { data: session } = useSession();
  const [type, setType] = useState<LeaderboardType>("allTime");
  const [timeMode, setTimeMode] = useState<TimeMode>("15");
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 50, total: 0, pages: 0 });
  const [userRank, setUserRank] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [countdown, setCountdown] = useState(0);
  const countdownRef = useRef<ReturnType<typeof setInterval>>(undefined);

  const fetchLeaderboard = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        type,
        mode: "time",
        mode2: timeMode,
        page: String(page),
        limit: "50",
      });
      const res = await fetch(`/api/leaderboards?${params}`);
      if (res.ok) {
        const data = await res.json();
        setEntries(data.leaderboard);
        setPagination(data.pagination);
        setUserRank(data.userRank ?? null);
      }
    } catch (err) {
      console.error("Failed to fetch leaderboard:", err);
    } finally {
      setLoading(false);
    }
  }, [type, timeMode]);

  useEffect(() => {
    fetchLeaderboard(1);
  }, [fetchLeaderboard]);

  useEffect(() => {
    const ttl = CACHE_TTL[type];
    setCountdown(ttl);

    if (countdownRef.current) clearInterval(countdownRef.current);
    countdownRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          fetchLeaderboard(pagination.page);
          return ttl;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [type, fetchLeaderboard, pagination.page]);

  const goToPage = (page: number) => {
    if (page < 1 || page > pagination.pages) return;
    fetchLeaderboard(page);
  };

  const jumpToUser = () => {
    if (userRank === null) return;
    const page = Math.ceil(userRank / pagination.limit);
    goToPage(page);
  };

  return (
    <div className="w-full max-w-[1500px] mx-auto px-8 py-10 flex flex-col gap-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-surface pb-8">
        <div>
          <h1 className="text-3xl font-bold text-text mb-2 flex items-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
              <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
              <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
              <path d="M4 22h16" />
              <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
              <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
              <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
            </svg>
            Leaderboards
          </h1>
          <p className="text-secondary text-sm font-medium tracking-wide uppercase">
            {type === "allTime" && "All-Time English • "}
            {type === "weekly" && "Weekly XP • "}
            {type === "daily" && "Daily • "}
            Time {timeMode}s
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Type Selectors */}
          <div className="flex bg-surface p-1 rounded-xl border border-surface">
            {(["allTime", "weekly", "daily"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setType(t)}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all duration-200 ${
                  type === t
                    ? "bg-primary text-background shadow-lg shadow-primary/20"
                    : "text-secondary hover:text-text"
                }`}
              >
                {t === "allTime" ? "All-Time" : t === "weekly" ? "Weekly" : "Daily"}
              </button>
            ))}
          </div>

          <div className="w-px h-8 bg-surface mx-2 hidden md:block" />

          {/* Time Selectors */}
          <div className="flex bg-surface p-1 rounded-xl border border-surface">
            {(["15", "60"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setTimeMode(m)}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all duration-200 ${
                  timeMode === m
                    ? "bg-primary text-background shadow-lg shadow-primary/20"
                    : "text-secondary hover:text-text"
                }`}
              >
                {m}s
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Main Leaderboard Table */}
        <div className="flex-1 bg-surface/50 rounded-2xl border border-surface overflow-hidden backdrop-blur-sm">
          <div className="p-6 border-b border-surface flex justify-between items-center bg-surface/80">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-xs font-bold text-secondary uppercase tracking-widest">Live Rankings</span>
              <span className="text-[10px] text-secondary/60 font-mono">Refreshes in {countdown}s</span>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => goToPage(pagination.page - 1)}
                disabled={pagination.page <= 1}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-surface text-secondary hover:text-text hover:border-secondary disabled:opacity-20 transition-all"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
              </button>
              <div className="px-3 py-1 bg-surface rounded-lg text-[10px] font-bold text-secondary">
                PAGE {pagination.page} / {pagination.pages || 1}
              </div>
              <button
                onClick={() => goToPage(pagination.page + 1)}
                disabled={pagination.page >= pagination.pages}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-surface text-secondary hover:text-text hover:border-secondary disabled:opacity-20 transition-all"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface/30">
                  <th className="px-4 md:px-6 py-4 text-[10px] md:text-[11px] font-bold text-secondary uppercase tracking-wider w-12 md:w-16">Rank</th>
                  <th className="px-4 md:px-6 py-4 text-[10px] md:text-[11px] font-bold text-secondary uppercase tracking-wider">User</th>
                  <th className="px-4 md:px-6 py-4 text-[10px] md:text-[11px] font-bold text-secondary uppercase tracking-wider text-right">WPM</th>
                  <th className="px-4 md:px-6 py-4 text-[10px] md:text-[11px] font-bold text-secondary uppercase tracking-wider text-right">Acc</th>
                  <th className="hidden sm:table-cell px-6 py-4 text-[11px] font-bold text-secondary uppercase tracking-wider text-right">Raw</th>
                  <th className="hidden md:table-cell px-6 py-4 text-[11px] font-bold text-secondary uppercase tracking-wider text-right">Consistency</th>
                  <th className="hidden lg:table-cell px-6 py-4 text-[11px] font-bold text-secondary uppercase tracking-wider text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface/50">
                {loading ? (
                  [...Array(10)].map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      {[...Array(7)].map((_, j) => (
                        <td key={j} className={`px-4 md:px-6 py-4 ${j > 3 ? "hidden sm:table-cell" : ""}`}>
                          <div className="h-4 bg-surface rounded-md w-full" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : entries.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-secondary/20"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                        <p className="text-secondary font-medium text-sm">No records found for this category.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  entries.map((entry) => {
                    const isCurrentUser = session?.user?.id === entry.userId;
                    
                    return (
                      <tr
                        key={`${entry.userId}-${entry.rank}`}
                        className={`group transition-all duration-150 hover:bg-text/[0.02] ${
                          isCurrentUser ? "bg-primary/5" : ""
                        }`}
                      >
                        <td className="px-4 md:px-6 py-4">
                          <span className={`text-xs md:text-sm font-bold ${
                            entry.rank === 1 ? "text-yellow-500" :
                            entry.rank === 2 ? "text-gray-400" :
                            entry.rank === 3 ? "text-amber-700" :
                            "text-secondary/40"
                          }`}>
                            #{entry.rank}
                          </span>
                        </td>
                        <td className="px-4 md:px-6 py-4">
                          <div className="flex items-center gap-2 md:gap-3">
                            <div className={`w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center text-[9px] md:text-[10px] font-bold border ${
                              isCurrentUser ? "bg-primary border-primary text-background" : "bg-surface border-surface text-secondary"
                            }`}>
                              {entry.username.charAt(0).toUpperCase()}
                            </div>
                            <span className={`text-xs md:text-sm font-semibold truncate max-w-[80px] sm:max-w-none transition-colors ${
                              isCurrentUser ? "text-primary" : "text-text/80 group-hover:text-text"
                            }`}>
                              {entry.username}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 md:px-6 py-4 text-right">
                          <span className="text-xs md:text-sm font-bold text-text font-mono">{Math.round(entry.wpm)}</span>
                        </td>
                        <td className="px-4 md:px-6 py-4 text-right">
                          <span className="text-xs md:text-sm font-medium text-secondary font-mono">{Math.round(entry.accuracy)}%</span>
                        </td>
                        <td className="hidden sm:table-cell px-6 py-4 text-right">
                          <span className="text-sm font-medium text-secondary/60 font-mono">{Math.round(entry.rawWpm)}</span>
                        </td>
                        <td className="hidden md:table-cell px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <div className="w-12 h-1.5 bg-surface rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-secondary/30 rounded-full" 
                                style={{ width: `${entry.consistency}%` }}
                              />
                            </div>
                            <span className="text-[11px] font-medium text-secondary/60 font-mono w-8">{Math.round(entry.consistency)}%</span>
                          </div>
                        </td>
                        <td className="hidden lg:table-cell px-6 py-4 text-right">
                          <span className="text-[11px] font-medium text-secondary/40">{formatDate(entry.timestamp)}</span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          
          <div className="p-6 bg-surface/50 flex justify-between items-center text-xs text-secondary font-medium">
            <div>Showing results {((pagination.page - 1) * pagination.limit) + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}</div>
            <div className="flex items-center gap-4">
              <button onClick={jumpToUser} disabled={userRank === null} className="hover:text-primary transition-colors disabled:opacity-0">
                Jump to my rank (#{userRank})
              </button>
            </div>
          </div>
        </div>

        {/* Info Sidebar */}
        <div className="w-full lg:w-80 flex flex-col gap-6">
          {/* User Status Card */}
          {session?.user ? (
            <div className="bg-primary/10 border border-primary/20 rounded-2xl p-6 backdrop-blur-sm">
              <h3 className="text-sm font-bold text-primary uppercase tracking-widest mb-4">Your Performance</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-secondary font-medium">Current Rank</span>
                  <span className="text-xl font-bold text-text">#{userRank || "N/A"}</span>
                </div>
                <div className="w-full h-px bg-primary/20" />
                <p className="text-[11px] text-secondary leading-relaxed">
                  Your rank is calculated based on your highest WPM in the last 24 hours for the selected mode.
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-surface border border-surface rounded-2xl p-6 text-center">
              <div className="w-12 h-12 bg-background rounded-xl flex items-center justify-center mx-auto mb-4 border border-surface">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              </div>
              <h3 className="text-sm font-bold text-text mb-2">Sign in to rank</h3>
              <p className="text-xs text-secondary mb-4">Save your scores and compete with others on the global leaderboard.</p>
              <Link href="/login" className="block w-full py-2 bg-primary text-background text-xs font-bold rounded-lg hover:bg-primary/90 transition-colors">
                Sign In
              </Link>
            </div>
          )}

          {/* Advertisement Card */}
          <a
            href="https://kreo-tech.com"
            target="_blank"
            rel="noopener noreferrer"
            className="block"
          >
            <div className="relative group overflow-hidden rounded-[2rem] bg-surface border border-surface p-6 flex flex-col gap-6 min-h-[450px] cursor-pointer hover:border-primary/30 transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

              <div className="relative aspect-square rounded-2xl overflow-hidden bg-background/40">
                <img
                  src="https://cdn.shopify.com/s/files/1/0619/4325/1121/files/swarm_pass_through_material_file.bip.489.png?v=1763559972&width=1080"
                  alt="Swarm White Purple"
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                />
                <div className="absolute top-4 left-4 bg-primary text-background text-[8px] font-black px-2 py-1 rounded-full uppercase tracking-tighter shadow-lg shadow-primary/20 z-10">
                  Wireless Elite
                </div>
              </div>

              <div className="relative flex flex-col gap-3">
                <div className="flex flex-col gap-1">
                  <span className="text-primary text-[10px] font-black uppercase tracking-widest">Swarm Series</span>
                  <h4 className="text-xl font-black text-text uppercase tracking-tighter leading-tight">Swarm <span className="text-primary italic">White</span> Purple</h4>
                </div>
                <p className="text-secondary text-xs font-medium opacity-80 leading-relaxed">
                  Clean aesthetic meets mechanical precision. Tri-mode connectivity for seamless gaming.
                </p>
                <p className="text-primary/50 text-[10px] font-bold tracking-widest uppercase mt-1">
                  kreo-tech.com
                </p>

                <div className="flex items-center justify-end mt-2">
                  <div className="bg-primary text-background p-3 rounded-full group-hover:opacity-90 transition-all group-hover:scale-110 shadow-xl">
                    <ExternalLink className="w-4 h-4 md:w-4.5 md:h-4.5" />
                  </div>
                </div>
              </div>

              <div className="h-px w-full bg-secondary/10" />

              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="w-6 h-6 rounded-full border-2 border-surface bg-surface" />
                  ))}
                </div>
                <span className="text-[9px] text-secondary font-bold uppercase tracking-widest opacity-60">+200 reviews</span>
              </div>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
}
