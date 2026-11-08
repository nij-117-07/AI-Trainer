// src/features/ai-detector/lib/analysis.test.ts
import {
  confidenceTone,
  formatDetectionFeedback,
  formatScore,
  riskTone,
  scoreDeltaPoints,
  stepState,
  verdictTone,
} from "./analysis";
import type { AiDetection } from "../types";

const detection = (aiScore: number): AiDetection => ({
  aiScore,
  verdict: "Mixed",
  reason: "",
  flaggedPatterns: [],
  suggestedChanges: [],
});

describe("score formatting and colour bands", () => {
  it("formats the score as a rounded percentage", () => {
    expect(formatScore(0.666)).toBe("67% AI");
  });

  it("colours AI likelihood so high is bad", () => {
    expect(riskTone(0.9)).toBe("rose");
    expect(riskTone(0.5)).toBe("amber");
    expect(riskTone(0.1)).toBe("emerald");
  });

  it("colours confidence so high is good", () => {
    expect(confidenceTone(0.9)).toBe("emerald");
    expect(confidenceTone(0.5)).toBe("amber");
    expect(confidenceTone(0.1)).toBe("rose");
  });

  it("colours verdicts", () => {
    expect(verdictTone("Likely AI")).toBe("rose");
    expect(verdictTone("Likely Human")).toBe("emerald");
    expect(verdictTone("Mixed")).toBe("amber");
  });
});

describe("scoreDeltaPoints", () => {
  it("returns the recheck minus the original in whole points", () => {
    expect(scoreDeltaPoints(detection(0.8), detection(0.35))).toBe(-45);
    expect(scoreDeltaPoints(detection(0.2), detection(0.25))).toBe(5);
  });

  it("returns null until both results exist", () => {
    expect(scoreDeltaPoints(null, detection(0.5))).toBeNull();
    expect(scoreDeltaPoints(detection(0.5), null)).toBeNull();
  });
});

describe("formatDetectionFeedback", () => {
  it("lists flagged patterns then suggested changes, one per line", () => {
    expect(
      formatDetectionFeedback({
        ...detection(0.7),
        flaggedPatterns: ["Furthermore"],
        suggestedChanges: ["Use a contraction"],
      }),
    ).toBe("Flagged: Furthermore\nSuggested: Use a contraction");
  });

  it("returns an empty string when there is nothing to report", () => {
    expect(formatDetectionFeedback(detection(0.1))).toBe("");
  });
});

describe("stepState", () => {
  it("marks earlier steps done and the active step current", () => {
    expect(stepState("humanize", 0, true, false)).toBe("done");
    expect(stepState("humanize", 1, true, false)).toBe("current");
  });

  it("unlocks later steps only when their prerequisite result exists", () => {
    expect(stepState("detect", 1, false, false)).toBe("locked");
    expect(stepState("detect", 1, true, false)).toBe("done");
    expect(stepState("detect", 2, true, false)).toBe("locked");
    expect(stepState("detect", 2, true, true)).toBe("done");
  });
});
