// src/features/ingredients/lib/normalize.test.ts
import { normalizeIngredientAnalysis } from "./normalize";

describe("normalizeIngredientAnalysis", () => {
  it("keeps a complete model response", () => {
    expect(
      normalizeIngredientAnalysis({
        extractedIngredients: [" water ", "sugar"],
        healthLevel: 2,
        riskFactors: ["High sugar"],
        summaryAnalysis: " Contains added sugar. ",
      }),
    ).toEqual({
      extractedIngredients: ["water", "sugar"],
      healthLevel: 2,
      riskFactors: ["High sugar"],
      summaryAnalysis: "Contains added sugar.",
    });
  });

  it("reads a numeric string level and splits newline lists", () => {
    const result = normalizeIngredientAnalysis({
      extractedIngredients: "oats\nhoney",
      healthLevel: "4",
      riskFactors: undefined,
      summaryAnalysis: null,
    });
    expect(result.healthLevel).toBe(4);
    expect(result.extractedIngredients).toEqual(["oats", "honey"]);
    expect(result.riskFactors).toEqual([]);
    expect(result.summaryAnalysis).toBe("");
  });

  it("rejects a missing or out-of-range health level", () => {
    expect(() => normalizeIngredientAnalysis({ healthLevel: undefined })).toThrow(
      "The model did not return a valid health level.",
    );
    expect(() => normalizeIngredientAnalysis({ healthLevel: 6 })).toThrow();
    expect(() => normalizeIngredientAnalysis({ healthLevel: 0 })).toThrow();
  });
});
