export interface BadgeEvaluationData {
  wpm: number;
  accuracy: number;
  consistency: number;
  timestamp: Date;
  testsCompleted: number;
  earnedBadgeIds: Set<string>;
  recentTestDates: string[]; // ['2026-02-05', ...]
}

export function buildEarnedBadgeIds(badges: { badgeId: string }[]): Set<string> {
  return new Set(badges.map((b) => b.badgeId));
}

export function evaluateBadges(data: BadgeEvaluationData): string[] {
  const newBadges: string[] = [];

  const check = (id: string, condition: boolean) => {
    if (condition && !data.earnedBadgeIds.has(id)) {
      newBadges.push(id);
    }
  };

  // Speed Demon (150+ WPM)
  check("speed-demon", data.wpm >= 150);

  // Centurion (100+ WPM)
  check("centurion", data.wpm >= 100);

  // Perfectionist (100% Accuracy)
  check("perfectionist", data.accuracy >= 100);

  // Marathoner (100+ tests)
  check("marathoner", data.testsCompleted >= 100);

  // Veteran (1000+ tests)
  check("veteran", data.testsCompleted >= 1000);

  // Consistency King (95%+ consistency)
  check("consistent", data.consistency >= 95);

  // Night Owl (12am - 5am)
  const hour = data.timestamp.getHours();
  check("night-owl", hour >= 0 && hour < 5);

  // Weekly Warrior (7-day streak)
  if (!data.earnedBadgeIds.has("streak-7")) {
    const streak = calculateStreak(data.recentTestDates);
    if (streak >= 7) {
      newBadges.push("streak-7");
    }
  }

  return newBadges;
}

function calculateStreak(dates: string[]): number {
  if (dates.length === 0) return 0;
  
  const uniqueDates = Array.from(new Set(dates)).sort().reverse();
  let streak = 1;
  
  for (let i = 0; i < uniqueDates.length - 1; i++) {
    const curr = new Date(uniqueDates[i]);
    const prev = new Date(uniqueDates[i+1]);
    const diff = (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24);
    
    if (diff === 1) {
      streak++;
    } else if (diff > 1) {
      break;
    }
  }
  
  return streak;
}
