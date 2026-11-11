// src/features/idioms/lib/text.test.ts
import { plainSummary } from "./text";

describe("plainSummary", () => {
  it("removes Markdown and joins lines", () => {
    expect(plainSummary("**Bold** text\n- second line")).toBe("Bold text second line");
  });

  it("cuts long text at a word boundary with an ellipsis", () => {
    expect(plainSummary("a b c d e", 5)).toBe("a b…");
  });
});
