// src/features/foresight-trainer/lib/persistence.ts
/** Storage keys and restore helpers for the Foresight Trainer's saved form and running scenario. */
import type { DecisionRecord, ForesightSession, ScenarioMessage, StartFormValues } from "../types";
import { normalizeBlueprint, normalizeOptions, normalizeProgress, normalizeScene } from "./normalize";
import { isRecord, listOf, scoreOf, textOf } from "./text";

export const FORESIGHT_STORAGE_KEYS = {
  form: "practice.foresight-trainer.form.v1",
  session: "practice.foresight-trainer.session.v1",
} as const;

/** Takes each saved field only when its type matches the default, so a damaged draft falls back per field. */
export function restoreForm(defaults: StartFormValues, saved: unknown): StartFormValues {
  if (!isRecord(saved)) return defaults;
  return {
    userContext: typeof saved.userContext === "string" ? saved.userContext : defaults.userContext,
    mainTheme: typeof saved.mainTheme === "string" ? saved.mainTheme : defaults.mainTheme,
    difficulty: typeof saved.difficulty === "string" ? saved.difficulty : defaults.difficulty,
    maxScenes: typeof saved.maxScenes === "number" ? saved.maxScenes : defaults.maxScenes,
  };
}

export function restoreSession(saved: unknown): ForesightSession | null {
  if (!isRecord(saved) || !isRecord(saved.currentScene)) return null;
  const log: ScenarioMessage[] = listOf(saved.log)
    .filter(isRecord)
    .map((item) => ({ role: textOf(item.role) === "user" ? "user" : "assistant", content: textOf(item.content) }));
  const decisionHistory: DecisionRecord[] = listOf(saved.decisionHistory)
    .filter(isRecord)
    .map((item) => ({
      sceneNumber: scoreOf(item.sceneNumber, 1, 1, Number.MAX_SAFE_INTEGER),
      choiceMade: textOf(item.choiceMade),
      approachType: textOf(item.approachType),
      scores: restoreScores(item.scores),
      thinkingPattern: textOf(item.thinkingPattern),
      keyBlindSpot: textOf(item.keyBlindSpot),
    }));
  return {
    theme: textOf(saved.theme),
    blueprint: normalizeBlueprint(saved.blueprint),
    maxScenes: scoreOf(saved.maxScenes, 5, 1, 20),
    sceneNumber: scoreOf(saved.sceneNumber, 1, 1, Number.MAX_SAFE_INTEGER),
    currentScene: normalizeScene(saved.currentScene),
    options: normalizeOptions(saved.options),
    customOptionPrompt: textOf(saved.customOptionPrompt),
    decisionHistory,
    scenarioComplete: saved.scenarioComplete === true,
    progressReport: isRecord(saved.progressReport) ? normalizeProgress(saved.progressReport) : null,
    log,
  };
}

function restoreScores(value: unknown): Record<string, number> {
  if (!isRecord(value)) return {};
  const scores: Record<string, number> = {};
  for (const [name, score] of Object.entries(value)) {
    scores[name] = scoreOf(score, 5, 0, 10);
  }
  return scores;
}
