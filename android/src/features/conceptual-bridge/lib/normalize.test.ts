// src/features/conceptual-bridge/lib/normalize.test.ts
import { clampCognitiveScore, normalizeBridge } from "./normalize";
import { DEFAULT_BRIDGE_FORM, normalizeDraft } from "./draft";

describe("clampCognitiveScore", () => {
  it("clamps the score to 1-5 and truncates decimals", () => {
    expect(clampCognitiveScore(9)).toBe(5);
    expect(clampCognitiveScore(0)).toBe(1);
    expect(clampCognitiveScore(4.9)).toBe(4);
    expect(clampCognitiveScore("2")).toBe(2);
  });

  it("uses the default of 3 for missing or non-numeric values", () => {
    expect(clampCognitiveScore(undefined)).toBe(3);
    expect(clampCognitiveScore(null)).toBe(3);
    expect(clampCognitiveScore("")).toBe(3);
    expect(clampCognitiveScore("high")).toBe(3);
  });
});

describe("normalizeBridge", () => {
  it("fills missing fields with safe values", () => {
    expect(normalizeBridge({ structuralAnalogy: "Both move energy." })).toEqual({
      structuralAnalogy: "Both move energy.",
      bridgingNarrative: "",
      insightQuestion: "",
      cognitiveFlexibilityScore: 3,
    });
  });

  it("returns empty values for a non-object response", () => {
    expect(normalizeBridge(null)).toEqual({
      structuralAnalogy: "",
      bridgingNarrative: "",
      insightQuestion: "",
      cognitiveFlexibilityScore: 3,
    });
  });
});

describe("normalizeDraft", () => {
  it("uses the defaults when nothing is stored", () => {
    expect(normalizeDraft(null)).toEqual({ form: DEFAULT_BRIDGE_FORM, result: null });
  });

  it("keeps the saved concepts and custom input", () => {
    const draft = normalizeDraft({
      form: { conceptA: "Cells", conceptB: "Cities", customUserInput: "Use a kitchen analogy" },
      result: null,
    });
    expect(draft.form).toEqual({
      conceptA: "Cells",
      conceptB: "Cities",
      customUserInput: "Use a kitchen analogy",
    });
  });

  it("normalises a stored result", () => {
    const draft = normalizeDraft({ form: {}, result: { insightQuestion: "What carries the signal?" } });
    expect(draft.result?.insightQuestion).toBe("What carries the signal?");
    expect(draft.result?.cognitiveFlexibilityScore).toBe(3);
  });
});
