// src/features/ai-detector/lib/persistence.test.ts
import { INITIAL_AI_DETECTOR_STATE, parseSavedState } from "./persistence";

const savedDetection = {
  aiScore: 0.6,
  verdict: "Mixed",
  reason: "Some patterns.",
  flaggedPatterns: ["Furthermore"],
  suggestedChanges: ["Shorten sentences"],
};

describe("parseSavedState", () => {
  it("returns the empty state for missing or non-object data", () => {
    expect(parseSavedState(null)).toEqual(INITIAL_AI_DETECTOR_STATE);
    expect(parseSavedState("garbage")).toEqual(INITIAL_AI_DETECTOR_STATE);
  });

  it("restores the saved form and result", () => {
    const state = parseSavedState({
      form: { textToCheck: "  Original  ", additionalComments: "From a blog" },
      result: savedDetection,
    });
    expect(state.form).toEqual({ textToCheck: "  Original  ", additionalComments: "From a blog" });
    expect(state.result?.aiScore).toBe(0.6);
    expect(state.result?.verdict).toBe("Mixed");
  });

  it("fills missing or non-text form fields with empty strings", () => {
    expect(parseSavedState({ form: { textToCheck: 7 } }).form).toEqual({
      textToCheck: "",
      additionalComments: "",
    });
  });

  it("drops a damaged result instead of keeping it", () => {
    expect(parseSavedState({ result: { aiScore: "nope" } }).result).toBeNull();
  });
});
