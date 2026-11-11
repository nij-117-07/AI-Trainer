// src/features/challenges/lib/validate.test.ts
import { clampCount, isChallengeLevel, isChallengeTime, isChallengeType, requireText } from "./validate";

describe("requireText", () => {
  it("trims the value and rejects blank or oversized input", () => {
    expect(requireText("  Python  ", "Topic", 200)).toBe("Python");
    expect(() => requireText("   ", "Topic", 200)).toThrow("Topic is required.");
    expect(() => requireText("x".repeat(201), "Topic", 200)).toThrow("Topic must be 200 characters or fewer.");
  });
});

describe("clampCount", () => {
  it("keeps the count between 1 and 5 and falls back when the value is not a number", () => {
    expect(clampCount(0)).toBe(1);
    expect(clampCount(42)).toBe(5);
    expect(clampCount(2.6)).toBe(3);
    expect(clampCount(undefined)).toBe(3);
    expect(clampCount(Number.NaN, 2)).toBe(2);
  });
});

describe("enum guards", () => {
  it("accepts only the known challenge types, levels, and time limits", () => {
    expect(isChallengeType("debug")).toBe(true);
    expect(isChallengeType("quiz")).toBe(false);
    expect(isChallengeLevel("advanced")).toBe(true);
    expect(isChallengeLevel(null)).toBe(false);
    expect(isChallengeTime(60)).toBe(true);
    expect(isChallengeTime(45)).toBe(false);
  });
});
