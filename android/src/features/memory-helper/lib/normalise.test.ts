// src/features/memory-helper/lib/normalise.test.ts
import { listOf, optionalText, requireText, textOf } from "./normalise";
import { MEMORY_DEFAULTS, restoreMemoryDraft } from "./drafts";
import { isMemoryTechnique } from "./types";

describe("input checks", () => {
  it("enforces the minimum and maximum topic length", () => {
    expect(requireText("  Cells  ", "Topic", 2000, 5)).toBe("Cells");
    expect(() => requireText("  ab ", "Topic", 2000, 5)).toThrow("Topic must be at least 5 characters.");
    expect(() => requireText("x".repeat(2001), "Topic", 2000, 5)).toThrow("Topic must be 2000 characters or fewer.");
  });

  it("returns undefined for an empty technique", () => {
    expect(optionalText("  ", 100)).toBeUndefined();
  });

  it("recognises only the listed techniques", () => {
    expect(isMemoryTechnique("Peg Words")).toBe(true);
    expect(isMemoryTechnique("Mnemonics")).toBe(false);
  });
});

describe("tolerant readers", () => {
  it("returns an empty list for a missing field", () => {
    expect(listOf<string>(undefined)).toEqual([]);
    expect(textOf(undefined)).toBe("");
  });
});

describe("draft restore", () => {
  it("falls back to defaults when the stored draft is damaged", () => {
    const restored = restoreMemoryDraft({ form: { topic: 3, technique: "Mnemonics" }, result: [] });
    expect(restored.form).toEqual(MEMORY_DEFAULTS);
    expect(restored.result).toBeNull();
  });

  it("normalises saved hooks and drops entries that are not objects", () => {
    const restored = restoreMemoryDraft({
      form: { topic: "Krebs cycle steps", technique: "Chunking" },
      result: {
        explanation: "Groups help.",
        memoryHooks: [{ concept: "Citrate", hook: "Lemon" }, "bad", null, { concept: 5 }],
        retentionPlan: "Review daily.",
      },
    });
    expect(restored.form).toEqual({ topic: "Krebs cycle steps", technique: "Chunking" });
    expect(restored.result?.memoryHooks).toEqual([
      { concept: "Citrate", hook: "Lemon" },
      { concept: "", hook: "" },
    ]);
  });
});
