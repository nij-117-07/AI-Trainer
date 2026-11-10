import { DEFAULT_PUZZLE_FORM } from "../options";
import { parseSavedForm } from "./persistence";

describe("parseSavedForm", () => {
  it("returns the defaults when nothing is saved", () => {
    expect(parseSavedForm(null)).toEqual(DEFAULT_PUZZLE_FORM);
  });

  it("keeps saved fields, including custom choices and instructions", () => {
    expect(
      parseSavedForm({
        fieldOfInterest: "Quantum Physics",
        puzzleType: "anagram",
        targetDomain: "musical",
        difficultyLevel: "expert",
        userInstructions: "Keep it short",
      }),
    ).toEqual({
      fieldOfInterest: "Quantum Physics",
      puzzleType: "anagram",
      targetDomain: "musical",
      difficultyLevel: "expert",
      userInstructions: "Keep it short",
    });
  });

  it("falls back to the default for blank or damaged choices", () => {
    expect(parseSavedForm({ puzzleType: "   ", targetDomain: 7, difficultyLevel: "" })).toEqual({
      ...DEFAULT_PUZZLE_FORM,
    });
  });
});
