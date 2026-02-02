import type { TestResult, CompletedEvent, TestMode } from "@/types/test";

interface SubmitConfig {
  mode: TestMode;
  time: number;
  words: number;
  language: string;
  difficulty: string;
  punctuation: boolean;
  numbers: boolean;
  blindMode: boolean;
}

export interface SubmitResponse {
  isPb: boolean;
  newBadges: Array<{ id: string; name: string }>;
}

function getMode2(mode: TestMode, config: SubmitConfig): number | string {
  if (mode === "time") return config.time;
  if (mode === "words") return config.words;
  return 0;
}

export async function submitResult(
  result: TestResult,
  config: SubmitConfig
): Promise<SubmitResponse | null> {
  // Always submit — backend stores isValid as metadata, not a gate
  if (!result.validation) return null;

  const event: CompletedEvent = {
    wpm: result.wpm,
    rawWpm: result.rawWpm,
    accuracy: result.accuracy,
    consistency: result.consistency,
    keyConsistency: result.keyConsistency,
    mode: config.mode,
    mode2: getMode2(config.mode, config),
    timestamp: Date.now(),
    testDuration: result.time,
    afkDuration: result.afkDuration,
    charStats: result.charStats,
    keypressTimings: result.keypressTimings,
    wpmHistory: result.wpmHistory,
    rawHistory: result.rawHistory,
    burstHistory: result.burstHistory,
    errorHistory: result.errorHistory,
    language: config.language,
    difficulty: config.difficulty,
    punctuation: config.punctuation,
    numbers: config.numbers,
    blindMode: config.blindMode,
    validation: result.validation,
  };

  try {
    const res = await fetch("/api/results", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(event),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      console.error("Result submission failed:", res.status, body);
      return null;
    }
    return await res.json();
  } catch (err) {
    console.error("Failed to submit result:", err);
    return null;
  }
}
