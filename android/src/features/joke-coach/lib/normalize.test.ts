// src/features/joke-coach/lib/normalize.test.ts
import {
  normalizeClassification,
  normalizeCrowd,
  normalizeEvaluation,
  normalizeGeneratedJoke,
  normalizePracticeSession,
  normalizeScenario,
} from "./normalize";
import { pickOption, scoreOf, textList, wholeOf } from "./text";

describe("normalizeScenario", () => {
  it("keeps the title, situation, and audience", () => {
    expect(
      normalizeScenario({ title: "Late train", situation: "A commuter misses the last train.", audience: "commuters" }),
    ).toEqual({ title: "Late train", situation: "A commuter misses the last train.", audience: "commuters" });
  });

  it("falls back to a default title and audience", () => {
    expect(normalizeScenario({ situation: "A chef burns toast." })).toEqual({
      title: "Untitled scenario",
      situation: "A chef burns toast.",
      audience: "general audience",
    });
  });

  it("rejects a scenario with no situation", () => {
    expect(() => normalizeScenario({ title: "Empty" })).toThrow("did not return a scenario");
  });
});

describe("normalizeEvaluation", () => {
  it("clamps scores to 0-10 and falls back to 5 for missing values", () => {
    const result = normalizeEvaluation({ overallScore: 14, humorScore: "abc", deliveryScore: -2 });
    expect(result.overallScore).toBe(10);
    expect(result.humorScore).toBe(5);
    expect(result.deliveryScore).toBe(0);
    expect(result.originalityScore).toBe(5);
  });

  it("falls back to teen for an unknown appropriateness", () => {
    expect(normalizeEvaluation({ appropriateness: "PG" }).appropriateness).toBe("teen");
    expect(normalizeEvaluation({ appropriateness: " NSFW " }).appropriateness).toBe("nsfw");
  });

  it("treats missing lists as empty and reads booleans from strings", () => {
    const result = normalizeEvaluation({ isRecommended: "yes" });
    expect(result.strengths).toEqual([]);
    expect(result.weaknesses).toEqual([]);
    expect(result.isRecommended).toBe(true);
  });
});

describe("normalizeGeneratedJoke", () => {
  it("clamps the difficulty rating to 1-5 with a default of 3", () => {
    expect(normalizeGeneratedJoke({ difficultyRating: 9 }).difficultyRating).toBe(5);
    expect(normalizeGeneratedJoke({ difficultyRating: 0 }).difficultyRating).toBe(1);
    expect(normalizeGeneratedJoke({}).difficultyRating).toBe(3);
  });
});

describe("normalizeClassification", () => {
  it("uses the backend defaults for unknown enum values", () => {
    const result = normalizeClassification({ style: "haiku", humorMechanism: "magic", practiceCategory: "pro" });
    expect(result.style).toBe("observational");
    expect(result.humorMechanism).toBe("wordplay");
    expect(result.practiceCategory).toBe("beginner");
  });
});

describe("normalizePracticeSession", () => {
  it("returns null for a blank practice joke", () => {
    expect(normalizePracticeSession({ practiceJoke: "   " }).practiceJoke).toBeNull();
  });
});

describe("normalizeCrowd", () => {
  it("defaults the reaction to chuckles and the probability to 0.5", () => {
    const result = normalizeCrowd({ predictedResponse: "wild", laughProbability: 4 });
    expect(result.predictedResponse).toBe("chuckles");
    expect(result.laughProbability).toBe(1);
    expect(normalizeCrowd({}).laughProbability).toBe(0.5);
  });
});

describe("text readers", () => {
  it("textList wraps a single string and drops blanks", () => {
    expect(textList("one")).toEqual(["one"]);
    expect(textList(["a", " ", "b"])).toEqual(["a", "b"]);
    expect(textList(null)).toEqual([]);
  });

  it("wholeOf truncates and clamps", () => {
    expect(wholeOf("4.9", 3, 1, 5)).toBe(4);
    expect(wholeOf("x", 3, 1, 5)).toBe(3);
  });

  it("scoreOf and pickOption handle non-string input", () => {
    expect(scoreOf(undefined, 5, 10)).toBe(5);
    expect(pickOption(undefined, ["a"] as const, "a")).toBe("a");
  });
});
