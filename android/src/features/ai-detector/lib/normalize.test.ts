// src/features/ai-detector/lib/normalize.test.ts
import { normalizeDetection, normalizeHumanized, unitOf, verdictFromScore } from "./normalize";

describe("unitOf", () => {
  it("keeps values already on the 0–1 scale", () => {
    expect(unitOf(0.42)).toBe(0.42);
    expect(unitOf("0.9")).toBe(0.9);
  });

  it("scales a 0–100 percentage down", () => {
    expect(unitOf(85)).toBe(0.85);
  });

  it("clamps out-of-range values and rejects non-numbers", () => {
    expect(unitOf(-0.2)).toBe(0);
    expect(unitOf(0)).toBe(0);
    expect(unitOf("not a number")).toBeNull();
    expect(unitOf(undefined)).toBeNull();
  });
});

describe("verdictFromScore", () => {
  it("maps the score to a verdict band", () => {
    expect(verdictFromScore(0.9)).toBe("Likely AI");
    expect(verdictFromScore(0.1)).toBe("Likely Human");
    expect(verdictFromScore(0.5)).toBe("Mixed");
  });
});

describe("normalizeDetection", () => {
  it("returns a typed detection and trims the text fields", () => {
    expect(
      normalizeDetection({
        aiScore: 0.8,
        verdict: "Likely AI",
        reason: "  Formal transitions.  ",
        flaggedPatterns: [" Furthermore ", ""],
        suggestedChanges: ["Add a personal example"],
      }),
    ).toEqual({
      aiScore: 0.8,
      verdict: "Likely AI",
      reason: "Formal transitions.",
      flaggedPatterns: ["Furthermore"],
      suggestedChanges: ["Add a personal example"],
    });
  });

  it("throws when the score is missing", () => {
    expect(() => normalizeDetection({ verdict: "Mixed" })).toThrow("did not return an AI score");
  });

  it("derives the verdict from the score when the model gives an unknown verdict", () => {
    const result = normalizeDetection({ aiScore: 0.2, verdict: "Probably fine" });
    expect(result.verdict).toBe("Likely Human");
  });

  it("guards lists and strings that are missing or the wrong type", () => {
    expect(normalizeDetection({ aiScore: 0.5, verdict: "Mixed", flaggedPatterns: 7 })).toEqual({
      aiScore: 0.5,
      verdict: "Mixed",
      reason: "",
      flaggedPatterns: [],
      suggestedChanges: [],
    });
  });
});

describe("normalizeHumanized", () => {
  it("returns the rewrite, changes, and confidence", () => {
    expect(
      normalizeHumanized({
        humanizedText: "  I tried it last week.  ",
        changesMade: ["Added a first-person anecdote"],
        confidence: 0.75,
      }),
    ).toEqual({
      humanizedText: "I tried it last week.",
      changesMade: ["Added a first-person anecdote"],
      confidence: 0.75,
    });
  });

  it("throws when the rewrite is empty", () => {
    expect(() => normalizeHumanized({ humanizedText: "  ", confidence: 0.5 })).toThrow("no rewritten text");
  });

  it("throws when the confidence is missing", () => {
    expect(() => normalizeHumanized({ humanizedText: "Hello" })).toThrow("did not return a confidence");
  });
});
