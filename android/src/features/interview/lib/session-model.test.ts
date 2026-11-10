import { SAMPLE_SETUP_FORM } from "./test-fixtures";
import type { AnswerReview, InterviewSessionState, SessionHistoryEntry } from "../types";
import { validateSetup } from "./validate";
import {
  advanceAfterProgress,
  createSession,
  emptyProfile,
  lastEntry,
  questionTypeFor,
  remainingMinutes,
  undoProgress,
  upsertHistory,
  withAskedQuestion,
} from "./session-model";

const setup = validateSetup({ ...SAMPLE_SETUP_FORM, maxQuestions: 2, durationMinutes: "30" });
const startedAt = "2026-11-08T10:00:00.000Z";

const review: AnswerReview = {
  overallScore: 5,
  technicalAccuracy: 5,
  completeness: 5,
  clarityScore: 5,
  depthScore: 5,
  strengths: [],
  weaknesses: [],
  missedKeywords: [],
  redFlagsDetected: [],
  improvedAnswer: "",
  weakTopicsIdentified: [],
  recommendation: "move_on",
  followUpSuggestion: "",
};

function entry(question: string, overallScore = 5): SessionHistoryEntry {
  return {
    question,
    answer: "An answer",
    topic: "APIs",
    questionType: "technical",
    difficulty: "medium",
    review: { ...review, overallScore },
  };
}

describe("createSession", () => {
  it("starts in the decide stage with a full time budget", () => {
    const state = createSession(setup, startedAt);
    expect(state.stage).toBe("decide");
    expect(state.timeRemainingMinutes).toBe(30);
    expect(state.questionsAsked).toBe(0);
    expect(state.progressState).toEqual(emptyProfile());
  });
});

describe("remainingMinutes", () => {
  it("subtracts whole elapsed minutes and never goes below zero", () => {
    const start = new Date(startedAt).getTime();
    expect(remainingMinutes(setup, startedAt, start + 12 * 60_000 + 30_000)).toBe(18);
    expect(remainingMinutes(setup, startedAt, start + 99 * 60_000)).toBe(0);
  });
});

describe("questionTypeFor", () => {
  it("prefers the directive's type and falls back to the setup", () => {
    expect(questionTypeFor({ nextAction: "new_question", actionReasoning: "", directive: { questionType: "hr" } }, setup)).toBe(
      "hr",
    );
    expect(questionTypeFor(null, setup)).toBe("technical");
  });
});

describe("history helpers", () => {
  it("replaces the entry for the same question instead of duplicating it", () => {
    const history = [entry("Q1", 4), entry("Q2")];
    const updated = upsertHistory(history, entry("Q1", 8));
    expect(updated).toHaveLength(2);
    expect(updated[0].review.overallScore).toBe(8);
    expect(lastEntry(updated)?.question).toBe("Q2");
  });

  it("adds a new question once to the asked list", () => {
    expect(withAskedQuestion(["Q1"], "Q2")).toEqual(["Q1", "Q2"]);
    expect(withAskedQuestion(["Q1"], "Q1")).toEqual(["Q1"]);
    expect(lastEntry([])).toBeNull();
  });
});

describe("advanceAfterProgress", () => {
  function reviewed(): InterviewSessionState {
    return {
      ...createSession(setup, startedAt),
      stage: "progress",
      latestReview: review,
      currentAnswer: "An answer",
      progressSnapshot: emptyProfile(),
      decision: { nextAction: "follow_up", actionReasoning: "", directive: {} },
    };
  }

  it("counts the question and clears the per-question data", () => {
    const next = advanceAfterProgress(reviewed(), new Date(startedAt).getTime() + 5 * 60_000);
    expect(next.questionsAsked).toBe(1);
    expect(next.stage).toBe("progress");
    expect(next.latestReview).toBeNull();
    expect(next.decision).toBeNull();
    expect(next.timeRemainingMinutes).toBe(25);
  });

  it("goes to the report once the question limit is reached", () => {
    const first = advanceAfterProgress(reviewed(), new Date(startedAt).getTime());
    const last = advanceAfterProgress(first, new Date(startedAt).getTime());
    expect(last.questionsAsked).toBe(2);
    expect(last.stage).toBe("report");
  });
});

describe("undoProgress", () => {
  it("restores the snapshot and returns to the review stage", () => {
    const snapshot = { ...emptyProfile(), overallScore: 4 };
    const state: InterviewSessionState = {
      ...createSession(setup, startedAt),
      stage: "progress",
      progressState: { ...emptyProfile(), overallScore: 9 },
      progressSnapshot: snapshot,
    };
    const undone = undoProgress(state);
    expect(undone.progressState.overallScore).toBe(4);
    expect(undone.progressSnapshot).toBeNull();
    expect(undone.stage).toBe("review");
  });
});
