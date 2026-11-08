// src/features/puzzle/lib/persistence.test.ts
import { DEFAULT_PUZZLE_FORM } from "../options";
import { parseSavedForm } from "./persistence";

describe("parseSavedForm", () => {
  it("returns the defaults when nothing is saved", () => {
    expect(parseSavedForm(null)).toEqual(DEFAULT_PUZZLE_FORM);
  });

  it("keeps valid saved fields and falls back for invalid enum values", () => {
    expect(
      parseSavedForm({
        fieldOfInterest: "Quantum Physics",
        puzzleType: "cipher",
        targetDomain: "musical",
        difficultyLevel: "expert",
      }),
    ).toEqual({
      fieldOfInterest: "Quantum Physics",
      puzzleType: "cipher",
      targetDomain: DEFAULT_PUZZLE_FORM.targetDomain,
      difficultyLevel: "expert",
    });
  });
});
