/**
 * Word Generator Tests
 */

import { describe, it, expect } from "vitest";
import {
    shuffleArray,
    generateWords,
    generateQuote,
    generateCustomText,
} from "../core/word-generator";

describe("word-generator", () => {
    describe("shuffleArray", () => {
        it("should return array with same length", () => {
            const input = [1, 2, 3, 4, 5];
            const result = shuffleArray(input);

            expect(result).toHaveLength(input.length);
        });

        it("should contain same elements", () => {
            const input = [1, 2, 3, 4, 5];
            const result = shuffleArray(input);

            expect(result.sort()).toEqual(input.sort());
        });

        it("should not mutate original array", () => {
            const input = [1, 2, 3, 4, 5];
            const original = [...input];
            shuffleArray(input);

            expect(input).toEqual(original);
        });
    });

    describe("generateWords", () => {
        const wordList = ["the", "quick", "brown", "fox", "jumps"];

        it("should generate correct count for words mode", () => {
            const result = generateWords("words", "10", wordList, false, false);
            expect(result).toHaveLength(10);
        });

        it("should generate words for time mode", () => {
            const result = generateWords("time", "60", wordList, false, false);
            // Should generate ~40 WPM * 1 minute * 1.5 buffer = ~60 words
            expect(result.length).toBeGreaterThan(30);
        });

        it("should add punctuation when enabled", () => {
            const result = generateWords("words", "50", wordList, true, false);
            const hasPunctuation = result.some(word =>
                word.endsWith(".") || word.endsWith(",") ||
                word.endsWith("!") || word.endsWith("?")
            );
            expect(hasPunctuation).toBe(true);
        });

        it("should add numbers when enabled", () => {
            const result = generateWords("words", "50", wordList, false, true);
            const hasNumbers = result.some(word => /\d/.test(word));
            expect(hasNumbers).toBe(true);
        });

        it("should generate large pool for zen mode", () => {
            const result = generateWords("zen", "0", wordList, false, false);
            expect(result.length).toBeGreaterThan(100);
        });
    });

    describe("generateQuote", () => {
        it("should split quote into words", () => {
            const quote = "The quick brown fox jumps over the lazy dog";
            const result = generateQuote(quote);

            expect(result).toEqual(["The", "quick", "brown", "fox", "jumps", "over", "the", "lazy", "dog"]);
        });

        it("should handle multiple spaces", () => {
            const quote = "Hello    world";
            const result = generateQuote(quote);

            expect(result).toEqual(["Hello", "world"]);
        });

        it("should filter empty strings", () => {
            const quote = "  Hello  world  ";
            const result = generateQuote(quote);

            expect(result).toEqual(["Hello", "world"]);
        });
    });

    describe("generateCustomText", () => {
        it("should split custom text into words", () => {
            const text = "Custom typing test";
            const result = generateCustomText(text);

            expect(result).toEqual(["Custom", "typing", "test"]);
        });
    });
});
