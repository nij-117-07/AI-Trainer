// src/features/guides/lib/validate.test.ts
import { clampCount, optionalLines, optionalText, requireOption, requireText } from "./validate";

describe("requireText", () => {
  it("trims and returns the value", () => {
    expect(requireText("  FastAPI  ", "Subject", 200)).toBe("FastAPI");
  });

  it("rejects blank and over-long input", () => {
    expect(() => requireText("   ", "Subject", 200)).toThrow("Subject is required.");
    expect(() => requireText("x".repeat(201), "Subject", 200)).toThrow(
      "Subject must be 200 characters or fewer.",
    );
  });
});

describe("optionalText", () => {
  it("returns undefined for blank input", () => {
    expect(optionalText("  ", "Instructions", 1000)).toBeUndefined();
  });

  it("rejects text longer than the limit", () => {
    expect(() => optionalText("x".repeat(1001), "Instructions", 1000)).toThrow();
  });
});

describe("optionalLines", () => {
  it("returns undefined when there are no lines", () => {
    expect(optionalLines("\n  \n", "History", 2000)).toBeUndefined();
  });

  it("keeps trimmed, non-empty lines joined by newlines", () => {
    expect(optionalLines(" Routing \n\n Auth ", "History", 2000)).toBe("Routing\nAuth");
  });

  it("checks the raw length against the limit", () => {
    expect(() => optionalLines("x".repeat(2001), "History", 2000)).toThrow(
      "History must be 2000 characters or fewer.",
    );
  });
});

describe("requireOption", () => {
  it("returns a listed option and rejects anything else", () => {
    expect(requireOption("beginner", ["beginner", "advanced"], "Level")).toBe("beginner");
    expect(() => requireOption("guru", ["beginner", "advanced"], "Level")).toThrow(
      "Level must be one of: beginner, advanced.",
    );
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
