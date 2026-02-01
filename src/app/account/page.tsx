"use client";

const PB_TIMES = ["15 seconds", "30 seconds", "60 seconds", "120 seconds"];
const PB_WORDS = ["10 words", "25 words", "50 words", "100 words"];

const STAT_GROUPS = [
  { title: "tests started", value: "-" },
  { title: "tests completed", value: "-" },
  { title: "time typing", value: "-" },
  { title: "highest wpm", value: "-" },
  { title: "average wpm", value: "-" },
  { title: "average wpm (last 10)", value: "-" },
  { title: "highest raw wpm", value: "-" },
  { title: "average raw wpm", value: "-" },
  { title: "average raw wpm (last 10)", value: "-" },
  { title: "highest accuracy", value: "-" },
  { title: "avg accuracy", value: "-" },
  { title: "avg accuracy (last 10)", value: "-" },
  { title: "highest consistency", value: "-" },
  { title: "avg consistency", value: "-" },
  { title: "avg consistency (last 10)", value: "-" },
];

export default function AccountPage() {
  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-8 px-4 py-8 font-mono">
      {/* Profile Details */}
      <div className="flex items-start gap-6">
        <div className="w-16 h-16 rounded-full bg-secondary bg-opacity-20 flex items-center justify-center text-secondary">
          ?
        </div>
        <div className="flex flex-col gap-1 flex-1">
          <div className="text-lg text-text">-</div>
          <div className="text-xs text-secondary">-</div>
          <div className="flex gap-6 mt-2 text-xs text-secondary">
            <div>
              <div>tests started</div>
              <div className="text-text">-</div>
            </div>
            <div>
              <div>tests completed</div>
              <div className="text-text">-</div>
            </div>
            <div>
              <div>time typing</div>
              <div className="text-text">-</div>
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
            <div className="text-text">-</div>
          </div>
          <div>
            <div className="text-secondary">60 seconds</div>
            <div className="text-text">-</div>
          </div>
        </div>
      </section>

      {/* Personal Bests */}
      <div className="grid grid-cols-2 gap-6">
        <section>
          <h3 className="text-sm text-secondary mb-2">time PBs</h3>
          <div className="flex flex-col gap-2">
            {PB_TIMES.map((label) => (
              <div key={label} className="flex justify-between text-xs">
                <span className="text-secondary">{label}</span>
                <span className="text-text">- wpm / - acc</span>
              </div>
            ))}
          </div>
        </section>
        <section>
          <h3 className="text-sm text-secondary mb-2">words PBs</h3>
          <div className="flex flex-col gap-2">
            {PB_WORDS.map((label) => (
              <div key={label} className="flex justify-between text-xs">
                <span className="text-secondary">{label}</span>
                <span className="text-text">- wpm / - acc</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Test Activity */}
      <section>
        <h3 className="text-sm text-secondary mb-2">test activity</h3>
        <div className="h-24 rounded bg-secondary bg-opacity-5 flex items-center justify-center text-xs text-secondary">
          No data found.
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
          {STAT_GROUPS.map((stat) => (
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
          <button className="text-xs text-secondary hover:text-text transition-colors">
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
            <tr className="text-secondary text-center">
              <td colSpan={8} className="py-8">
                No results yet. Complete a test to see your history.
              </td>
            </tr>
          </tbody>
        </table>
      </section>
    </div>
  );
}
