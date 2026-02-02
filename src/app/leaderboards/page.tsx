"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";

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

  // Countdown timer
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
    <div className="w-full max-w-5xl mx-auto flex gap-6 px-4 py-8 font-mono">
      {/* Main table area */}
      <div className="flex-1">
        <h2 className="text-lg text-primary mb-1">
          {type === "allTime" && "All-Time English Leaderboard"}
          {type === "weekly" && "Weekly XP Leaderboard"}
          {type === "daily" && "Daily Leaderboard"}
        </h2>
        <div className="text-xs text-secondary mb-4">
          {type === "allTime" && `time ${timeMode}`}
        </div>

        {/* Navigation buttons */}
        <div className="flex items-center justify-between mb-4">
          <div className="text-xs text-secondary">Updates in: {countdown}s</div>
          <div className="flex gap-1">
            <button
              onClick={() => goToPage(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="px-2 py-1 rounded text-xs text-secondary hover:text-text transition-colors disabled:opacity-30"
            >
              ⟨
            </button>
            <button
              onClick={jumpToUser}
              disabled={userRank === null}
              className="px-2 py-1 rounded text-xs text-secondary hover:text-text transition-colors disabled:opacity-30"
              title={userRank !== null ? `Your rank: #${userRank}` : "Sign in to see your rank"}
            >
              #
            </button>
            <button
              onClick={() => goToPage(pagination.page + 1)}
              disabled={pagination.page >= pagination.pages}
              className="px-2 py-1 rounded text-xs text-secondary hover:text-text transition-colors disabled:opacity-30"
            >
              ⟩
            </button>
          </div>
        </div>

        {/* Table */}
        <table className="w-full text-sm">
          <thead>
            <tr className="text-secondary text-xs border-b border-secondary border-opacity-20">
              <td className="py-2 pr-3">#</td>
              <td className="py-2">name</td>
              {type !== "weekly" ? (
                <>
                  <td className="py-2 text-right">wpm</td>
                  <td className="py-2 text-right">accuracy</td>
                  <td className="py-2 text-right">raw</td>
                  <td className="py-2 text-right">consistency</td>
                </>
              ) : (
                <>
                  <td className="py-2 text-right">xp gained</td>
                  <td className="py-2 text-right">time typed</td>
                </>
              )}
              <td className="py-2 text-right">date</td>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              [...Array(10)].map((_, i) => (
                <tr key={i}>
                  <td colSpan={type !== "weekly" ? 7 : 5} className="py-3">
                    <div className="h-4 rounded bg-secondary bg-opacity-10 animate-pulse" />
                  </td>
                </tr>
              ))
            ) : entries.length === 0 ? (
              <tr className="text-secondary text-center">
                <td colSpan={type !== "weekly" ? 7 : 5} className="py-8">
                  No data available.
                </td>
              </tr>
            ) : (
              entries.map((entry) => {
                const isCurrentUser = session?.user?.id === entry.userId;
                return (
                  <tr
                    key={entry.userId}
                    className={`border-b border-secondary border-opacity-10 ${
                      isCurrentUser ? "text-primary bg-primary bg-opacity-5" : "text-text"
                    }`}
                  >
                    <td className="py-2 pr-3 text-secondary">{entry.rank}</td>
                    <td className="py-2">{entry.username}</td>
                    {type !== "weekly" ? (
                      <>
                        <td className="py-2 text-right">{Math.round(entry.wpm)}</td>
                        <td className="py-2 text-right">{Math.round(entry.accuracy)}%</td>
                        <td className="py-2 text-right">{Math.round(entry.rawWpm)}</td>
                        <td className="py-2 text-right">{Math.round(entry.consistency)}%</td>
                      </>
                    ) : (
                      <>
                        <td className="py-2 text-right">-</td>
                        <td className="py-2 text-right">-</td>
                      </>
                    )}
                    <td className="py-2 text-right">{formatDate(entry.timestamp)}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        {/* Pagination info */}
        {pagination.pages > 1 && (
          <div className="text-xs text-secondary mt-3 text-center">
            Page {pagination.page} of {pagination.pages} ({pagination.total} users)
          </div>
        )}
      </div>

      {/* Side buttons */}
      <div className="flex flex-col gap-3 w-48 shrink-0">
        <div className="flex flex-col gap-1">
          {(["allTime", "weekly", "daily"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setType(t)}
              className={`px-3 py-2 rounded text-xs text-left transition-all duration-150 hover:scale-105 active:scale-95 ${
                type === t
                  ? "bg-primary text-background"
                  : "text-secondary hover:text-text"
              }`}
            >
              {t === "allTime" && "all-time english"}
              {t === "weekly" && "weekly xp"}
              {t === "daily" && "daily"}
            </button>
          ))}
        </div>

        {type === "allTime" && (
          <>
            <div className="w-full h-px bg-secondary opacity-20" />
            <div className="flex flex-col gap-1">
              {(["15", "60"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setTimeMode(m)}
                  className={`px-3 py-2 rounded text-xs text-left transition-all duration-150 hover:scale-105 active:scale-95 ${
                    timeMode === m
                      ? "bg-primary text-background"
                      : "text-secondary hover:text-text"
                  }`}
                >
                  time {m}
                </button>
              ))}
            </div>
          </>
        )}

        {userRank !== null && (
          <>
            <div className="w-full h-px bg-secondary opacity-20" />
            <div className="text-xs text-secondary">
              your rank: <span className="text-primary">#{userRank}</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
