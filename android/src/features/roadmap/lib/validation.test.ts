// src/features/roadmap/lib/validation.test.ts
import { cleanText, normalizeMode, optionalText, requireText } from "./validation";

describe("requireText", () => {
  it("trims and returns the text", () => {
    expect(requireText("  UI/UX Design  ", "Subject", 200)).toBe("UI/UX Design");
  });

  it("rejects blank input with the field label", () => {
    expect(() => requireText("   ", "Subject", 200)).toThrow("Subject is required.");
  });

  it("rejects text over the limit", () => {
    expect(() => requireText("abcd", "Subject", 3)).toThrow("Subject must be 3 characters or fewer.");
  });
});

describe("optionalText and cleanText", () => {
  it("returns undefined for blank optional text", () => {
    expect(optionalText("  ", 10)).toBeUndefined();
  });

  it("caps optional text to the limit", () => {
    expect(optionalText("abcdef", 3)).toBe("abc");
  });

  it("trims and caps without throwing", () => {
    expect(cleanText("  hello world ", 5)).toBe("hello");
  });
});

describe("normalizeMode", () => {
  it("keeps short and falls back to detailed", () => {
    expect(normalizeMode("short")).toBe("short");
    expect(normalizeMode("detailed")).toBe("detailed");
    expect(normalizeMode("anything")).toBe("detailed");
    expect(normalizeMode(undefined)).toBe("detailed");
  });
});
