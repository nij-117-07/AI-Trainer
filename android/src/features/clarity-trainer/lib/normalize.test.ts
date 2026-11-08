// src/features/clarity-trainer/lib/normalize.test.ts
import {
  normalizeAnalysis,
  normalizeBetterVersion,
  normalizeFeedback,
  normalizeGoldStandard,
  normalizeScenario,
} from "./normalize";
import { buildAnalysisSummary } from "./summary";

describe("normalizeScenario", () => {
  it("maps Ax field names and keeps lists as text", () => {
    const scenario = normalizeScenario({
      scenarioTitle: " Late project update ",
      situation: "The launch slipped.",
      characters: ["You (lead)", " Sam (PM) "],
      yourGoal: "Reset expectations.",
      constraints: "Under 60 seconds",
      promptToUser: "What do you say?",
      idealLengthSeconds: 45.7,
      difficultyAssigned: "Hard",
    });
    expect(scenario.title).toBe("Late project update");
    expect(scenario.characters).toEqual(["You (lead)", "Sam (PM)"]);
    expect(scenario.constraints).toEqual(["Under 60 seconds"]);
    expect(scenario.idealLengthSeconds).toBe(45);
    expect(scenario.difficulty).toBe("hard");
  });

  it("falls back for missing fields", () => {
    const scenario = normalizeScenario(null);
    expect(scenario.title).toBe("");
    expect(scenario.characters).toEqual([]);
    expect(scenario.idealLengthSeconds).toBe(0);
    expect(scenario.difficulty).toBe("medium");
  });
});

describe("normalizeAnalysis", () => {
  it("clamps scores and picks enum values", () => {
    const analysis = normalizeAnalysis({
      verbosityLevel: "wordy",
      wordCount: "12",
      clarityScore: "poor",
      goalAchievement: 1.7,
      toneAppropriateness: -0.2,
      fillerWords: ["basically"],
    });
    expect(analysis.verbosity).toBe("moderate");
    expect(analysis.wordCount).toBe(12);
    expect(analysis.clarity).toBe("poor");
    expect(analysis.goalAchievement).toBe(1);
    expect(analysis.toneFit).toBe(0);
    expect(analysis.fillerWords).toEqual(["basically"]);
  });
});

describe("normalizeFeedback", () => {
  it("clamps the score to 1-10 and defaults a missing score to 5", () => {
    expect(normalizeFeedback({ qualityScore: 42 }).score).toBe(10);
    expect(normalizeFeedback({ qualityScore: 0 }).score).toBe(1);
    expect(normalizeFeedback({}).score).toBe(5);
  });

  it("returns empty lists when the model omits them", () => {
    const feedback = normalizeFeedback({ coachMessage: "Good start." });
    expect(feedback.whatWorked).toEqual([]);
    expect(feedback.coachMessage).toBe("Good start.");
  });
});

describe("normalizeBetterVersion and normalizeGoldStandard", () => {
  it("reads rewrite counts and clamps the percentage", () => {
    const version = normalizeBetterVersion({ rewrittenResponse: "Ship Friday.", originalWords: 20, newWords: 12, percentCut: 140 });
    expect(version.percentReduced).toBe(100);
    expect(version.originalWords).toBe(20);
  });

  it("reads the gold standard fields", () => {
    const gold = normalizeGoldStandard({ idealOpening: "Quick update.", whyIdeal: ["Direct"], estimatedSeconds: 20 });
    expect(gold.opening).toBe("Quick update.");
    expect(gold.whyIdeal).toEqual(["Direct"]);
    expect(gold.seconds).toBe(20);
    expect(gold.wordCount).toBe(0);
  });
});

describe("buildAnalysisSummary", () => {
  it("formats percentages and reports no fillers when there are none", () => {
    const summary = buildAnalysisSummary({
      verbosity: "concise",
      wordCount: 9,
      fillerWords: [],
      redundantPhrases: [],
      clarity: "excellent",
      goalAchievement: 0.8,
      toneFit: 0.55,
      coreMessage: "Ship on Friday",
      scenarioFitNote: "Fits well.",
    });
    expect(summary).toBe(
      "Verbosity: concise, Clarity: excellent, Words: 9, Goal Achievement: 80%, Tone Fit: 55%, Fillers: none, Core message: 'Ship on Friday'. Context fit: Fits well.",
    );
  });
});
