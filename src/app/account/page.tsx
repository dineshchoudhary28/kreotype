"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";

interface UserProfile {
  username: string;
  email: string;
  image?: string;
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

function formatDate(ts: string): string {
  return new Date(ts).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function AccountPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [pbs, setPbs] = useState<Record<string, PersonalBest>>({});
  const [results, setResults] = useState<ResultEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [userRes, statsRes, pbsRes, resultsRes] = await Promise.all([
        fetch("/api/users/me"),
        fetch("/api/users/me/stats"),
        fetch("/api/users/me/personal-bests"),
        fetch("/api/results?limit=25"),
      ]);

      if (userRes.ok) {
        const { user } = await userRes.json();
        setProfile({ username: user.username, email: user.email, image: user.image });
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
    } catch (err) {
      console.error("Failed to fetch account data:", err);
    } finally {
      setLoading(false);
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

  if (status === "loading" || loading) {
    return (
      <div className="w-full max-w-4xl mx-auto px-4 py-8">
        <div className="flex flex-col gap-6">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 rounded bg-secondary bg-opacity-10 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const statFields = stats
    ? [
        { title: "tests started", value: stats.testsStarted },
        { title: "tests completed", value: stats.testsCompleted },
        { title: "time typing", value: formatTime(stats.timeTyping) },
        { title: "highest wpm", value: stats.highestWpm },
        { title: "average wpm", value: stats.avgWpm },
        { title: "average wpm (last 10)", value: stats.avgWpmLast10 },
        { title: "highest raw wpm", value: stats.highestRawWpm },
        { title: "average raw wpm", value: stats.avgRawWpm },
        { title: "average raw wpm (last 10)", value: stats.avgRawWpmLast10 },
        { title: "highest accuracy", value: `${stats.highestAccuracy}%` },
        { title: "avg accuracy", value: `${stats.avgAccuracy}%` },
        { title: "avg accuracy (last 10)", value: `${stats.avgAccuracyLast10}%` },
        { title: "highest consistency", value: `${stats.highestConsistency}%` },
        { title: "avg consistency", value: `${stats.avgConsistency}%` },
        { title: "avg consistency (last 10)", value: `${stats.avgConsistencyLast10}%` },
      ]
    : [];

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-8 px-4 py-8">
      {/* Profile Details */}
      <div className="flex items-start gap-6">
        <div className="w-16 h-16 rounded-full bg-secondary bg-opacity-20 flex items-center justify-center text-secondary overflow-hidden">
          {profile?.image ? (
            <img src={profile.image} alt="" className="w-full h-full object-cover" />
          ) : (
            "?"
          )}
        </div>
        <div className="flex flex-col gap-1 flex-1">
          <div className="text-lg text-text">{profile?.username ?? "-"}</div>
          <div className="text-xs text-secondary">{profile?.email ?? "-"}</div>
          <div className="flex gap-6 mt-2 text-xs text-secondary">
            <div>
              <div>tests started</div>
              <div className="text-text">{stats?.testsStarted ?? "-"}</div>
            </div>
            <div>
              <div>tests completed</div>
              <div className="text-text">{stats?.testsCompleted ?? "-"}</div>
            </div>
            <div>
              <div>time typing</div>
              <div className="text-text">{stats ? formatTime(stats.timeTyping) : "-"}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Leaderboard positions */}
      <section>
        <h3 className="text-sm text-primary mb-3">
          All-Time English Leaderboards
        </h3>
        <div className="flex gap-6 text-xs">
          <div>
            <div className="text-secondary">15 seconds</div>
            <div className="text-text">
              {pbs["time|15"] ? `${pbs["time|15"].wpm} wpm` : "-"}
            </div>
          </div>
          <div>
            <div className="text-secondary">60 seconds</div>
            <div className="text-text">
              {pbs["time|60"] ? `${pbs["time|60"].wpm} wpm` : "-"}
            </div>
          </div>
        </div>
      </section>

      {/* Personal Bests */}
      <div className="grid grid-cols-2 gap-6">
        <section>
          <h3 className="text-sm text-secondary mb-2">time PBs</h3>
          <div className="flex flex-col gap-2">
            {PB_TIMES.map(({ label, key }) => {
              const pb = pbs[key];
              return (
                <div key={key} className="flex justify-between text-xs">
                  <span className="text-secondary">{label}</span>
                  <span className="text-text">
                    {pb ? `${Math.round(pb.wpm)} wpm / ${Math.round(pb.accuracy)}% acc` : "- wpm / - acc"}
                  </span>
                </div>
              );
            })}
          </div>
        </section>
        <section>
          <h3 className="text-sm text-secondary mb-2">words PBs</h3>
          <div className="flex flex-col gap-2">
            {PB_WORDS.map(({ label, key }) => {
              const pb = pbs[key];
              return (
                <div key={key} className="flex justify-between text-xs">
                  <span className="text-secondary">{label}</span>
                  <span className="text-text">
                    {pb ? `${Math.round(pb.wpm)} wpm / ${Math.round(pb.accuracy)}% acc` : "- wpm / - acc"}
                  </span>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {/* Test Activity */}
      <section>
        <h3 className="text-sm text-secondary mb-2">test activity</h3>
        <div className="h-24 rounded bg-secondary bg-opacity-5 flex items-center justify-center text-xs text-secondary">
          {results.length === 0 ? "No data found." : `${results.length} recent tests`}
        </div>
      </section>

      {/* Charts placeholder */}
      <section>
        <h3 className="text-sm text-secondary mb-2">account history</h3>
        <div className="h-48 rounded bg-secondary bg-opacity-5 flex items-center justify-center text-xs text-secondary">
          Chart will appear here when you have test results.
        </div>
      </section>

      {/* Stats grid */}
      <section>
        <div className="grid grid-cols-3 gap-4">
          {statFields.map((stat) => (
            <div key={stat.title} className="text-xs">
              <div className="text-secondary">{stat.title}</div>
              <div className="text-lg text-text">{stat.value}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Result history */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm text-secondary">result history</h3>
          <button className="text-xs text-secondary hover:text-text transition-colors opacity-50 cursor-not-allowed" disabled>
            Export CSV
          </button>
        </div>
        <table className="w-full text-xs">
          <thead>
            <tr className="text-secondary border-b border-secondary border-opacity-20">
              <td className="py-2">wpm</td>
              <td className="py-2">raw</td>
              <td className="py-2">accuracy</td>
              <td className="py-2">consistency</td>
              <td className="py-2">chars</td>
              <td className="py-2">mode</td>
              <td className="py-2">info</td>
              <td className="py-2">date</td>
            </tr>
          </thead>
          <tbody>
            {results.length === 0 ? (
              <tr className="text-secondary text-center">
                <td colSpan={8} className="py-8">
                  No results yet. Complete a test to see your history.
                </td>
              </tr>
            ) : (
              results.map((r) => (
                <tr
                  key={r._id}
                  className={`border-b border-secondary border-opacity-10 ${r.isPb ? "text-primary" : "text-text"}`}
                >
                  <td className="py-2">{Math.round(r.wpm)}</td>
                  <td className="py-2">{Math.round(r.rawWpm)}</td>
                  <td className="py-2">{Math.round(r.accuracy)}%</td>
                  <td className="py-2">{Math.round(r.consistency)}%</td>
                  <td className="py-2">
                    {r.charStats.correct}/{r.charStats.incorrect}/{r.charStats.extra}/{r.charStats.missed}
                  </td>
                  <td className="py-2">{r.mode}</td>
                  <td className="py-2">{r.mode2}</td>
                  <td className="py-2">{formatDate(r.timestamp)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
}
