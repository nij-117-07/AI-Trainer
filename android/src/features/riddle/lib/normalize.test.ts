import { coerceBool, normalizeEvaluation, normalizeRiddle, sanitizeForm, sanitizeRound } from "./normalize";
import { DEFAULT_FORM } from "../options";

describe("coerceBool", () => {
  it("reads booleans and text forms of true", () => {
    expect(coerceBool(true)).toBe(true);
    expect(coerceBool(" Yes ")).toBe(true);
    expect(coerceBool("1")).toBe(true);
  });

  it("treats anything else as false", () => {
    expect(coerceBool(false)).toBe(false);
    expect(coerceBool("no")).toBe(false);
    expect(coerceBool(undefined)).toBe(false);
  });
});

describe("normalizeRiddle", () => {
  it("trims the fields", () => {
    expect(
      normalizeRiddle({ riddleText: " What has keys? ", solution: " A piano. ", cognitiveTrigger: " Lateral " }),
    ).toEqual({ riddleText: "What has keys?", solution: "A piano.", cognitiveTrigger: "Lateral" });
  });

  it("rejects a riddle without text or solution", () => {
    expect(() => normalizeRiddle({ riddleText: "", solution: "x" })).toThrow("did not return a complete riddle");
    expect(() => normalizeRiddle({ riddleText: "x" })).toThrow("did not return a complete riddle");
  });
});

describe("normalizeEvaluation", () => {
  it("coerces the verdict and tolerates missing feedback", () => {
    expect(normalizeEvaluation({ isCorrect: "true", feedback: undefined, thoughtRedirection: " Try ids " })).toEqual({
      isCorrect: true,
      feedback: "",
      thoughtRedirection: "Try ids",
    });
  });
});

describe("sanitizeForm", () => {
  it("falls back to defaults for a missing draft", () => {
    expect(sanitizeForm(null)).toEqual(DEFAULT_FORM);
  });

  it("keeps custom choices and instructions", () => {
    expect(
      sanitizeForm({ fieldOfInterest: "Art", targetDomain: "musical", difficultyLevel: "expert", userInstructions: " Short " }),
    ).toEqual({
      fieldOfInterest: "Art",
      targetDomain: "musical",
      difficultyLevel: "expert",
      userInstructions: " Short ",
    });
  });

  it("uses the default when a choice is blank or damaged", () => {
    expect(sanitizeForm({ targetDomain: "  ", difficultyLevel: 3 })).toEqual({
      ...DEFAULT_FORM,
      fieldOfInterest: "",
    });
  });
});

describe("sanitizeRound", () => {
  it("returns null for a damaged round", () => {
    expect(sanitizeRound({ riddle: { riddleText: "" } })).toBeNull();
    expect(sanitizeRound("oops")).toBeNull();
  });

  it("keeps only well-formed attempts", () => {
    const round = sanitizeRound({
      riddle: { riddleText: "Q", solution: "A", cognitiveTrigger: "T" },
      attempts: [{ answer: "a", evaluation: { isCorrect: false, feedback: "f", thoughtRedirection: "t" } }, { answer: "b" }],
      userAnswer: "  draft ",
    });
    expect(round?.attempts).toHaveLength(1);
    expect(round?.attempts[0].evaluation.isCorrect).toBe(false);
    expect(round?.userAnswer).toBe("draft");
  });
});
