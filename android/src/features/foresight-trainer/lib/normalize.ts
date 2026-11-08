// src/features/foresight-trainer/lib/normalize.ts
/**
 * Turns raw model output into the typed results the screens render. Mirrors the coercion rules in
 * Backend/practice/foresight_trainer/services.py: scores are clamped to 0-10, enum fields fall back
 * to the backend defaults, and every list and string goes through the guarded readers.
 */
import type {
  ChoiceOption,
  Consequences,
  DecisionEvaluation,
  DecisionRecord,
  InsightReport,
  ProgressReport,
  ScenarioBlueprint,
  Scene,
} from "../types";
import { isRecord, listOf, pick, scoreOf, textList, textOf } from "./text";

export const RISK_LEVELS = ["low", "medium", "high"] as const;
export const TIME_COSTS = ["fast", "moderate", "slow"] as const;
export const SKILL_ASSESSMENTS = ["developing", "competent", "proficient", "expert"] as const;

/** Dimension name shown to the user, paired with the Ax output key the model fills in. */
const SCORE_KEYS: readonly [string, string][] = [
  ["foresight", "foresight"],
  ["empathy", "empathy"],
  ["creativity", "creativity"],
  ["risk_awareness", "riskAwareness"],
  ["reasoning_quality", "reasoningQuality"],
];

export function normalizeBlueprint(raw: unknown): ScenarioBlueprint {
  const data = isRecord(raw) ? raw : {};
  return {
    setting: textOf(data.setting),
    protagonist: textOf(data.protagonist),
    coreConflict: textOf(data.coreConflict),
    stakes: textOf(data.stakes),
    thinkingSkill: textOf(data.thinkingSkill),
    tone: textOf(data.tone),
    hiddenVariables: textList(data.hiddenVariables),
  };
}

export function normalizeScene(raw: unknown, includeAdjustment = false): Scene {
  const data = isRecord(raw) ? raw : {};
  const adjustment = includeAdjustment ? textOf(data.difficultyAdjustment) : "";
  return {
    sceneNarrative: textOf(data.sceneNarrative),
    decisionPoint: textOf(data.decisionPoint),
    timePressure: textOf(data.timePressure),
    difficultyAdjustment: adjustment || null,
  };
}

export function normalizeOptions(raw: unknown): ChoiceOption[] {
  return listOf(raw)
    .filter(isRecord)
    .map((item) => ({
      id: textOf(item.id),
      title: textOf(item.title),
      description: textOf(item.description),
      approachType: textOf(item.approachType),
      riskLevel: pick(item.riskLevel, RISK_LEVELS, "medium"),
      timeCost: pick(item.timeCost, TIME_COSTS, "moderate"),
      hiddenTradeoff: textOf(item.hiddenTradeoff),
    }))
    .filter((option) => option.title || option.description);
}

export function normalizeEvaluation(raw: unknown): DecisionEvaluation {
  const data = isRecord(raw) ? raw : {};
  const rawScores = isRecord(data.scores) ? data.scores : {};
  const scores: Record<string, number> = {};
  for (const [name, key] of SCORE_KEYS) {
    scores[name] = scoreOf(rawScores[key], 5, 0, 10);
  }
  return {
    scores,
    overallScore: scoreOf(data.overallScore, 5, 0, 10),
    strengths: textList(data.strengths),
    blindSpots: textList(data.blindSpots),
    thinkingPattern: textOf(data.thinkingPattern),
    oneLesson: textOf(data.oneLesson),
  };
}

export function normalizeConsequences(raw: unknown): Consequences {
  const data = isRecord(raw) ? raw : {};
  return {
    immediateEffects: textList(data.immediateEffects),
    delayedEffects: textList(data.delayedEffects),
    hiddenReveal: textOf(data.hiddenReveal),
    newComplication: textOf(data.newComplication),
    relationshipImpact: textOf(data.relationshipImpact),
    resourceChanges: textOf(data.resourceChanges),
    worldStateUpdate: textOf(data.worldStateUpdate),
  };
}

export function normalizeInsight(raw: unknown): InsightReport {
  const data = isRecord(raw) ? raw : {};
  return {
    patternObservation: textOf(data.patternObservation),
    cognitiveBiasAlert: textOf(data.cognitiveBiasAlert),
    strengthSpotlight: textOf(data.strengthSpotlight),
    growthEdge: textOf(data.growthEdge),
    realWorldParallel: textOf(data.realWorldParallel),
    coachingQuestion: textOf(data.coachingQuestion),
  };
}

/** The score trajectory arrives as JSON text; anything that is not an object becomes an empty object. */
export function normalizeProgress(raw: unknown): ProgressReport {
  const data = isRecord(raw) ? raw : {};
  return {
    overallGrowth: textOf(data.overallGrowth),
    scoreTrajectory: parseTrajectory(data.scoreTrajectory),
    dominantPattern: textOf(data.dominantPattern),
    underusedStrengths: textList(data.underusedStrengths),
    criticalBlindSpot: textOf(data.criticalBlindSpot),
    bestMoment: textOf(data.bestMoment),
    skillAssessment: pick(data.skillAssessment, SKILL_ASSESSMENTS, "developing"),
    recommendedFocus: textOf(data.recommendedFocus),
    archetype: textOf(data.archetype),
  };
}

export function buildDecisionRecord(
  sceneNumber: number,
  choice: string,
  evaluation: DecisionEvaluation,
): DecisionRecord {
  return {
    sceneNumber,
    choiceMade: choice,
    approachType: evaluation.thinkingPattern,
    scores: evaluation.scores,
    thinkingPattern: evaluation.thinkingPattern,
    keyBlindSpot: evaluation.blindSpots[0] ?? "Unknown",
  };
}

function parseTrajectory(value: unknown): Record<string, unknown> {
  if (isRecord(value)) return value;
  if (typeof value !== "string") return {};
  try {
    const parsed: unknown = JSON.parse(value);
    return isRecord(parsed) ? parsed : {};
  } catch {
    return {};
  }
}
