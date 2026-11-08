// src/features/vision-converter/lib/normalize.test.ts
import { normalizeMarkdown } from "./normalize";

describe("normalizeMarkdown", () => {
  it("returns the trimmed Markdown output", () => {
    expect(normalizeMarkdown({ markdownOutput: "  # Report\n" })).toBe("# Report");
  });

  it("returns empty text when the model omits the field or sends a wrong type", () => {
    expect(normalizeMarkdown({})).toBe("");
    expect(normalizeMarkdown({ markdownOutput: 42 })).toBe("");
    expect(normalizeMarkdown(null)).toBe("");
    expect(normalizeMarkdown(undefined)).toBe("");
  });
});
