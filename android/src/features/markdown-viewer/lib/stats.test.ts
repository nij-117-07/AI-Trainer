// src/features/markdown-viewer/lib/stats.test.ts
import { countLines, countWords } from "./stats";

describe("countWords", () => {
  it("counts whitespace-separated words and ignores surrounding space", () => {
    expect(countWords("  Hello   big\nworld  ")).toBe(3);
  });

  it("returns zero for blank text", () => {
    expect(countWords("   \n\t ")).toBe(0);
  });
});

describe("countLines", () => {
  it("counts one line for empty text and one more per newline", () => {
    expect(countLines("")).toBe(1);
    expect(countLines("a\nb\nc")).toBe(3);
  });
});
