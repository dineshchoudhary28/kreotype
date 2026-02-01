export interface BadgeDefinition {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export const BADGE_CATALOG: BadgeDefinition[] = [
  {
    id: "speed-demon",
    name: "Speed Demon",
    description: "Achieve 150+ WPM on any test",
    icon: "🔥",
  },
  {
    id: "centurion",
    name: "Centurion",
    description: "Achieve 100+ WPM on any test",
    icon: "💯",
  },
  {
    id: "perfectionist",
    name: "Perfectionist",
    description: "Complete a test with 100% accuracy",
    icon: "🎯",
  },
  {
    id: "marathoner",
    name: "Marathoner",
    description: "Complete 100+ tests",
    icon: "🏃",
  },
  {
    id: "veteran",
    name: "Veteran",
    description: "Complete 1000+ tests",
    icon: "🎖️",
  },
  {
    id: "consistent",
    name: "Consistency King",
    description: "Achieve 95%+ consistency on any test",
    icon: "👑",
  },
  {
    id: "night-owl",
    name: "Night Owl",
    description: "Complete a test between 12am and 5am",
    icon: "🦉",
  },
  {
    id: "streak-7",
    name: "Weekly Warrior",
    description: "Maintain a 7-day typing streak",
    icon: "⚔️",
  },
];

export const BADGE_MAP = new Map(BADGE_CATALOG.map((b) => [b.id, b]));
