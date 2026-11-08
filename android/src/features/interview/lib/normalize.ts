// src/features/interview/lib/normalize.ts
/**
 * Turns raw model output into typed results. Lists are checked, scores are clamped to 0 to 10, and
 * enum values fall back to the backend's defaults, so bad output never crashes the screen.
 */
import { DIFFICULTIES, NEXT_ACTIONS, RECOMMENDATIONS, TRENDS } from "../types";
import type {
  AnswerReview,
  Directive,
  InterviewQuestion,
  ProgressProfile,
  ProgressResult,
  Recommendation,
  SessionDecision,
} from "../types";
import { isRecord, numberOf, numberRecord, pickOption, scoreOf, textList, textOf } from "./text";

function directiveFrom(raw: unknown): Directive {
  if (!isRecord(raw)) return {};
  return {
    action: textOf(raw.action) || undefined,
    questionType: textOf(raw.questionType) || undefined,
    topic: textOf(raw.topic) || undefined,
    difficulty: textOf(raw.difficulty) || undefined,
    focusArea: textOf(raw.focusArea) || undefined,
    shouldReferenceLastAnswer:
      typeof raw.shouldReferenceLastAnswer === "boolean" ? raw.shouldReferenceLastAnswer : undefined,
    toneGuidance: textOf(raw.toneGuidance) || undefined,
    constraints: textOf(raw.constraints) || undefined,
  };
}

export function normalizeDecision(raw: {
  nextAction?: unknown;
  actionReasoning?: unknown;
  directive?: unknown;
}): SessionDecision {
  return {
    nextAction: pickOption(raw.nextAction, NEXT_ACTIONS, "new_question"),
    actionReasoning: textOf(raw.actionReasoning),
    directive: directiveFrom(raw.directive),
  };
}

export function normalizeQuestion(
  raw: {
    question?: unknown;
    topic?: unknown;
    difficulty?: unknown;
    expectedKeywords?: unknown;
    evaluationCriteria?: unknown;
    redFlags?: unknown;
    sampleStrongAnswer?: unknown;
    sampleWeakAnswer?: unknown;
  },
  questionType: string,
): InterviewQuestion {
  const question = textOf(raw.question);
  if (!question) throw new Error("The model did not write a question. Try regenerating it.");
  return {
    question,
    topic: textOf(raw.topic),
    questionType,
    difficulty: pickOption(raw.difficulty, DIFFICULTIES, "medium"),
    expectedKeywords: textList(raw.expectedKeywords),
    evaluationCriteria: textOf(raw.evaluationCriteria),
    redFlags: textList(raw.redFlags),
    sampleStrongAnswer: textOf(raw.sampleStrongAnswer),
    sampleWeakAnswer: textOf(raw.sampleWeakAnswer),
  };
}

export function normalizeReview(raw: {
  overallScore?: unknown;
  technicalAccuracy?: unknown;
  completeness?: unknown;
  clarityScore?: unknown;
  depthScore?: unknown;
  strengths?: unknown;
  weaknesses?: unknown;
  missedKeywords?: unknown;
  redFlagsDetected?: unknown;
  improvedAnswer?: unknown;
  weakTopicsIdentified?: unknown;
  recommendation?: unknown;
  followUpSuggestion?: unknown;
}): AnswerReview {
  return {
    overallScore: scoreOf(raw.overallScore),
    technicalAccuracy: scoreOf(raw.technicalAccuracy),
    completeness: scoreOf(raw.completeness),
    clarityScore: scoreOf(raw.clarityScore),
    depthScore: scoreOf(raw.depthScore),
    strengths: textList(raw.strengths),
    weaknesses: textList(raw.weaknesses),
    missedKeywords: textList(raw.missedKeywords),
    redFlagsDetected: textList(raw.redFlagsDetected),
    improvedAnswer: textOf(raw.improvedAnswer),
    weakTopicsIdentified: textList(raw.weakTopicsIdentified),
    recommendation: pickOption<Recommendation>(raw.recommendation, RECOMMENDATIONS, "move_on"),
    followUpSuggestion: textOf(raw.followUpSuggestion),
  };
}

export function normalizeProfile(raw: unknown): ProgressProfile {
  const source = isRecord(raw) ? raw : {};
  const confidence = textOf(source.confidenceLevel);
  return {
    overallScore: numberOf(source.overallScore),
    questionsAnswered: numberOf(source.questionsAnswered),
    weakAreas: textList(source.weakAreas),
    strongAreas: textList(source.strongAreas),
    topicsCovered: textList(source.topicsCovered),
    topicScores: numberRecord(source.topicScores),
    typeScores: numberRecord(source.typeScores),
    recommendedNextTopics: textList(source.recommendedNextTopics),
    confidenceLevel: confidence || undefined,
  };
}

export function normalizeTrack(raw: { updatedProfile?: unknown; performanceTrend?: unknown }): ProgressResult {
  return {
    profile: normalizeProfile(raw.updatedProfile),
    performanceTrend: pickOption(raw.performanceTrend, TRENDS, "stable"),
  };
}
