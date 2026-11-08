// src/features/executive-eq/lib/normalize.ts
/**
 * Turns raw model output into the typed results the screens render. Enum-like fields fall back to
 * the backend defaults, and every list and string is read through the guarded helpers.
 */
import type { EvaluationResult, NpcProfile, ScenarioResult, TurnResult } from "../types";
import { isRecord, pick, textList, textOf } from "./text";

export const STATUS_IMPACTS = ["Increased", "Maintained", "Diminished", "Completely Lost"] as const;
export const STRATEGIC_GRADES = ["A", "B", "C", "D", "F"] as const;

export function normalizeScenario(raw: {
  scenarioTitle?: unknown;
  settingDescription?: unknown;
  npcProfile?: unknown;
  initialStakes?: unknown;
  openingHook?: unknown;
}): ScenarioResult {
  const profile: Record<string, unknown> = isRecord(raw.npcProfile) ? raw.npcProfile : {};
  const npcProfile: NpcProfile = {
    name: textOf(profile.name),
    title: textOf(profile.title),
    personality: textOf(profile.personality),
    hiddenMotive: textOf(profile.hiddenMotive),
    tell: textOf(profile.tell),
  };
  return {
    scenarioTitle: textOf(raw.scenarioTitle),
    settingDescription: textOf(raw.settingDescription),
    npcProfile,
    initialStakes: textOf(raw.initialStakes),
    openingHook: textOf(raw.openingHook),
  };
}

export function normalizeTurn(raw: {
  rationale?: unknown;
  meetingScenario?: unknown;
  npcDialogue?: unknown;
  eqCoachMessage?: unknown;
  suggestedStrategies?: unknown;
}): TurnResult {
  return {
    rationale: textOf(raw.rationale),
    meetingScenario: textOf(raw.meetingScenario),
    npcDialogue: textOf(raw.npcDialogue),
    eqCoachMessage: textOf(raw.eqCoachMessage),
    suggestedStrategies: textList(raw.suggestedStrategies),
  };
}

export function normalizeEvaluation(raw: {
  subtextAccuracy?: unknown;
  statusImpact?: unknown;
  strategicGrade?: unknown;
  strengths?: unknown;
  criticalFlaws?: unknown;
  theRewrittenProMove?: unknown;
  coachingTip?: unknown;
}): EvaluationResult {
  return {
    subtextAccuracy: textOf(raw.subtextAccuracy),
    statusImpact: pick(raw.statusImpact, STATUS_IMPACTS, "Maintained"),
    strategicGrade: pick(raw.strategicGrade, STRATEGIC_GRADES, "C"),
    strengths: textList(raw.strengths),
    criticalFlaws: textList(raw.criticalFlaws),
    theRewrittenProMove: textOf(raw.theRewrittenProMove),
    coachingTip: textOf(raw.coachingTip),
  };
}
