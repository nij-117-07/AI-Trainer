// src/features/rewriter/lib/normalize.test.ts
import { normalizeRewrite } from "./normalize";

describe("normalizeRewrite", () => {
  it("trims text and keeps non-empty improvement items", () => {
    expect(
      normalizeRewrite({
        rationale: " Shorter sentences. ",
        rewrittenText: "Great product.",
        improvementsMade: [" Removed passive voice ", "", 7, "Added rhythm"],
      }),
    ).toEqual({
      rationale: "Shorter sentences.",
      rewrittenText: "Great product.",
      improvementsMade: ["Removed passive voice", "Added rhythm"],
    });
  });

  it("returns empty values when the model omits fields", () => {
    expect(normalizeRewrite({ improvementsMade: "not a list" })).toEqual({
      rationale: "",
      rewrittenText: "",
      improvementsMade: [],
    });
  });
});
