// src/features/battleground/lib/normalize.ts
/**
 * Turns raw model output into the typed battleground records. Defaults and clamp ranges follow
 * Backend/practice/battleground/services.py, so a bad value degrades to the same fallback the
 * backend would use.
 */
import type {
  BattleChallenge,
  BattleEvaluation,
  BattleProfile,
  OpponentProfile,
} from "../types";
import {
  booleanOf,
  clamp,
  isRecord,
  numberOf,
  numberRecord,
  parseRecord,
  textList,
  textOf,
  textRecord,
} from "./text";

export const DEFAULT_OPPONENT_NAME = "The adversary";

export function normalizeProfile(raw: unknown, fallbackCallsign: string): BattleProfile {
  const source = parseRecord(raw);
  return {
    callsign: textOf(source.callsign) || fallbackCallsign,
    rank: textOf(source.rank),
    specializations: textList(source.specializations),
    strengths: textList(source.strengths),
    weaknesses: textList(source.weaknesses),
    availableLoadout: textList(source.availableLoadout),
    combatDoctrine: textOf(source.combatDoctrine),
  };
}

export function normalizeOpponent(raw: unknown): OpponentProfile {
  const source = parseRecord(raw);
  return {
    name: textOf(source.name) || DEFAULT_OPPONENT_NAME,
    title: textOf(source.title),
    capabilities: textRecord(source.capabilities),
    motives: textOf(source.motives),
    personality: textList(source.personality),
    adaptabilityStyle: textOf(source.adaptabilityStyle),
    signatureTactics: textList(source.signatureTactics),
    weaknesses: textList(source.weaknesses),
    availableResources: textList(source.availableResources),
  };
}

/** Clamps a model health value into [low, high], or uses the fallback when it is missing. */
export function normalizeHealth(value: unknown, fallback: number, low: number, high: number): number {
  const parsed = numberOf(value);
  return parsed === null ? fallback : clamp(Math.round(parsed), low, high);
}

export function normalizeChallenge(raw: unknown, tacticType: string): BattleChallenge {
  const source = parseRecord(raw);
  return {
    tacticType,
    briefing: textOf(source.missionBriefing),
    tacticalSituation: textOf(source.tacticalSituation),
    challenge: textOf(source.specificChallenge),
    question: textOf(source.mainQuestion),
    constraints: textList(source.constraints),
    referenceMaterial: textRecord(source.referenceMaterial),
    updatedLearningLog: "",
    environmentChange: textOf(source.environmentChange),
  };
}

export function normalizeEvaluation(raw: unknown): BattleEvaluation {
  const source = isRecord(raw) ? raw : {};
  const score = numberOf(source.score);
  return {
    score: score === null ? 0.5 : clamp(score, 0, 1),
    feedback: textOf(source.feedback),
    narrative: textOf(source.narrativeConsequence),
    battlefieldShift: textOf(source.battlefieldShift),
    hpDeltaUser: normalizeDelta(source.healthImpactUser, -50, 10),
    hpDeltaOpponent: normalizeDelta(source.healthImpactOpponent, -30, 0),
    resourceImpact: numberRecord(source.resourceImpact),
    isTerminated: booleanOf(source.isTerminated),
    terminationReason: textOf(source.terminationReason),
  };
}

function normalizeDelta(value: unknown, low: number, high: number): number {
  const parsed = numberOf(value);
  return parsed === null ? 0 : clamp(Math.round(parsed), low, high);
}
