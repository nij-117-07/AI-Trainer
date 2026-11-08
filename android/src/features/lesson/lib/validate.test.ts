// src/features/lesson/lib/validate.test.ts
import { optionalText, requireOption, requireText } from "./validate";

describe("requireText", () => {
  it("trims and returns the value", () => {
    expect(requireText("  Japanese  ", "Target language", 100)).toBe("Japanese");
  });

  it("rejects blank and over-long input", () => {
    expect(() => requireText("   ", "Target language", 100)).toThrow("Target language is required.");
    expect(() => requireText("x".repeat(101), "Target language", 100)).toThrow(
      "Target language must be 100 characters or fewer.",
    );
  });
});

describe("optionalText", () => {
  it("returns undefined for blank input", () => {
    expect(optionalText("  ", "Seed", 200)).toBeUndefined();
  });

  it("rejects text longer than the limit", () => {
    expect(() => optionalText("x".repeat(2001), "Last lesson summary", 2000)).toThrow(
      "Last lesson summary must be 2000 characters or fewer.",
    );
  });
});

describe("requireOption", () => {
  it("returns a listed option and rejects anything else", () => {
    expect(requireOption("B1", ["A1", "B1"], "Current level")).toBe("B1");
    expect(() => requireOption("C9", ["A1", "B1"], "Current level")).toThrow(
      "Current level must be one of: A1, B1.",
    );
  });
});
