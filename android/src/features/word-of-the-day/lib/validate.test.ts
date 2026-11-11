// src/features/word-of-the-day/lib/validate.test.ts
import { optionalText, requireOption, requireText } from "./validate";

describe("requireText", () => {
  it("trims and returns the value", () => {
    expect(requireText("  Japanese ", "Target language", 100)).toBe("Japanese");
  });

  it("rejects blank and over-long input", () => {
    expect(() => requireText("", "Theme", 200)).toThrow("Theme is required.");
    expect(() => requireText("x".repeat(201), "Theme", 200)).toThrow("Theme must be 200 characters or fewer.");
  });
});

describe("optionalText", () => {
  it("returns undefined for blank input", () => {
    expect(optionalText(" ", "Custom instructions", 1000)).toBeUndefined();
  });

  it("accepts an empty theme and still rejects an over-long one", () => {
    expect(optionalText("", "Theme", 200)).toBeUndefined();
    expect(() => optionalText("x".repeat(201), "Theme", 200)).toThrow("Theme must be 200 characters or fewer.");
  });

  it("rejects text longer than the limit", () => {
    expect(() => optionalText("x".repeat(1001), "Custom instructions", 1000)).toThrow();
  });
});

describe("requireOption", () => {
  it("accepts a listed word type and rejects anything else", () => {
    expect(requireOption("slang", ["basic", "slang"], "Word type")).toBe("slang");
    expect(() => requireOption("formal", ["basic", "slang"], "Word type")).toThrow(
      "Word type must be one of: basic, slang.",
    );
  });
});
