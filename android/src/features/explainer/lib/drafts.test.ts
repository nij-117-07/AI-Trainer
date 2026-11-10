// src/features/explainer/lib/drafts.test.ts
import {
  FEYNMAN_DEFAULTS,
  parseFeynman,
  parseQuickExplain,
  parseSocratic,
  parseTutorial,
  QUICK_EXPLAIN_DEFAULTS,
  SOCRATIC_DEFAULTS,
  TUTORIAL_DEFAULTS,
} from "./drafts";

describe("explainer drafts", () => {
  it("starts with empty topics and sensible choices", () => {
    expect(QUICK_EXPLAIN_DEFAULTS.topic).toBe("");
    expect(TUTORIAL_DEFAULTS.topic).toBe("");
    expect(FEYNMAN_DEFAULTS.complexTopic).toBe("");
    expect(SOCRATIC_DEFAULTS.topic).toBe("");
    expect(SOCRATIC_DEFAULTS.context).toBe("");
  });

  it("keeps a saved quick explain draft and its result", () => {
    const draft = parseQuickExplain({
      form: { topic: "Entropy", explanationLevel: "high-school senior", context: "" },
      result: { explanation: "Disorder.", keyTakeaway: "Energy spreads." },
    });
    expect(draft.form).toEqual({ topic: "Entropy", explanationLevel: "high-school senior", context: "" });
    expect(draft.result).toEqual({ explanation: "Disorder.", keyTakeaway: "Energy spreads." });
  });

  it("falls back to defaults for damaged data", () => {
    const draft = parseTutorial({ form: { topic: 42, explanationStyle: "history-first" } });
    expect(draft.form).toEqual({
      topic: "",
      expertiseLevel: TUTORIAL_DEFAULTS.expertiseLevel,
      explanationStyle: "history-first",
    });
    expect(draft.result).toBeNull();
  });

  it("clamps the Feynman age and the Socratic question count", () => {
    expect(parseFeynman({ form: { complexTopic: "X", targetAge: 99 } }).form.targetAge).toBe(25);
    expect(parseFeynman({ form: { complexTopic: "X", targetAge: "old" } }).form.targetAge).toBe(5);
    expect(parseSocratic({ form: { numQuestions: 0 } }).form.numQuestions).toBe(1);
  });

  it("drops Socratic questions with no text", () => {
    const draft = parseSocratic({
      result: {
        pedagogicalGoal: "Find the crux",
        questionsForDiscovery: [{ questionText: "Why?", guidingHint: "Think about cost." }, { questionText: "  " }, "junk"],
      },
    });
    expect(draft.result?.questionsForDiscovery).toEqual([
      { questionText: "Why?", cognitiveChallenge: "", guidingHint: "Think about cost." },
    ]);
  });

  it("keeps only text items in Feynman metaphors", () => {
    const draft = parseFeynman({ result: { explanation: "Simple.", keyMetaphors: ["a", 3, "", "b"], funAnalogy: "" } });
    expect(draft.result?.keyMetaphors).toEqual(["a", "b"]);
  });
});
