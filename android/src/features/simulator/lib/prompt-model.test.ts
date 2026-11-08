// src/features/simulator/lib/prompt-model.test.ts
import { checkPromptValues, listPrompts, normaliseStoredPrompts, upsertPrompt } from "./prompt-model";

describe("listPrompts", () => {
  it("includes the built-in prompts and marks them", () => {
    expect(listPrompts({})).toEqual([
      { name: "captain_crush", content: "You are a strict, no-nonsense starship captain.", builtIn: true },
    ]);
  });

  it("lets a saved prompt replace a built-in with the same name", () => {
    expect(listPrompts({ captain_crush: "Gentle captain." })[0]).toEqual({
      name: "captain_crush",
      content: "Gentle captain.",
      builtIn: true,
    });
  });

  it("sorts saved prompts with the rest by name", () => {
    expect(listPrompts({ zed: "z", alpha: "a" }).map((prompt) => prompt.name)).toEqual([
      "alpha",
      "captain_crush",
      "zed",
    ]);
  });
});

describe("upsertPrompt", () => {
  it("creates a new name", () => {
    const result = upsertPrompt({}, { name: "barista", content: "You serve coffee." });
    expect(result.created).toBe(true);
    expect(result.message).toBe("Prompt 'barista' created.");
    expect(result.stored).toEqual({ barista: "You serve coffee." });
  });

  it("updates an existing saved name", () => {
    const result = upsertPrompt({ barista: "old" }, { name: "barista", content: "new" });
    expect(result.created).toBe(false);
    expect(result.message).toBe("Prompt 'barista' updated.");
    expect(result.stored).toEqual({ barista: "new" });
  });

  it("treats a built-in name as an update", () => {
    expect(upsertPrompt({}, { name: "captain_crush", content: "x" }).created).toBe(false);
  });

  it("treats inherited object names as new", () => {
    expect(upsertPrompt({}, { name: "constructor", content: "x" }).created).toBe(true);
  });

  it("trims the name and content before saving", () => {
    expect(upsertPrompt({}, { name: "  guide  ", content: "  Be kind.  " }).stored).toEqual({ guide: "Be kind." });
  });
});

describe("checkPromptValues", () => {
  it("requires a name and content", () => {
    expect(() => checkPromptValues({ name: " ", content: "x" })).toThrow("Name is required.");
    expect(() => checkPromptValues({ name: "a", content: "" })).toThrow("Content is required.");
  });

  it("rejects names over 200 characters", () => {
    expect(() => checkPromptValues({ name: "a".repeat(201), content: "x" })).toThrow(
      "Name must be 200 characters or fewer.",
    );
  });
});

describe("normaliseStoredPrompts", () => {
  it("keeps only named, non-empty text entries", () => {
    expect(normaliseStoredPrompts({ good: "text", blank: "  ", 3: "x", "": "y" })).toEqual({
      good: "text",
      "3": "x",
    });
  });

  it("returns nothing for damaged data", () => {
    expect(normaliseStoredPrompts(["a"])).toEqual({});
    expect(normaliseStoredPrompts(null)).toEqual({});
  });
});
