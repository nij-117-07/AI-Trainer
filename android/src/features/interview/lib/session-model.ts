// src/features/interview/lib/session-model.ts
/**
 * Pure rules for the interview loop: starting a session, the time left, history upserts, moving to
 * the next question, and undoing a progress update. Nothing here touches storage or the network.
 */
import type {
  InterviewSessionState,
  InterviewSetup,
  ProgressProfile,
  SessionDecision,
  SessionHistoryEntry,
} from "../types";

export const NO_HISTORY_TEXT = "No questions asked yet.";
export const NO_LIST_TEXT = "None yet.";

export function emptyProfile(): ProgressProfile {
  return {
    weakAreas: [],
    strongAreas: [],
    topicsCovered: [],
    topicScores: {},
    typeScores: {},
    recommendedNextTopics: [],
  };
}

export function createSession(setup: InterviewSetup, startedAt: string): InterviewSessionState {
  return {
    setup,
    stage: "decide",
    sessionHistory: [],
    allQuestionsAsked: [],
    progressState: emptyProfile(),
    latestReview: null,
    currentAnswer: "",
    currentQuestion: null,
    decision: null,
    performanceTrend: "stable",
    questionsAsked: 0,
    timeRemainingMinutes: setup.durationMinutes,
    progressSnapshot: null,
    startedAt,
  };
}

export function remainingMinutes(setup: InterviewSetup, startedAt: string, nowMs: number): number {
  const elapsedMs = nowMs - new Date(startedAt).getTime();
  const elapsedMinutes = Number.isFinite(elapsedMs) ? Math.floor(elapsedMs / 60_000) : 0;
  return Math.max(0, setup.durationMinutes - elapsedMinutes);
}

export function questionTypeFor(decision: SessionDecision | null, setup: InterviewSetup): string {
  return decision?.directive.questionType ?? setup.interviewType;
}

export function lastEntry(history: SessionHistoryEntry[]): SessionHistoryEntry | null {
  return history.length > 0 ? history[history.length - 1] : null;
}

/** Replaces the entry for the same question when one exists, so a re-review never duplicates it. */
export function upsertHistory(history: SessionHistoryEntry[], entry: SessionHistoryEntry): SessionHistoryEntry[] {
  const index = history.findIndex((item) => item.question === entry.question);
  if (index >= 0) return history.map((item, position) => (position === index ? entry : item));
  return [...history, entry];
}

export function withAskedQuestion(asked: string[], question: string): string[] {
  return asked.includes(question) ? asked : [...asked, question];
}

/** Moves past the progress stage. Reaching the question limit goes to the report instead of a new decision. */
export function advanceAfterProgress(state: InterviewSessionState, nowMs: number): InterviewSessionState {
  const next: InterviewSessionState = {
    ...state,
    questionsAsked: state.questionsAsked + 1,
    timeRemainingMinutes: remainingMinutes(state.setup, state.startedAt, nowMs),
    currentQuestion: null,
    currentAnswer: "",
    latestReview: null,
    decision: null,
    progressSnapshot: null,
  };
  return next.questionsAsked >= state.setup.maxQuestions ? { ...next, stage: "report" } : next;
}

export function undoProgress(state: InterviewSessionState): InterviewSessionState {
  return {
    ...state,
    progressState: state.progressSnapshot ?? emptyProfile(),
    progressSnapshot: null,
    stage: "review",
  };
}
