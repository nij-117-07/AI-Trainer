// src/features/clarity-trainer/lib/validate.test.ts
import { optionalText, requireOption, requireText } from "./validate";

describe("requireText", () => {
  it("trims and returns the value", () => {
    expect(requireText("  Hello team  ", "Your response", 2000)).toBe("Hello team");
  });

  it("rejects blank and over-long input", () => {
    expect(() => requireText("   ", "Your response", 2000)).toThrow("Your response is required.");
    expect(() => requireText("x".repeat(2001), "Your response", 2000)).toThrow(
      "Your response must be 2000 characters or fewer.",
    );
  });
});

describe("optionalText", () => {
  it("returns undefined for blank input", () => {
    expect(optionalText("  ", "Your context", 200)).toBeUndefined();
  });

  it("rejects text longer than the limit", () => {
    expect(() => optionalText("x".repeat(201), "Your context", 200)).toThrow();
  });
});

describe("requireOption", () => {
  it("returns a listed option and rejects anything else", () => {
    expect(requireOption("easy", ["easy", "hard"], "Difficulty")).toBe("easy");
    expect(() => requireOption("extreme", ["easy", "hard"], "Difficulty")).toThrow(
      "Difficulty must be one of: easy, hard.",
    );
  });
});
