// src/features/puzzle/lib/normalize.test.ts
import { normalizeEvaluation, normalizePuzzle, readRound } from "./normalize";

describe("normalizePuzzle", () => {
  it("keeps the puzzle fields as trimmed text", () => {
    expect(
      normalizePuzzle({
        puzzlerPersona: " The Sphinx ",
        puzzleText: "What has keys but no locks?",
        solution: "A piano.",
        cognitiveTrigger: "Double meaning",
      }),
    ).toEqual({
      puzzlerPersona: "The Sphinx",
      puzzleText: "What has keys but no locks?",
      solution: "A piano.",
      cognitiveTrigger: "Double meaning",
    });
  });

  it("rejects a puzzle with no text", () => {
    expect(() => normalizePuzzle({ puzzleText: "  " })).toThrow("The puzzle came back empty.");
    expect(() => normalizePuzzle(undefined)).toThrow();
  });
});

describe("normalizeEvaluation", () => {
  it("keeps the hint only for wrong answers", () => {
    const wrong = normalizeEvaluation({ isCorrect: false, hintRedirection: "Check the clue", accuracyScore: 0.3 });
    expect(wrong.isCorrect).toBe(false);
    expect(wrong.hintRedirection).toBe("Check the clue");

    const right = normalizeEvaluation({ isCorrect: true, hintRedirection: "Unused", accuracyScore: 1 });
    expect(right.isCorrect).toBe(true);
    expect(right.hintRedirection).toBeNull();
  });

  it("coerces text booleans and clamps the accuracy score", () => {
    expect(normalizeEvaluation({ isCorrect: "yes", accuracyScore: 4 }).isCorrect).toBe(true);
    expect(normalizeEvaluation({ isCorrect: "no", accuracyScore: 4 }).accuracyScore).toBe(1);
    expect(normalizeEvaluation({ isCorrect: false, accuracyScore: -2 }).accuracyScore).toBe(0);
  });

  it("uses 0.5 when the accuracy score is missing", () => {
    expect(normalizeEvaluation({ isCorrect: false }).accuracyScore).toBe(0.5);
  });
});

describe("readRound", () => {
  it("returns null when the saved puzzle is missing", () => {
    expect(readRound({ attempts: [] })).toBeNull();
  });

  it("drops malformed attempts and an unknown puzzle type falls back to riddle", () => {
    const round = readRound({
      puzzle: { puzzleText: "Riddle text", solution: "Answer" },
      puzzleType: "bingo",
      attempts: [
        { answer: "guess", evaluation: { isCorrect: false, accuracyScore: 0.2 } },
        { answer: "", evaluation: {} },
        "bad",
      ],
      userAnswer: "draft",
    });
    expect(round?.puzzleType).toBe("riddle");
    expect(round?.attempts).toHaveLength(1);
    expect(round?.attempts[0].answer).toBe("guess");
    expect(round?.userAnswer).toBe("draft");
  });
});
