/**
 * Core Typing Engine
 * 
 * Pure business logic for typing test functionality.
 * Separated from UI and state management for:
 * - Testability
 * - Reusability (Phase 2: patterns, games)
 * - Maintainability
 */

export type CharState = "correct" | "incorrect" | "extra" | "pending";

export interface CharData {
    char: string;
    state: CharState;
    typed: string | null;
}

export interface WordData {
    word: string;
    chars: CharData[];
    isCorrect: boolean | null;
}

export interface TestStats {
    wpm: number;
    rawWpm: number;
    accuracy: number;
    correctChars: number;
    incorrectChars: number;
    extraChars: number;
    missedChars: number;
    totalChars: number;
    time: number;
    consistency: number;
    keyConsistency: number;
    wpmHistory: number[];
    rawWpmHistory: number[];
    errorHistory: number[];
    burstHistory: number[];
    keypressTimings: {
        spacing: number[];
        duration: number[];
    };
}

export interface TypingEngineState {
    words: WordData[];
    currentWordIndex: number;
    currentCharIndex: number;
    elapsedTime: number;
    wpmHistory: number[];
    rawWpmHistory: number[];
    errorHistory: number[];
    burstHistory: number[];
    keypressTimings: {
        spacing: number[];
        duration: number[];
    };
}

/**
 * Create word data structure from a string
 */
export function createWordData(word: string): WordData {
    return {
        word,
        chars: word.split("").map((char) => ({
            char,
            state: "pending" as CharState,
            typed: null,
        })),
        isCorrect: null,
    };
}

/**
 * Calculate comprehensive test statistics
 */
export function calculateStats(state: TypingEngineState): TestStats {
    const elapsedSeconds = state.elapsedTime / 1000;
    const elapsedMinutes = elapsedSeconds / 60;

    let correctChars = 0;
    let incorrectChars = 0;
    let extraChars = 0;
    let missedChars = 0;
    let totalTypedChars = 0;

    // Count character states
    for (let i = 0; i <= state.currentWordIndex && i < state.words.length; i++) {
        const word = state.words[i];
        for (const char of word.chars) {
            if (char.state === "correct") {
                correctChars++;
                totalTypedChars++;
            } else if (char.state === "incorrect") {
                incorrectChars++;
                totalTypedChars++;
            } else if (char.state === "extra") {
                extraChars++;
                totalTypedChars++;
            } else if (i < state.currentWordIndex && char.state === "pending") {
                missedChars++;
            }
        }
        // Count space between words
        if (i < state.currentWordIndex) {
            correctChars++;
            totalTypedChars++;
        }
    }

    // WPM = (correct chars / 5) / minutes
    const wpm = elapsedMinutes > 0 ? Math.round((correctChars / 5) / elapsedMinutes) : 0;
    const rawWpm = elapsedMinutes > 0 ? Math.round((totalTypedChars / 5) / elapsedMinutes) : 0;

    // Accuracy = correct / (correct + incorrect + extra)
    const totalAttempts = correctChars + incorrectChars + extraChars;
    const accuracy = totalAttempts > 0 ? Math.round((correctChars / totalAttempts) * 100) : 100;

    // Consistency calculation from WPM history
    const consistency = calculateConsistency(state.wpmHistory);

    // Key consistency from spacing
    const keyConsistency = calculateConsistency(state.keypressTimings.spacing);

    return {
        wpm,
        rawWpm,
        accuracy,
        correctChars,
        incorrectChars,
        extraChars,
        missedChars,
        totalChars: totalTypedChars,
        time: Math.round(elapsedSeconds),
        consistency,
        keyConsistency,
        wpmHistory: state.wpmHistory,
        rawWpmHistory: state.rawWpmHistory,
        errorHistory: state.errorHistory,
        burstHistory: state.burstHistory,
        keypressTimings: {
            spacing: state.keypressTimings.spacing,
            duration: state.keypressTimings.duration,
        },
    };
}

/**
 * Calculate consistency from a series of values
 * Uses coefficient of variation (CV)
 */
export function calculateConsistency(values: number[]): number {
    if (values.length <= 1) return 100;

    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);
    const cv = mean > 0 ? (stdDev / mean) * 100 : 0;

    return Math.max(0, Math.round(100 - cv));
}

/**
 * Process character input
 */
export function processCharInput(
    words: WordData[],
    currentWordIndex: number,
    currentCharIndex: number,
    char: string
): {
    words: WordData[];
    currentCharIndex: number;
    isError: boolean;
} {
    const newWords = [...words];
    const currentWord = { ...newWords[currentWordIndex] };

    if (!currentWord) {
        return { words, currentCharIndex, isError: false };
    }

    const newChars = [...currentWord.chars];
    let isError = false;

    if (currentCharIndex < currentWord.word.length) {
        const expectedChar = newChars[currentCharIndex].char;
        isError = char !== expectedChar;
        newChars[currentCharIndex] = {
            ...newChars[currentCharIndex],
            state: isError ? "incorrect" : "correct",
            typed: char,
        };
    } else {
        // Extra character
        isError = true;
        newChars.push({ char: "", state: "extra", typed: char });
    }

    currentWord.chars = newChars;
    newWords[currentWordIndex] = currentWord;

    return {
        words: newWords,
        currentCharIndex: currentCharIndex + 1,
        isError,
    };
}

/**
 * Process backspace
 */
export function processBackspace(
    words: WordData[],
    currentWordIndex: number,
    currentCharIndex: number
): {
    words: WordData[];
    currentCharIndex: number;
} | null {
    if (currentCharIndex === 0) return null;

    const newWords = [...words];
    const currentWord = { ...newWords[currentWordIndex] };

    if (!currentWord) return null;

    const newCharIndex = currentCharIndex - 1;
    const newChars = [...currentWord.chars];

    if (newCharIndex >= currentWord.word.length) {
        // Remove extra character
        newChars.pop();
    } else {
        // Reset character to pending
        newChars[newCharIndex] = {
            ...newChars[newCharIndex],
            state: "pending",
            typed: null,
        };
    }

    currentWord.chars = newChars;
    newWords[currentWordIndex] = currentWord;

    return {
        words: newWords,
        currentCharIndex: newCharIndex,
    };
}

/**
 * Process space (word completion)
 */
export function processSpace(
    words: WordData[],
    currentWordIndex: number
): {
    words: WordData[];
    nextWordIndex: number;
    isWordCorrect: boolean;
    isTestComplete: boolean;
} {
    const currentWord = words[currentWordIndex];
    const isWordCorrect =
        currentWord.chars.every((c) => c.state === "correct") &&
        !currentWord.chars.some((c) => c.state === "extra");

    const newWords = [...words];
    newWords[currentWordIndex] = { ...currentWord, isCorrect: isWordCorrect };

    const nextWordIndex = currentWordIndex + 1;
    const isTestComplete = nextWordIndex >= words.length;

    return {
        words: newWords,
        nextWordIndex,
        isWordCorrect,
        isTestComplete,
    };
}

/**
 * Count errors in current word
 */
export function countCurrentWordErrors(word: WordData): number {
    return word.chars.filter(c => c.state === "incorrect" || c.state === "extra").length;
}
