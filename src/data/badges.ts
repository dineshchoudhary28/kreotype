export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string; // URL or component name
}

export const badges: Record<string, Badge> = {
  "wpm-100": {
    id: "wpm-100",
    name: "Centurion",
    description: "Achieve 100 WPM in any test.",
    icon: "🚀",
  },
  "wpm-150": {
    id: "wpm-150",
    name: "Warp Speed",
    description: "Achieve 150 WPM in any test.",
    icon: "⚡️",
  },
  "acc-100": {
    id: "acc-100",
    name: "Perfectionist",
    description: "Get 100% accuracy in a test of at least 25 words.",
    icon: "🎯",
  },
  "consistency-95": {
    id: "consistency-95",
    name: "Metronome",
    description: "Achieve 95% consistency in a test of at least 60 seconds.",
    icon: "🎶",
  },
  "streak-7": {
    id: "streak-7",
    name: "Week Long",
    description: "Maintain a 7-day streak.",
    icon: "📅",
  },
  "streak-30": {
    id: "streak-30",
    name: "Month Long",
    description: "Maintain a 30-day streak.",
    icon: "🗓️",
  },
};
