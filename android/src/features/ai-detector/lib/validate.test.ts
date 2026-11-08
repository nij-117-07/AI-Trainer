// src/features/ai-detector/lib/validate.test.ts
import { COMMENTS_MAX, TEXT_MAX, optionalText, requireText } from "./validate";

describe("requireText", () => {
  it("trims and returns the value", () => {
    expect(requireText("  some text  ", "Text", TEXT_MAX)).toBe("some text");
  });

  it("rejects blank and over-long input", () => {
    expect(() => requireText("   ", "Text to analyze", TEXT_MAX)).toThrow("Text to analyze is required.");
    expect(() => requireText("x".repeat(TEXT_MAX + 1), "Text to analyze", TEXT_MAX)).toThrow(
      "Text to analyze must be 50,000 characters or fewer.",
    );
  });

  it("accepts text exactly at the limit", () => {
    expect(requireText("x".repeat(TEXT_MAX), "Text", TEXT_MAX)).toHaveLength(TEXT_MAX);
  });
});

describe("optionalText", () => {
  it("returns undefined for blank input", () => {
    expect(optionalText("  \n ", "Context", COMMENTS_MAX)).toBeUndefined();
  });

  it("returns trimmed text", () => {
    expect(optionalText(" from a blog ", "Context", COMMENTS_MAX)).toBe("from a blog");
  });

  it("rejects text longer than the limit", () => {
    expect(() => optionalText("x".repeat(COMMENTS_MAX + 1), "Context", COMMENTS_MAX)).toThrow(
      "Context must be 2,000 characters or fewer.",
    );
  });
});
