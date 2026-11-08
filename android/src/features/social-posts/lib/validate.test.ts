// src/features/social-posts/lib/validate.test.ts
import { clampCount, optionalText, requireText, throwIfAborted } from "./validate";

describe("requireText", () => {
  it("trims and returns the value", () => {
    expect(requireText("  LinkedIn  ", "Platform", 100)).toBe("LinkedIn");
  });

  it("rejects blank and over-long input", () => {
    expect(() => requireText("   ", "Platform", 100)).toThrow("Platform is required.");
    expect(() => requireText("x".repeat(101), "Platform", 100)).toThrow(
      "Platform must be 100 characters or fewer.",
    );
  });
});

describe("optionalText", () => {
  it("returns undefined for blank input", () => {
    expect(optionalText("  ", "Chat history", 2000)).toBeUndefined();
  });

  it("rejects text longer than the limit", () => {
    expect(() => optionalText("x".repeat(2001), "Chat history", 2000)).toThrow(
      "Chat history must be 2000 characters or fewer.",
    );
  });
});

describe("clampCount", () => {
  it("rounds and keeps the value inside the range", () => {
    expect(clampCount(2.6, 1, 10)).toBe(3);
    expect(clampCount(0, 1, 10)).toBe(1);
    expect(clampCount(42, 1, 10)).toBe(10);
    expect(clampCount(Number.NaN, 1, 10)).toBe(1);
  });
});

describe("throwIfAborted", () => {
  it("throws only when the signal is aborted", () => {
    const controller = new AbortController();
    expect(() => throwIfAborted(controller.signal)).not.toThrow();
    controller.abort();
    expect(() => throwIfAborted(controller.signal)).toThrow("Generation was cancelled.");
  });
});
