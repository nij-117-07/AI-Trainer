// src/features/confidence-builder/lib/validate.test.ts
import { clampCount, isComfort, isFocus, isRating, requireText } from "./validate";

describe("requireText", () => {
  it("trims the value and rejects blank or oversized input", () => {
    expect(requireText("  Standups  ", "Focus", 50)).toBe("Standups");
    expect(() => requireText("   ", "Focus", 50)).toThrow("Focus is required.");
    expect(() => requireText("x".repeat(51), "Focus", 50)).toThrow("Focus must be 50 characters or fewer.");
  });
});

describe("clampCount", () => {
  it("keeps the count between 1 and 5 and falls back when the value is not a number", () => {
    expect(clampCount(0)).toBe(1);
    expect(clampCount(9)).toBe(5);
    expect(clampCount(undefined)).toBe(3);
    expect(clampCount(Number.NaN, 2)).toBe(2);
  });
});

describe("guards", () => {
  it("accepts only known focus, comfort, and ratings", () => {
    expect(isFocus("ask")).toBe(true);
    expect(isFocus("public-speaking")).toBe(false);
    expect(isComfort("high")).toBe(true);
    expect(isComfort("none")).toBe(false);
    expect(isRating(4)).toBe(true);
    expect(isRating(6)).toBe(false);
    expect(isRating("3")).toBe(false);
  });
});
