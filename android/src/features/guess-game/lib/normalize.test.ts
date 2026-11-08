import { normalizeCoach, normalizeGuess, normalizeHint, normalizeSetup } from "./normalize";
import { clampUnit, isTrue } from "./text";

describe("clampUnit", () => {
  it("keeps scores between 0 and 1", () => {
    expect(clampUnit(0.4)).toBe(0.4);
    expect(clampUnit(1.7)).toBe(1);
    expect(clampUnit(-0.2)).toBe(0);
  });

  it("reads numeric strings and treats bad values as 0", () => {
    expect(clampUnit("0.75")).toBe(0.75);
    expect(clampUnit(undefined)).toBe(0);
    expect(clampUnit("high")).toBe(0);
    expect(clampUnit(Number.NaN)).toBe(0);
  });
});

describe("isTrue", () => {
  it("accepts true and the string true only", () => {
    expect(isTrue(true)).toBe(true);
    expect(isTrue(" TRUE ")).toBe(true);
    expect(isTrue("yes")).toBe(false);
    expect(isTrue(undefined)).toBe(false);
  });
});

describe("normalizeSetup", () => {
  it("keeps the mystery item and the difficulty's guess limit", () => {
    expect(normalizeSetup({ mysteryItem: " Lighthouse ", funFact: "Old.", firstHint: "Seven letters." }, 7)).toEqual({
      mysteryItem: "Lighthouse",
      funFact: "Old.",
      firstHint: "Seven letters.",
      maxGuesses: 7,
    });
  });

  it("rejects a setup with no mystery item", () => {
    expect(() => normalizeSetup({ mysteryItem: "  " }, 7)).toThrow("did not pick a mystery item");
  });
});

describe("normalizeHint", () => {
  it("returns the hint and encouragement", () => {
    expect(normalizeHint({ newHint: "It has a roof.", hintEncouragement: "Nice!" })).toEqual({
      hint: "It has a roof.",
      encouragement: "Nice!",
    });
  });

  it("rejects an empty hint", () => {
    expect(() => normalizeHint({ newHint: undefined })).toThrow("did not return a hint");
  });
});

describe("normalizeGuess", () => {
  it("reads a correct guess and clamps closeness", () => {
    expect(
      normalizeGuess({ isCorrect: true, feedback: "Yes", closenessScore: 3, suggestion: "" }),
    ).toEqual({ correct: true, feedback: "Yes", closeness: 1, suggestion: "" });
  });

  it("defaults missing fields for a wrong guess", () => {
    expect(normalizeGuess({})).toEqual({ correct: false, feedback: "", closeness: 0, suggestion: "" });
  });
});

describe("normalizeCoach", () => {
  it("maps an empty partial reveal to null", () => {
    expect(
      normalizeCoach({ coachingMessage: "Think of places.", thinkingFramework: "Work backwards", partialReveal: " ", askForHint: true }),
    ).toEqual({ coaching: "Think of places.", framework: "Work backwards", partialReveal: null, shouldHint: true });
  });
});
