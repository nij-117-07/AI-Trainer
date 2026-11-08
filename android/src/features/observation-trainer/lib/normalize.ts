// src/features/observation-trainer/lib/normalize.ts
/**
 * Turns raw model output (and saved drafts) into the typed results the screens render. Every
 * list is checked, every number is clamped, and missing values fall back to safe defaults.
 */
import {
  OBSERVATION_RATINGS,
  type EvaluationSummary,
  type HiddenDetailsSummary,
  type ImageAnalysis,
  type MissedDetail,
  type ObservationRating,
  type ObservationTrainResult,
  type ScenarioPriority,
} from "../types";
import { isRecord, listOf, numberOf, textList, textOf } from "./text";

const FALLBACK_SCORE = 5;

function clampScore(value: unknown): number {
  const parsed = numberOf(value);
  if (parsed === null) return FALLBACK_SCORE;
  return Math.min(10, Math.max(1, Math.round(parsed)));
}

function ratingFromScore(score: number): ObservationRating {
  if (score >= 9) return "Expert";
  if (score >= 7) return "Advanced";
  if (score >= 4) return "Intermediate";
  return "Beginner";
}

function priorityOf(value: unknown): ScenarioPriority {
  const text = textOf(value).toLowerCase();
  return text === "high" || text === "low" ? text : "medium";
}

export function readAnalysis(raw: unknown): ImageAnalysis {
  const r = isRecord(raw) ? raw : {};
  return {
    groundTruthDescription: textOf(r.groundTruthDescription),
    keyElements: textList(r.keyElements),
    subtleDetails: textList(r.subtleDetails),
  };
}

export function analysisFromModel(raw: unknown): ImageAnalysis {
  const r = isRecord(raw) ? raw : {};
  return readAnalysis({
    groundTruthDescription: r.detailedDescription,
    keyElements: r.keyElements,
    subtleDetails: r.subtleDetails,
  });
}

export function readEvaluation(raw: unknown): EvaluationSummary {
  const r = isRecord(raw) ? raw : {};
  const score = clampScore(r.score);
  const rating = textOf(r.rating);
  return {
    accuracyAssessment: textOf(r.accuracyAssessment),
    scenarioRelevance: textOf(r.scenarioRelevance),
    rating: (OBSERVATION_RATINGS as readonly string[]).includes(rating)
      ? (rating as ObservationRating)
      : ratingFromScore(score),
    score,
    strengths: textList(r.strengths),
    areasForImprovement: textList(r.areasForImprovement),
    scenarioFeedback: textOf(r.scenarioFeedback),
    feedback: textOf(r.feedback),
  };
}

export function evaluationFromModel(raw: unknown): EvaluationSummary {
  const r = isRecord(raw) ? raw : {};
  return readEvaluation({
    accuracyAssessment: r.accuracyAssessment,
    scenarioRelevance: r.scenarioRelevanceAssessment,
    rating: r.observationRating,
    score: r.scoreOutOf10,
    strengths: r.strengths,
    areasForImprovement: r.areasForImprovement,
    scenarioFeedback: r.scenarioSpecificFeedback,
    feedback: r.feedbackMessage,
  });
}

export function readMissedItems(raw: unknown): MissedDetail[] {
  return listOf(raw)
    .filter(isRecord)
    .map((item) => ({
      detail: textOf(item.detail),
      category: textOf(item.category),
      significance: textOf(item.significance),
      scenarioPriority: priorityOf(item.scenarioPriority),
    }))
    .filter((item) => item.detail || item.significance);
}

export function readHidden(raw: unknown): HiddenDetailsSummary {
  const r = isRecord(raw) ? raw : {};
  return {
    missedItems: readMissedItems(r.missedItems),
    potentialScore: clampScore(r.potentialScore),
    skillGap: textOf(r.skillGap),
    trainingTip: textOf(r.trainingTip),
    practiceExercise: textOf(r.practiceExercise),
    encouragement: textOf(r.encouragement),
  };
}

export function hiddenFromModel(raw: unknown): HiddenDetailsSummary {
  const r = isRecord(raw) ? raw : {};
  return readHidden({
    missedItems: r.missedDetails,
    potentialScore: r.observationScoreIfTheseNoticed,
    skillGap: r.scenarioSkillGap,
    trainingTip: r.trainingTip,
    practiceExercise: r.practiceExercise,
    encouragement: r.encouragement,
  });
}

/** Reads a saved training result. Returns null when the draft has no evaluation to show. */
export function readTrainResult(raw: unknown): ObservationTrainResult | null {
  if (!isRecord(raw) || !isRecord(raw.evaluation)) return null;
  return {
    trainingScenario: textOf(raw.trainingScenario),
    imageAnalysis: readAnalysis(raw.imageAnalysis),
    evaluation: readEvaluation(raw.evaluation),
    hiddenDetails: isRecord(raw.hiddenDetails) ? readHidden(raw.hiddenDetails) : null,
  };
}
