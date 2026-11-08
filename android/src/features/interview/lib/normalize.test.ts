import { normalizeDecision, normalizeProfile, normalizeQuestion, normalizeReview, normalizeTrack } from "./normalize";
import { numberRecord, scoreOf } from "./text";

describe("scoreOf", () => {
  it("clamps scores to the 0 to 10 range", () => {
    expect(scoreOf(7.5)).toBe(7.5);
    expect(scoreOf(12)).toBe(10);
    expect(scoreOf(-3)).toBe(0);
  });

  it("reads numeric strings and treats missing or bad values as 0", () => {
    expect(scoreOf("6")).toBe(6);
    expect(scoreOf(undefined)).toBe(0);
    expect(scoreOf("great")).toBe(0);
    expect(scoreOf(Number.NaN)).toBe(0);
  });
});

describe("normalizeReview", () => {
  it("clamps every score and falls back to move_on for an unknown recommendation", () => {
    const review = normalizeReview({
      overallScore: 14,
      technicalAccuracy: 6,
      completeness: undefined,
      clarityScore: "8",
      depthScore: -1,
      strengths: ["Clear trade-offs", " "],
      weaknesses: "Thin on metrics\nNo tests",
      recommendation: "promote",
    });
    expect(review.overallScore).toBe(10);
    expect(review.technicalAccuracy).toBe(6);
    expect(review.completeness).toBe(0);
    expect(review.clarityScore).toBe(8);
    expect(review.depthScore).toBe(0);
    expect(review.strengths).toEqual(["Clear trade-offs"]);
    expect(review.weaknesses).toEqual(["Thin on metrics", "No tests"]);
    expect(review.recommendation).toBe("move_on");
  });

  it("handles a completely empty model response", () => {
    const review = normalizeReview({});
    expect(review.strengths).toEqual([]);
    expect(review.missedKeywords).toEqual([]);
    expect(review.improvedAnswer).toBe("");
  });
});

describe("normalizeDecision", () => {
  it("keeps a valid directive and drops empty values", () => {
    const decision = normalizeDecision({
      nextAction: "follow_up",
      actionReasoning: "Weak answer.",
      directive: { action: "follow_up", topic: " Caching ", focusArea: "", shouldReferenceLastAnswer: true },
    });
    expect(decision.nextAction).toBe("follow_up");
    expect(decision.directive).toEqual({
      action: "follow_up",
      topic: "Caching",
      focusArea: undefined,
      shouldReferenceLastAnswer: true,
      questionType: undefined,
      difficulty: undefined,
      toneGuidance: undefined,
      constraints: undefined,
    });
  });

  it("defaults to a new question and an empty directive", () => {
    expect(normalizeDecision({ nextAction: "pause", directive: "text" })).toEqual({
      nextAction: "new_question",
      actionReasoning: "",
      directive: {},
    });
  });
});

describe("normalizeQuestion", () => {
  it("uses medium difficulty when the value is unknown", () => {
    const question = normalizeQuestion({ question: "Explain idempotency.", difficulty: "brutal" }, "technical");
    expect(question.difficulty).toBe("medium");
    expect(question.questionType).toBe("technical");
    expect(question.expectedKeywords).toEqual([]);
  });

  it("refuses to build a question when the model returned none", () => {
    expect(() => normalizeQuestion({ question: "  " }, "technical")).toThrow("did not write a question");
  });
});

describe("normalizeProfile and normalizeTrack", () => {
  it("parses JSON score maps and keeps only numeric values", () => {
    const profile = normalizeProfile({
      overallScore: 6.5,
      topicScores: '{"APIs": 7, "SQL": "n/a", "Caching": 4}',
      typeScores: { technical: 6 },
      weakAreas: ["SQL"],
      confidenceLevel: "medium",
    });
    expect(profile.overallScore).toBe(6.5);
    expect(profile.topicScores).toEqual({ APIs: 7, Caching: 4 });
    expect(profile.typeScores).toEqual({ technical: 6 });
    expect(profile.weakAreas).toEqual(["SQL"]);
    expect(profile.strongAreas).toEqual([]);
    expect(profile.confidenceLevel).toBe("medium");
  });

  it("returns an empty profile and a stable trend when output is missing", () => {
    const result = normalizeTrack({ updatedProfile: undefined, performanceTrend: "wobbly" });
    expect(result.performanceTrend).toBe("stable");
    expect(result.profile.weakAreas).toEqual([]);
    expect(result.profile.confidenceLevel).toBeUndefined();
  });
});

describe("numberRecord", () => {
  it("returns an empty record for invalid JSON", () => {
    expect(numberRecord("{not json")).toEqual({});
  });
});
