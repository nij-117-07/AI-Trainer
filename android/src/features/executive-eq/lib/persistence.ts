// src/features/executive-eq/lib/persistence.ts
/** Storage keys and restore helpers for the Executive EQ Trainer's saved form and session. */
import type { DialogueTurn, ExecutiveEqSession, ScenarioFormValues, SimulationMessage } from "../types";
import { normalizeEvaluation, normalizeScenario, normalizeTurn } from "./normalize";
import { isRecord, listOf, textOf } from "./text";

export const EQ_STORAGE_KEYS = {
  form: "practice.executive-eq.form.v1",
  session: "practice.executive-eq.session.v1",
} as const;

/** Takes each saved field only when its type matches the default, so a damaged draft falls back per field. */
export function restoreForm(defaults: ScenarioFormValues, saved: unknown): ScenarioFormValues {
  if (!isRecord(saved)) return defaults;
  const merged = { ...defaults };
  for (const key of Object.keys(defaults) as (keyof ScenarioFormValues)[]) {
    const value = saved[key];
    if (typeof value === "string") merged[key] = value;
  }
  return merged;
}

export function restoreSession(saved: unknown): ExecutiveEqSession | null {
  if (!isRecord(saved) || !isRecord(saved.scenario)) return null;
  const chatHistory: DialogueTurn[] = listOf(saved.chatHistory)
    .filter(isRecord)
    .map((item) => ({ role: textOf(item.role) === "user" ? "user" : "npc", content: textOf(item.content) }));
  const log: SimulationMessage[] = listOf(saved.log)
    .filter(isRecord)
    .map((item) => ({ role: textOf(item.role) === "user" ? "user" : "assistant", content: textOf(item.content) }));
  return {
    scenario: normalizeScenario(saved.scenario),
    learningFocus: textOf(saved.learningFocus),
    narrativeArc: textOf(saved.narrativeArc),
    chatHistory,
    log,
    grades: listOf(saved.grades).filter(isRecord).map(normalizeEvaluation),
    lastBriefing: isRecord(saved.lastBriefing) ? normalizeTurn(saved.lastBriefing) : null,
    scenarioContext: textOf(saved.scenarioContext),
    npcLastStatement: textOf(saved.npcLastStatement),
  };
}
