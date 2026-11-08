// src/features/puzzle/lib/validate.test.ts
import { requireCognitiveDomain, requireDifficulty, requirePuzzleType, requireText } from "./validate";

describe("requireText", () => {
  it("trims and rejects blank or over-long text", () => {
    expect(requireText("  Cyberpunk ", "Field of interest", 200)).toBe("Cyberpunk");
    expect(() => requireText(" ", "Field of interest", 200)).toThrow("Field of interest is required.");
    expect(() => requireText("x".repeat(201), "Field of interest", 200)).toThrow(
      "Field of interest must be 200 characters or fewer.",
    );
  });
});

describe("option checks", () => {
  it("accepts the backend enum values", () => {
    expect(requirePuzzleType("logic grid")).toBe("logic grid");
    expect(requireCognitiveDomain("lateral")).toBe("lateral");
    expect(requireDifficulty("genius")).toBe("genius");
  });

  it("rejects values outside the backend enums", () => {
    expect(() => requirePuzzleType("crossword")).toThrow("Puzzle type must be one of:");
    expect(() => requireCognitiveDomain("musical")).toThrow("Cognitive domain must be one of:");
    expect(() => requireDifficulty("easy")).toThrow("Difficulty must be one of:");
  });
});
