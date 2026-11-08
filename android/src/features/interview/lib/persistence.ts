// src/features/interview/lib/persistence.ts
/**
 * Device storage keys, the saved-setup merge, and the restore step that reads a stored session back
 * into typed state. Anything unreadable starts a fresh session instead of breaking the screen.
 */
import { DEFAULT_SETUP_FORM } from "../options";
import { DIFFICULTIES, QUESTION_TYPES, STAGES, TRENDS } from "../types";
import type { InterviewSessionState, InterviewSetup, InterviewSetupForm, InterviewStage, SessionHistoryEntry } from "../types";
import { normalizeDecision, normalizeProfile, normalizeQuestion, normalizeReview } from "./normalize";
import { isRecord, listOf, numberOf, pickOption, textList, textOf } from "./text";

export const INTERVIEW_KEYS = {
  setup: "practice.interview.setup.v1",
  session: "practice.interview.session.v1",
} as const;

/** Takes each saved setup field only when its type matches the default. */
export function mergeSavedSetup(saved: unknown): InterviewSetupForm {
  const defaults = DEFAULT_SETUP_FORM;
  if (!isRecord(saved)) return defaults;
  const merged: Record<string, unknown> = { ...defaults };
  for (const key of Object.keys(defaults) as (keyof InterviewSetupForm)[]) {
    if (typeof saved[key] === typeof defaults[key]) merged[key] = saved[key];
  }
  return merged as unknown as InterviewSetupForm;
}

function restoreSetup(value: unknown): InterviewSetup | null {
  if (!isRecord(value)) return null;
  const durationMinutes = numberOf(value.durationMinutes);
  const maxQuestions = numberOf(value.maxQuestions);
  if (durationMinutes === undefined || maxQuestions === undefined) return null;
  return {
    candidateName: textOf(value.candidateName),
    candidateExperience: textOf(value.candidateExperience),
    candidateSkills: textOf(value.candidateSkills),
    positionRole: textOf(value.positionRole),
    positionCompany: textOf(value.positionCompany),
    positionSkills: textOf(value.positionSkills),
    positionLevel: textOf(value.positionLevel),
    interviewerRole: textOf(value.interviewerRole),
    interviewType: pickOption(value.interviewType, QUESTION_TYPES, "technical"),
    interviewRound: textOf(value.interviewRound),
    interviewFormat: textOf(value.interviewFormat),
    maxQuestions,
    durationMinutes,
  };
}

function restoreHistory(value: unknown): SessionHistoryEntry[] {
  return listOf(value)
    .filter(isRecord)
    .filter((entry) => typeof entry.question === "string" && isRecord(entry.review))
    .map((entry) => ({
      question: textOf(entry.question),
      answer: textOf(entry.answer),
      topic: textOf(entry.topic),
      questionType: textOf(entry.questionType),
      difficulty: pickOption(entry.difficulty, DIFFICULTIES, "medium"),
      review: normalizeReview(entry.review as Record<string, unknown>),
    }));
}

/** Reads a stored session back, or returns null when the stored data is not a usable session. */
export function restoreSession(value: unknown): InterviewSessionState | null {
  try {
    if (!isRecord(value)) return null;
    const stage = pickOption<InterviewStage | "">(value.stage, STAGES, "");
    const setup = restoreSetup(value.setup);
    if (!stage || !setup) return null;
    return {
      setup,
      stage,
      sessionHistory: restoreHistory(value.sessionHistory),
      allQuestionsAsked: textList(value.allQuestionsAsked),
      progressState: normalizeProfile(value.progressState),
      latestReview: isRecord(value.latestReview) ? normalizeReview(value.latestReview) : null,
      currentAnswer: textOf(value.currentAnswer),
      currentQuestion: isRecord(value.currentQuestion)
        ? normalizeQuestion(value.currentQuestion, textOf(value.currentQuestion.questionType))
        : null,
      decision: isRecord(value.decision) ? normalizeDecision(value.decision) : null,
      performanceTrend: pickOption(value.performanceTrend, TRENDS, "stable"),
      questionsAsked: numberOf(value.questionsAsked) ?? 0,
      timeRemainingMinutes: numberOf(value.timeRemainingMinutes) ?? setup.durationMinutes,
      progressSnapshot: isRecord(value.progressSnapshot) ? normalizeProfile(value.progressSnapshot) : null,
      startedAt: textOf(value.startedAt) || new Date(0).toISOString(),
    };
  } catch {
    return null;
  }
}
