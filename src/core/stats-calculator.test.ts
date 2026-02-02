import { describe, it, expect } from "vitest";
import {
  calculateWpmAndRaw,
  calculateAccuracy,
  calculateConsistency,
  calculateBurst,
} from "./stats-calculator";

describe("stats-calculator", () => {
  describe("calculateWpmAndRaw", () => {
    it("should calculate correct WPM and Raw WPM", () => {
      // 50 chars in 12 seconds = (50 * (60/12)) / 5 = 50 WPM
      const result = calculateWpmAndRaw(40, 10, 55, 12);
      expect(result.wpm).toBe(50);
      expect(result.raw).toBe(55); // (55 * 5) / 5 = 55
    });

    it("should handle 0 seconds correctly (avoid division by zero)", () => {
      const result = calculateWpmAndRaw(50, 0, 50, 0);
      expect(result.wpm).toBe(0);
      expect(result.raw).toBe(0);
    });

    it("should handle 0 characters", () => {
      const result = calculateWpmAndRaw(0, 0, 0, 60);
      expect(result.wpm).toBe(0);
      expect(result.raw).toBe(0);
    });
  });

  describe("calculateAccuracy", () => {
    it("should calculate correct accuracy", () => {
      expect(calculateAccuracy(90, 10)).toBe(90);
      expect(calculateAccuracy(50, 50)).toBe(50);
    });

    it("should return 100% if no characters typed", () => {
      expect(calculateAccuracy(0, 0)).toBe(100);
    });

    it("should round to 2 decimal places", () => {
      // 1/3 = 33.333...
      expect(calculateAccuracy(1, 2)).toBe(33.33);
    });
  });

  describe("calculateConsistency", () => {
    it("should return 100 for empty or single history", () => {
      expect(calculateConsistency([])).toBe(100);
      expect(calculateConsistency([50])).toBe(100);
    });

    it("should calculate consistency score", () => {
      // Perfect consistency (no variance)
      expect(calculateConsistency([60, 60, 60])).toBe(100); // Wait, kogasa might return something close to 100 or exactly 100
    });
  });

  describe("calculateBurst", () => {
    it("should calculate burst speed", () => {
      // 5 chars in 1 second = 60 WPM
      expect(calculateBurst(5, 1000)).toBe(60);
    });

    it("should handle 0 time", () => {
      expect(calculateBurst(5, 0)).toBe(0);
    });
  });
});
