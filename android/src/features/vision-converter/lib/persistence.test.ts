// src/features/vision-converter/lib/persistence.test.ts
import { parseSavedState } from "./persistence";

describe("parseSavedState", () => {
  it("restores a saved instruction and Markdown", () => {
    expect(parseSavedState({ instruction: "Tables only.", markdownOutput: "| a |" })).toEqual({
      instruction: "Tables only.",
      markdownOutput: "| a |",
    });
  });

  it("falls back to defaults for missing or damaged drafts", () => {
    expect(parseSavedState(null)).toEqual({ instruction: "", markdownOutput: null });
    expect(parseSavedState(["x"])).toEqual({ instruction: "", markdownOutput: null });
    expect(parseSavedState({ instruction: 3, markdownOutput: { a: 1 } })).toEqual({
      instruction: "",
      markdownOutput: null,
    });
  });
});
