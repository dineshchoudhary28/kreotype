import type { IEarnedBadge } from "@/server/models/User";

interface BadgeContext {
  wpm: number;
  accuracy: number;
  consistency: number;
  timestamp: Date;
  testsCompleted: number;
  earnedBadgeIds: Set<string>;
  recentTestDates?: string[];
}

type BadgeRule = {
  id: string;
  check: (ctx: BadgeContext) => boolean;
};

const rules: BadgeRule[] = [
  {
    id: "speed-demon",
    check: (ctx) => ctx.wpm >= 150,
  },
  {
    id: "centurion",
    check: (ctx) => ctx.wpm >= 100,
  },
  {
    id: "perfectionist",
    check: (ctx) => ctx.accuracy === 100,
  },
  {
    id: "marathoner",
    check: (ctx) => ctx.testsCompleted >= 100,
  },
  {
    id: "veteran",
    check: (ctx) => ctx.testsCompleted >= 1000,
  },
  {
    id: "consistent",
    check: (ctx) => ctx.consistency >= 95,
  },
  {
    id: "night-owl",
    check: (ctx) => {
      const hour = ctx.timestamp.getHours();
      return hour >= 0 && hour < 5;
    },
  },
  {
    id: "streak-7",
    check: (ctx) => {
      if (!ctx.recentTestDates || ctx.recentTestDates.length < 7) return false;
      const unique = [...new Set(ctx.recentTestDates)].sort().reverse();
      if (unique.length < 7) return false;

      let streak = 1;
      for (let i = 1; i < unique.length && streak < 7; i++) {
        const prev = new Date(unique[i - 1]);
        const curr = new Date(unique[i]);
        const diffMs = prev.getTime() - curr.getTime();
        const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
        if (diffDays === 1) {
          streak++;
        } else {
          break;
        }
      }
      return streak >= 7;
    },
  },
];

export function evaluateBadges(ctx: BadgeContext): string[] {
  const newBadges: string[] = [];

  for (const rule of rules) {
    if (ctx.earnedBadgeIds.has(rule.id)) continue;
    if (rule.check(ctx)) {
      newBadges.push(rule.id);
    }
  }

  return newBadges;
}

export function buildEarnedBadgeIds(badges: IEarnedBadge[]): Set<string> {
  return new Set(badges.map((b) => b.badgeId));
}
