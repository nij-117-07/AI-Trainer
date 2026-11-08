// src/features/tutor/lib/prompt-templates.test.ts
import {
  mergePromptTemplates,
  parseStoredPrompts,
  removePrompt,
  upsertPrompt,
  validatePromptInput,
} from "./prompt-templates";

const BUILT_IN = [{ name: "Socratic", content: "Built-in persona text." }];

describe("validatePromptInput", () => {
  it("trims the name and content", () => {
    expect(validatePromptInput({ name: "  coach_1 ", content: "  Be kind.  " })).toEqual({
      name: "coach_1",
      content: "Be kind.",
    });
  });

  it("rejects names with spaces or symbols", () => {
    expect(() => validatePromptInput({ name: "my prompt", content: "x" })).toThrow(/prompt name/);
    expect(() => validatePromptInput({ name: "a/b", content: "x" })).toThrow(/prompt name/);
  });

  it("requires content and enforces the length limit", () => {
    expect(() => validatePromptInput({ name: "ok", content: "   " })).toThrow("Prompt content is required.");
    expect(() => validatePromptInput({ name: "ok", content: "x".repeat(20001) })).toThrow(/20000 characters/);
  });
});

describe("parseStoredPrompts", () => {
  it("returns an empty list for non-array data", () => {
    expect(parseStoredPrompts(null)).toEqual([]);
    expect(parseStoredPrompts({ name: "x" })).toEqual([]);
  });

  it("drops malformed entries and keeps the last duplicate", () => {
    const parsed = parseStoredPrompts([
      { name: "coach", content: "first", createdAt: "a", updatedAt: "b" },
      { name: "bad name", content: "skip" },
      { name: "empty", content: "   " },
      null,
      { name: "coach", content: "second", createdAt: "c", updatedAt: "d" },
    ]);
    expect(parsed).toEqual([{ name: "coach", content: "second", createdAt: "c", updatedAt: "d" }]);
  });

  it("falls back to updatedAt when createdAt is missing", () => {
    const [entry] = parseStoredPrompts([{ name: "coach", content: "x", updatedAt: "2026-01-01" }]);
    expect(entry.createdAt).toBe("2026-01-01");
  });
});

describe("mergePromptTemplates", () => {
  it("lists built-in templates when nothing is saved", () => {
    expect(mergePromptTemplates(BUILT_IN, [])).toEqual([
      { name: "Socratic", content: "Built-in persona text.", source: "built-in" },
    ]);
  });

  it("marks a saved template that shares a built-in name as customized", () => {
    const merged = mergePromptTemplates(BUILT_IN, [
      { name: "Socratic", content: "Mine.", createdAt: "a", updatedAt: "b" },
    ]);
    expect(merged).toEqual([{ name: "Socratic", content: "Mine.", source: "customized" }]);
  });

  it("adds custom templates sorted by name", () => {
    const merged = mergePromptTemplates(BUILT_IN, [
      { name: "zeta", content: "z", createdAt: "a", updatedAt: "b" },
      { name: "alpha", content: "a", createdAt: "a", updatedAt: "b" },
    ]);
    expect(merged.map((item) => [item.name, item.source])).toEqual([
      ["alpha", "custom"],
      ["Socratic", "built-in"],
      ["zeta", "custom"],
    ]);
  });
});

describe("upsertPrompt and removePrompt", () => {
  it("keeps createdAt when a template is updated", () => {
    const saved = [{ name: "coach", content: "old", createdAt: "2026-01-01", updatedAt: "2026-01-01" }];
    const next = upsertPrompt(saved, { name: "coach", content: "new" }, "2026-02-02");
    expect(next).toEqual([{ name: "coach", content: "new", createdAt: "2026-01-01", updatedAt: "2026-02-02" }]);
  });

  it("adds a new template with the current time", () => {
    const next = upsertPrompt([], { name: "coach", content: "hi" }, "2026-02-02");
    expect(next).toEqual([{ name: "coach", content: "hi", createdAt: "2026-02-02", updatedAt: "2026-02-02" }]);
  });

  it("removes only the named template", () => {
    const saved = [
      { name: "a", content: "1", createdAt: "", updatedAt: "" },
      { name: "b", content: "2", createdAt: "", updatedAt: "" },
    ];
    expect(removePrompt(saved, "a").map((item) => item.name)).toEqual(["b"]);
  });
});
