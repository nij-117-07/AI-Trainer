// src/features/observation-trainer/lib/normalize.test.ts
import { evaluationFromModel, hiddenFromModel, normalizeSearchQuery, readTrainResult } from "./normalize";

describe("normalizeSearchQuery", () => {
  it("keeps the first line and strips quotes and extra spaces", () => {
    expect(normalizeSearchQuery({ searchQuery: ' "street  market   dusk" \nextra text' })).toBe("street market dusk");
  });

  it("caps long queries", () => {
    expect(normalizeSearchQuery({ searchQuery: "word ".repeat(60) }).length).toBeLessThanOrEqual(120);
  });

  it("rejects an empty query", () => {
    expect(() => normalizeSearchQuery({ searchQuery: "  " })).toThrow("did not return a search query");
  });
});

describe("evaluationFromModel", () => {
  it("maps model fields and clamps the score", () => {
    const evaluation = evaluationFromModel({
      accuracyAssessment: " Mostly right. ",
      scenarioRelevanceAssessment: "Some relevance",
      observationRating: "Advanced",
      scoreOutOf10: 14,
      strengths: ["Lighting", ""],
      areasForImprovement: "not a list",
      scenarioSpecificFeedback: "Look at the door",
      feedbackMessage: "Good work",
    });
    expect(evaluation.accuracyAssessment).toBe("Mostly right.");
    expect(evaluation.score).toBe(10);
    expect(evaluation.rating).toBe("Advanced");
    expect(evaluation.strengths).toEqual(["Lighting"]);
    expect(evaluation.areasForImprovement).toEqual([]);
  });

  it("derives the rating from the score when the model gives an unknown rating", () => {
    const evaluation = evaluationFromModel({ observationRating: "Guru", scoreOutOf10: 3 });
    expect(evaluation.rating).toBe("Beginner");
    expect(evaluation.score).toBe(3);
  });

  it("handles a missing payload without throwing", () => {
    const evaluation = evaluationFromModel(undefined);
    expect(evaluation.score).toBe(5);
    expect(evaluation.strengths).toEqual([]);
  });
});

describe("hiddenFromModel", () => {
  it("keeps valid missed details and defaults unknown priorities to medium", () => {
    const hidden = hiddenFromModel({
      missedDetails: [
        { detail: "Open window", category: "spatial", significance: "Entry point", scenarioPriority: "HIGH" },
        { detail: "Shadow", category: "lighting", significance: "Hint", scenarioPriority: "urgent" },
        { detail: "", significance: "" },
        "bad item",
      ],
      observationScoreIfTheseNoticed: 8,
    });
    expect(hidden.missedItems).toEqual([
      { detail: "Open window", category: "spatial", significance: "Entry point", scenarioPriority: "high" },
      { detail: "Shadow", category: "lighting", significance: "Hint", scenarioPriority: "medium" },
    ]);
    expect(hidden.potentialScore).toBe(8);
  });
});

describe("readTrainResult", () => {
  it("returns null when there is no evaluation to show", () => {
    expect(readTrainResult({ trainingScenario: "x" })).toBeNull();
    expect(readTrainResult(null)).toBeNull();
  });

  it("reads a saved report and drops a missing hidden section", () => {
    const saved = readTrainResult({
      trainingScenario: "Art critique",
      imageAnalysis: { groundTruthDescription: "A barn", keyElements: ["barn"], subtleDetails: [] },
      evaluation: { score: 6, rating: "Intermediate" },
      hiddenDetails: null,
    });
    expect(saved?.trainingScenario).toBe("Art critique");
    expect(saved?.imageAnalysis.keyElements).toEqual(["barn"]);
    expect(saved?.evaluation.score).toBe(6);
    expect(saved?.hiddenDetails).toBeNull();
  });
});
