// src/features/projects/lib/validate.test.ts
import { clampCount, isProjectDifficulty, isProjectSize, requireText } from "./validate";

describe("requireText", () => {
  it("trims the value and rejects blank or oversized input", () => {
    expect(requireText("  Python  ", "Topic", 200)).toBe("Python");
    expect(() => requireText("   ", "Topic", 200)).toThrow("Topic is required.");
    expect(() => requireText("x".repeat(201), "Topic", 200)).toThrow("Topic must be 200 characters or fewer.");
  });
});

describe("clampCount", () => {
  it("keeps the count between 1 and 10 and falls back when the value is not a number", () => {
    expect(clampCount(0)).toBe(1);
    expect(clampCount(42)).toBe(10);
    expect(clampCount(4.6)).toBe(5);
    expect(clampCount(undefined)).toBe(3);
    expect(clampCount(Number.NaN, 2)).toBe(2);
  });
});

describe("enum guards", () => {
  it("accepts only the known project sizes and difficulty levels", () => {
    expect(isProjectSize("medium")).toBe(true);
    expect(isProjectSize("huge")).toBe(false);
    expect(isProjectDifficulty("advanced")).toBe(true);
    expect(isProjectDifficulty(null)).toBe(false);
  });
});
