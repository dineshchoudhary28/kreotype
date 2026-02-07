/**
 * Typing Engine Tests
 * 
 * Unit tests for core typing engine functionality.
 */

import { describe, it, expect } from "vitest";
import {
    createWordData,
    calculateStats,
    calculateConsistency,
    processCharInput,
    processBackspace,
    processSpace,
    countCurrentWordErrors,
    type TypingEngineState,
} from "../core/typing-engine";

describe("typing-engine", () => {
    describe("createWordData", () => {
        it("should create word data with pending characters", () => {
            const result = createWordData("hello");

            expect(result.word).toBe("hello");
            expect(result.chars).toHaveLength(5);
            expect(result.isCorrect).toBeNull();
            expect(result.chars[0]).toEqual({
                char: "h",
                state: "pending",
                typed: null,
            });
        });
    });

    describe("calculateConsistency", () => {
        it("should return 100 for empty or single value", () => {
            expect(calculateConsistency([])).toBe(100);
            expect(calculateConsistency([50])).toBe(100);
        });

        it("should calculate consistency from WPM values", () => {
            const wpmValues = [50, 52, 48, 51, 49]; // Low variance
            const consistency = calculateConsistency(wpmValues);
            expect(consistency).toBeGreaterThan(90);
        });

        it("should return lower consistency for high variance", () => {
            const wpmValues = [20, 80, 30, 70, 40]; // High variance
            const consistency = calculateConsistency(wpmValues);
            expect(consistency).toBeLessThan(70);
        });
    });

    describe("processCharInput", () => {
        it("should mark correct character", () => {
            const words = [createWordData("hello")];
            const result = processCharInput(words, 0, 0, "h");

            expect(result.words[0].chars[0].state).toBe("correct");
            expect(result.words[0].chars[0].typed).toBe("h");
            expect(result.currentCharIndex).toBe(1);
            expect(result.isError).toBe(false);
        });

        it("should mark incorrect character", () => {
            const words = [createWordData("hello")];
            const result = processCharInput(words, 0, 0, "x");

            expect(result.words[0].chars[0].state).toBe("incorrect");
            expect(result.words[0].chars[0].typed).toBe("x");
            expect(result.isError).toBe(true);
        });

        it("should handle extra characters", () => {
            const words = [createWordData("hi")];
            const result = processCharInput(words, 0, 2, "x");

            expect(result.words[0].chars[2].state).toBe("extra");
            expect(result.words[0].chars[2].typed).toBe("x");
            expect(result.isError).toBe(true);
        });
    });

    describe("processBackspace", () => {
        it("should reset character to pending", () => {
            const words = [createWordData("hello")];
            words[0].chars[0] = { char: "h", state: "correct", typed: "h" };

            const result = processBackspace(words, 0, 1);

            expect(result).not.toBeNull();
            expect(result!.words[0].chars[0].state).toBe("pending");
            expect(result!.words[0].chars[0].typed).toBeNull();
            expect(result!.currentCharIndex).toBe(0);
        });

        it("should remove extra character", () => {
            const words = [createWordData("hi")];
            words[0].chars.push({ char: "", state: "extra", typed: "x" });

            const result = processBackspace(words, 0, 3);

            expect(result).not.toBeNull();
            expect(result!.words[0].chars).toHaveLength(2);
        });

        it("should return null at start of word", () => {
            const words = [createWordData("hello")];
            const result = processBackspace(words, 0, 0);

            expect(result).toBeNull();
        });
    });

    describe("processSpace", () => {
        it("should mark word as correct when all chars correct", () => {
            const words = [createWordData("hi"), createWordData("there")];
            words[0].chars[0] = { char: "h", state: "correct", typed: "h" };
            words[0].chars[1] = { char: "i", state: "correct", typed: "i" };

            const result = processSpace(words, 0);

            expect(result.isWordCorrect).toBe(true);
            expect(result.words[0].isCorrect).toBe(true);
            expect(result.nextWordIndex).toBe(1);
            expect(result.isTestComplete).toBe(false);
        });

        it("should mark word as incorrect when has errors", () => {
            const words = [createWordData("hi")];
            words[0].chars[0] = { char: "h", state: "incorrect", typed: "x" };
            words[0].chars[1] = { char: "i", state: "correct", typed: "i" };

            const result = processSpace(words, 0);

            expect(result.isWordCorrect).toBe(false);
            expect(result.words[0].isCorrect).toBe(false);
        });

        it("should detect test completion", () => {
            const words = [createWordData("hi")];
            const result = processSpace(words, 0);

            expect(result.isTestComplete).toBe(true);
        });
    });

    describe("calculateStats", () => {
        it("should calculate WPM correctly", () => {
            const words = [createWordData("hello"), createWordData("world")];
            words[0].chars.forEach(c => { c.state = "correct"; });
            words[1].chars.forEach(c => { c.state = "correct"; });

            const state: TypingEngineState = {
                words,
                currentWordIndex: 1,
                currentCharIndex: 5,
                elapsedTime: 60000, // 1 minute
                wpmHistory: [],
                rawWpmHistory: [],
                errorHistory: [],
                burstHistory: [],
                keypressTimings: { spacing: [], duration: [] },
            };

            const stats = calculateStats(state);

            // "hello" (5) + space (1) + "world" (5) = 11 chars
            // WPM = (11 / 5) / 1 = 2.2 ≈ 2
            expect(stats.wpm).toBe(2);
            expect(stats.correctChars).toBe(11); // Including space
            expect(stats.accuracy).toBe(100);
        });

        it("should calculate accuracy with errors", () => {
            const words = [createWordData("hello")];
            words[0].chars[0] = { char: "h", state: "correct", typed: "h" };
            words[0].chars[1] = { char: "e", state: "incorrect", typed: "x" };
            words[0].chars[2] = { char: "l", state: "correct", typed: "l" };
            words[0].chars[3] = { char: "l", state: "correct", typed: "l" };
            words[0].chars[4] = { char: "o", state: "correct", typed: "o" };

            const state: TypingEngineState = {
                words,
                currentWordIndex: 0,
                currentCharIndex: 5,
                elapsedTime: 10000,
                wpmHistory: [],
                rawWpmHistory: [],
                errorHistory: [],
                burstHistory: [],
                keypressTimings: { spacing: [], duration: [] },
            };

            const stats = calculateStats(state);

            // 4 correct, 1 incorrect = 80% accuracy
            expect(stats.accuracy).toBe(80);
            expect(stats.correctChars).toBe(4);
            expect(stats.incorrectChars).toBe(1);
        });
    });

    describe("countCurrentWordErrors", () => {
        it("should count incorrect and extra characters", () => {
            const word = createWordData("hello");
            word.chars[0] = { char: "h", state: "incorrect", typed: "x" };
            word.chars[1] = { char: "e", state: "correct", typed: "e" };
            word.chars.push({ char: "", state: "extra", typed: "z" });

            const errorCount = countCurrentWordErrors(word);
            expect(errorCount).toBe(2);
        });
    });
});
