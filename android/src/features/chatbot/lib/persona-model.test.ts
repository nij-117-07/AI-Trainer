// src/features/chatbot/lib/persona-model.test.ts
import {
  createPersona,
  duplicatePersona,
  EMPTY_PERSONA_DRAFT,
  normalizePersonas,
  parseStarterText,
  PERSONA_LIMITS,
  seedPersona,
  updatePersona,
  validatePersonaDraft,
} from "./persona-model";
import { normalizeChatbotSettings, validateHistoryLimit } from "./settings-model";

const now = "2026-01-01T00:00:00.000Z";
const valid = { ...EMPTY_PERSONA_DRAFT, name: "Tutor" };

describe("validatePersonaDraft", () => {
  it("accepts a named persona with default sampling", () => {
    expect(validatePersonaDraft(valid)).toBeNull();
  });

  it("requires a name", () => {
    expect(validatePersonaDraft({ ...valid, name: "   " })).toBe("Give the persona a name.");
  });

  it("checks the sampling ranges", () => {
    expect(validatePersonaDraft({ ...valid, temperature: 2.5 })).toContain("Temperature");
    expect(validatePersonaDraft({ ...valid, topP: 0 })).toContain("Top P");
    expect(validatePersonaDraft({ ...valid, maxTokens: 1.5 })).toContain("Max tokens");
    expect(validatePersonaDraft({ ...valid, maxTokens: PERSONA_LIMITS.maxTokens + 1 })).toContain("Max tokens");
  });

  it("rejects a system prompt over the limit", () => {
    const longPrompt = "x".repeat(PERSONA_LIMITS.systemPromptChars + 1);
    expect(validatePersonaDraft({ ...valid, systemPrompt: longPrompt })).toContain("system prompt");
  });
});

describe("createPersona and updatePersona", () => {
  it("trims text, keeps at most four starters, and falls back to the default avatar", () => {
    const persona = createPersona(
      { ...valid, name: "  Coach  ", avatar: "  ", starters: [" one ", "", "two", "three", "four", "five"] },
      "p1",
      now,
    );
    expect(persona.name).toBe("Coach");
    expect(persona.avatar).toBe("🤖");
    expect(persona.starters).toEqual(["one", "two", "three", "four"]);
    expect(persona.createdAt).toBe(now);
  });

  it("keeps the id and creation time when updating", () => {
    const original = createPersona(valid, "p1", now);
    const updated = updatePersona(original, { ...valid, temperature: 1.234 }, "2026-02-01T00:00:00.000Z");
    expect(updated.id).toBe("p1");
    expect(updated.createdAt).toBe(now);
    expect(updated.updatedAt).toBe("2026-02-01T00:00:00.000Z");
    expect(updated.temperature).toBe(1.23);
  });

  it("duplicates with a new id and a copy suffix", () => {
    const copy = duplicatePersona(createPersona(valid, "p1", now), "p2", now);
    expect(copy.id).toBe("p2");
    expect(copy.name).toBe("Tutor (copy)");
  });
});

describe("parseStarterText", () => {
  it("reads one starter per line and drops blanks", () => {
    expect(parseStarterText("Explain this\n\n  Check my work  \n")).toEqual(["Explain this", "Check my work"]);
  });
});

describe("normalizePersonas", () => {
  it("drops entries without an id or name and fills missing fields", () => {
    const personas = normalizePersonas([{ id: "a", name: "Ada" }, { name: "no id" }, null]);
    expect(personas).toHaveLength(1);
    expect(personas[0]).toMatchObject({ id: "a", name: "Ada", avatar: "🤖", temperature: 0.7, topP: 1, maxTokens: 0, starters: [] });
  });

  it("returns an empty list for non-array data", () => {
    expect(normalizePersonas({ not: "a list" })).toEqual([]);
  });

  it("seeds a usable starter persona", () => {
    const seeded = seedPersona("seed", now);
    expect(validatePersonaDraft(seeded)).toBeNull();
    expect(seeded.starters.length).toBeGreaterThan(0);
  });
});

describe("chatbot settings", () => {
  it("defaults when nothing is saved", () => {
    expect(normalizeChatbotSettings(null)).toEqual({ defaultPersonaId: "", streamReplies: true, historyLimit: 30, autoSpeak: false });
  });

  it("keeps valid saved values and replaces an out-of-range history limit", () => {
    expect(normalizeChatbotSettings({ defaultPersonaId: "p1", streamReplies: false, historyLimit: 12, autoSpeak: true })).toEqual({
      defaultPersonaId: "p1",
      streamReplies: false,
      historyLimit: 12,
      autoSpeak: true,
    });
    expect(normalizeChatbotSettings({ historyLimit: 500 }).historyLimit).toBe(30);
  });

  it("validates the history length range", () => {
    expect(validateHistoryLimit(2)).toBeNull();
    expect(validateHistoryLimit(1)).not.toBeNull();
    expect(validateHistoryLimit(3.5)).not.toBeNull();
  });
});
