"use client";

import { useState, FormEvent } from "react";

const PB_TIMES = ["15 seconds", "30 seconds", "60 seconds", "120 seconds"];
const PB_WORDS = ["10 words", "25 words", "50 words", "100 words"];

export default function ProfilePage() {
  const [username, setUsername] = useState("");

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    // TODO: implement profile lookup
  };

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col gap-8 px-4 py-8 font-mono">
      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-2">
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
          className="px-3 py-1.5 rounded bg-primary text-background text-sm"
        >
          search
        </button>
      </form>

      {/* Profile Details (placeholder) */}
      <div className="flex items-start gap-6">
        <div className="w-16 h-16 rounded-full bg-secondary bg-opacity-20 flex items-center justify-center text-secondary">
          ?
        </div>
        <div className="flex flex-col gap-1">
          <div className="text-lg text-text">-</div>
          <div className="text-xs text-secondary">-</div>
          <div className="flex gap-6 mt-2 text-xs text-secondary">
            <div>
              <div className="text-secondary">tests started</div>
              <div className="text-text">-</div>
            </div>
            <div>
              <div className="text-secondary">tests completed</div>
              <div className="text-text">-</div>
            </div>
            <div>
              <div className="text-secondary">time typing</div>
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

      {/* Personal Bests - Words */}
      <section>
        <h3 className="text-sm text-secondary mb-2">personal bests — words</h3>
        <div className="grid grid-cols-4 gap-3">
          {PB_WORDS.map((label) => (
            <div key={label} className="text-xs">
              <div className="text-secondary">{label}</div>
              <div className="text-text">- wpm</div>
              <div className="text-secondary">- acc</div>
            </div>
          ))}
        </div>
      </section>

      {/* Personal Bests - Time */}
      <section>
        <h3 className="text-sm text-secondary mb-2">personal bests — time</h3>
        <div className="grid grid-cols-4 gap-3">
          {PB_TIMES.map((label) => (
            <div key={label} className="text-xs">
              <div className="text-secondary">{label}</div>
              <div className="text-text">- wpm</div>
              <div className="text-secondary">- acc</div>
            </div>
          ))}
        </div>
      </section>

      {/* Test Activity Heatmap placeholder */}
      <section>
        <h3 className="text-sm text-secondary mb-2">test activity</h3>
        <div className="h-24 rounded bg-secondary bg-opacity-5 flex items-center justify-center text-xs text-secondary">
          No data found.
        </div>
      </section>
    </div>
  );
}
