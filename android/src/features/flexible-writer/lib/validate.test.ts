// src/features/flexible-writer/lib/validate.test.ts
import { optionalText, requireText } from "./validate";

describe("requireText", () => {
  it("trims and returns the value", () => {
    expect(requireText("  Copy editor  ", "System prompt", 2000)).toBe("Copy editor");
  });

  it("rejects blank and over-long input", () => {
    expect(() => requireText("   ", "Input data", 20000)).toThrow("Input data is required.");
    expect(() => requireText("x".repeat(2001), "System prompt", 2000)).toThrow(
      "System prompt must be 2000 characters or fewer.",
    );
  });
});

describe("optionalText", () => {
  it("returns undefined for blank input", () => {
    expect(optionalText("  ", "Additional instructions", 2000)).toBeUndefined();
  });

  it("keeps trimmed text and rejects text over the limit", () => {
    expect(optionalText(" Make it short ", "Additional instructions", 2000)).toBe("Make it short");
    expect(() => optionalText("x".repeat(2001), "Additional instructions", 2000)).toThrow(
      "Additional instructions must be 2000 characters or fewer.",
    );
  });
});
