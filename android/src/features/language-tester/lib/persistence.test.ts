// src/features/language-tester/lib/persistence.test.ts
import { mergeSavedForm, normalizeChatHistory } from "./persistence";

const DEFAULTS = { targetLanguage: "French", numQuestions: 3, seed: "" };

describe("mergeSavedForm", () => {
  it("keeps saved fields whose type matches the default", () => {
    expect(mergeSavedForm(DEFAULTS, { targetLanguage: "German", numQuestions: "many" })).toEqual({
      ...DEFAULTS,
      targetLanguage: "German",
    });
  });

  it("returns the defaults for a damaged draft", () => {
    expect(mergeSavedForm(DEFAULTS, "oops")).toEqual(DEFAULTS);
  });
});

describe("normalizeChatHistory", () => {
  it("keeps turns with content and restores their feedback", () => {
    const turns = normalizeChatHistory([
      { role: "user", content: "Bonjour" },
      {
        role: "assistant",
        content: "Oui ?",
        feedback: { linguisticCritique: "Nice.", fluencyScore: 12, suggestedStrategies: [], isGoalAchieved: false },
      },
      { role: "user", content: "  " },
      null,
    ]);
    expect(turns).toHaveLength(2);
    expect(turns[0]).toEqual({ role: "user", content: "Bonjour" });
    expect(turns[1].feedback?.fluencyScore).toBe(10);
  });

  it("returns an empty list for a non-list value", () => {
    expect(normalizeChatHistory({ role: "user" })).toEqual([]);
  });
});
