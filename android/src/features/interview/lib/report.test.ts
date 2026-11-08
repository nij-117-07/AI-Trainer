import { DEFAULT_SETUP_FORM } from "../options";
import type { AnswerReview, InterviewSessionState, SessionHistoryEntry } from "../types";
import { buildInterviewReport } from "./report";
import { emptyProfile, createSession } from "./session-model";
import { validateSetup } from "./validate";

const review: AnswerReview = {
  overallScore: 0,
  technicalAccuracy: 0,
  completeness: 0,
  clarityScore: 0,
  depthScore: 0,
  strengths: [],
  weaknesses: ["Missing retries"],
  missedKeywords: [],
  redFlagsDetected: [],
  improvedAnswer: "",
  weakTopicsIdentified: [],
  recommendation: "move_on",
  followUpSuggestion: "",
};

function entry(question: string, overallScore: number): SessionHistoryEntry {
  return {
    question,
    answer: "An answer",
    topic: "APIs",
    questionType: "technical",
    difficulty: "medium",
    review: { ...review, overallScore },
  };
}

const setup = validateSetup({ ...DEFAULT_SETUP_FORM, maxQuestions: 5 });

describe("buildInterviewReport", () => {
  it("falls back to the average of the reviews when the profile has no overall score", () => {
    const state: InterviewSessionState = {
      ...createSession(setup, "2026-11-08T10:00:00.000Z"),
      sessionHistory: [entry("Q1", 6), entry("Q2", 7.5)],
    };
    const report = buildInterviewReport(state, "2026-11-08T10:45:00.000Z");
    expect(report.averageScore).toBe(6.8);
    expect(report.overallScore).toBe(6.8);
    expect(report.questionsAnswered).toBe(2);
    expect(report.maxQuestions).toBe(5);
    expect(report.confidenceLevel).toBe("not enough data");
  });

  it("uses the profile's own figures when they exist", () => {
    const state: InterviewSessionState = {
      ...createSession(setup, "2026-11-08T10:00:00.000Z"),
      sessionHistory: [entry("Q1", 6)],
      progressState: { ...emptyProfile(), overallScore: 8, questionsAnswered: 3, confidenceLevel: "high" },
      performanceTrend: "improving",
    };
    const report = buildInterviewReport(state, "2026-11-08T10:45:00.000Z");
    expect(report.overallScore).toBe(8);
    expect(report.questionsAnswered).toBe(3);
    expect(report.confidenceLevel).toBe("high");
    expect(report.performanceTrend).toBe("improving");
  });
});
