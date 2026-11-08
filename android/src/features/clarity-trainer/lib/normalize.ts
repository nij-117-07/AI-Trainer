// src/features/clarity-trainer/lib/normalize.ts
/**
 * Turns raw Ax output into the typed values the screens render. Mirrors the backend's coercion:
 * scores are clamped, enums fall back to a default, and missing text becomes an empty string.
 */
import {
  CLARITY_VALUES,
  DIFFICULTY_VALUES,
  VERBOSITY_VALUES,
  type BetterVersion,
  type CoachFeedback,
  type CommunicationScenario,
  type GoldStandard,
  type ResponseAnalysis,
} from "../types";
import { clamp, intOf, numberOf, pickOption, recordOf, textList, textOf } from "./text";

export function normalizeScenario(raw: unknown): CommunicationScenario {
  const record = recordOf(raw);
  return {
    title: textOf(record.scenarioTitle),
    situation: textOf(record.situation),
    characters: textList(record.characters),
    goal: textOf(record.yourGoal),
    constraints: textList(record.constraints),
    promptToUser: textOf(record.promptToUser),
    idealLengthSeconds: Math.max(0, intOf(record.idealLengthSeconds, 0)),
    difficulty: pickOption(record.difficultyAssigned, DIFFICULTY_VALUES, "medium"),
  };
}

export function normalizeAnalysis(raw: unknown): ResponseAnalysis {
  const record = recordOf(raw);
  return {
    verbosity: pickOption(record.verbosityLevel, VERBOSITY_VALUES, "moderate"),
    wordCount: Math.max(0, intOf(record.wordCount, 0)),
    fillerWords: textList(record.fillerWords),
    redundantPhrases: textList(record.redundantPhrases),
    clarity: pickOption(record.clarityScore, CLARITY_VALUES, "good"),
    goalAchievement: clamp(numberOf(record.goalAchievement, 0), 0, 1),
    toneFit: clamp(numberOf(record.toneAppropriateness, 0), 0, 1),
    coreMessage: textOf(record.coreMessage),
    scenarioFitNote: textOf(record.scenarioFitNote),
  };
}

export function normalizeFeedback(raw: unknown): CoachFeedback {
  const record = recordOf(raw);
  return {
    score: clamp(intOf(record.qualityScore, 5), 1, 10),
    whatWorked: textList(record.whatWorked),
    whatToCut: textList(record.whatToCut),
    whatToAdd: textList(record.whatToAdd),
    rewriteSuggestion: textOf(record.rewriteSuggestion),
    onePrinciple: textOf(record.onePrinciple),
    coachMessage: textOf(record.coachMessage),
  };
}

export function normalizeBetterVersion(raw: unknown): BetterVersion {
  const record = recordOf(raw);
  return {
    rewritten: textOf(record.rewrittenResponse),
    originalWords: Math.max(0, intOf(record.originalWords, 0)),
    newWords: Math.max(0, intOf(record.newWords, 0)),
    percentReduced: clamp(numberOf(record.percentCut, 0), 0, 100),
    whyBetter: textList(record.whyBetter),
  };
}

export function normalizeGoldStandard(raw: unknown): GoldStandard {
  const record = recordOf(raw);
  return {
    opening: textOf(record.idealOpening),
    fullResponse: textOf(record.idealFullResponse),
    whyIdeal: textList(record.whyIdeal),
    wordCount: Math.max(0, intOf(record.wordCount, 0)),
    seconds: Math.max(0, intOf(record.estimatedSeconds, 0)),
  };
}
