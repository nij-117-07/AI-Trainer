// src/features/translator/lib/validate.test.ts
import { optionalText, requireText, requireTone } from "./validate";

describe("requireText", () => {
  it("trims and returns the text", () => {
    expect(requireText("  hello  ", "Text", 10)).toBe("hello");
  });

  it("rejects blank input", () => {
    expect(() => requireText("   ", "Text to translate", 10)).toThrow("Text to translate is required.");
  });

  it("rejects text over the limit", () => {
    expect(() => requireText("abcdef", "Source language", 5)).toThrow(
      "Source language must be 5 characters or fewer.",
    );
  });
});

describe("optionalText", () => {
  it("returns undefined for blank input", () => {
    expect(optionalText("  ", "Reference material", 10)).toBeUndefined();
  });

  it("returns trimmed text when present", () => {
    expect(optionalText(" glossary ", "Reference material", 20)).toBe("glossary");
  });

  it("rejects text over the limit", () => {
    expect(() => optionalText("abcdef", "Custom instructions", 3)).toThrow(
      "Custom instructions must be 3 characters or fewer.",
    );
  });
});

describe("requireTone", () => {
  it("accepts a listed tone", () => {
    expect(requireTone("poetic")).toBe("poetic");
  });

  it("rejects a tone outside the backend enum", () => {
    expect(() => requireTone("snarky")).toThrow("Tone must be one of: formal, casual, business, poetic, technical.");
  });
});
