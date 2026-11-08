// src/features/language-tester/lib/validate.test.ts
import { clampCount, optionalText, requireOption, requireText, seedOrFresh, throwIfAborted } from "./validate";

describe("requireText", () => {
  it("trims and returns the value", () => {
    expect(requireText("  Spanish  ", "Target language", 100)).toBe("Spanish");
  });

  it("rejects blank and over-long input", () => {
    expect(() => requireText("   ", "Scenario", 500)).toThrow("Scenario is required.");
    expect(() => requireText("x".repeat(501), "Scenario", 500)).toThrow(
      "Scenario must be 500 characters or fewer.",
    );
  });
});

describe("optionalText", () => {
  it("returns undefined for blank input and rejects long input", () => {
    expect(optionalText("  ", "Custom instructions", 1000)).toBeUndefined();
    expect(() => optionalText("x".repeat(1001), "Custom instructions", 1000)).toThrow();
  });
});

describe("seedOrFresh", () => {
  it("keeps a typed seed and makes a prefixed one when blank", () => {
    expect(seedOrFresh(" hotel_b1 ", "assessment")).toBe("hotel_b1");
    expect(seedOrFresh("  ", "assessment")).toMatch(/^assessment_\d+$/);
  });

  it("rejects seeds over 200 characters", () => {
    expect(() => seedOrFresh("s".repeat(201), "fib")).toThrow("Seed must be 200 characters or fewer.");
  });
});

describe("requireOption", () => {
  it("returns a listed level and rejects anything else", () => {
    expect(requireOption("B1", ["A1", "B1"], "Level")).toBe("B1");
    expect(() => requireOption("D9", ["A1", "B1"], "Level")).toThrow("Level must be one of: A1, B1.");
  });
});

describe("clampCount", () => {
  it("rounds and keeps the value inside the range", () => {
    expect(clampCount(4.6, 1, 10)).toBe(5);
    expect(clampCount(0, 1, 10)).toBe(1);
    expect(clampCount(99, 1, 10)).toBe(10);
    expect(clampCount(Number.NaN, 1, 10)).toBe(1);
  });
});

describe("throwIfAborted", () => {
  it("throws only when the signal has been aborted", () => {
    expect(() => throwIfAborted(undefined)).not.toThrow();
    const controller = new AbortController();
    controller.abort();
    expect(() => throwIfAborted(controller.signal)).toThrow("Request cancelled.");
  });
});
