// src/features/foresight-trainer/lib/generators.ts
/**
 * Foresight Trainer generators. startScenario and processDecision run the same steps as
 * ForesightService in Backend/practice/foresight_trainer/services.py, calling the model through Ax
 * with the backend's temperatures (creative 0.8, analytical 0.3) and the caller's AbortSignal.
 */
import { ax } from "@ax-llm/ax";
import type { AiSettings } from "@/features/ai-settings/types";
import { createLlm } from "@/features/ai-settings/lib/llm";
import { DIFFICULTY_LEVELS } from "../options";
import type { DecisionInput, DecisionOutcome, StartFormValues, StartResult } from "../types";
import {
  consequenceEngineSignature,
  contextAnalyzerSignature,
  decisionEvaluatorSignature,
  insightGeneratorSignature,
  nextSceneGeneratorSignature,
  optionDesignerSignature,
  progressTrackerSignature,
  situationGeneratorSignature,
} from "./signatures";
import {
  buildDecisionRecord,
  normalizeBlueprint,
  normalizeConsequences,
  normalizeEvaluation,
  normalizeInsight,
  normalizeOptions,
  normalizeProgress,
  normalizeScene,
} from "./normalize";
import { jsonLines, orFallback, textOf } from "./text";
import { clampCount, requireOption, requireText } from "./validate";

const CREATIVE_TEMPERATURE = 0.8;
const ANALYTICAL_TEMPERATURE = 0.3;
const CANCELLED = "Request cancelled.";
const CONTINUE_SCENE = "Continue the scenario.";

export async function startScenario(
  settings: AiSettings,
  values: StartFormValues,
  signal?: AbortSignal,
): Promise<StartResult> {
  const llm = createLlm(settings);
  const userContext = requireText(values.userContext, "Your context", 3000);
  const mainTheme = requireText(values.mainTheme, "Theme or skill", 300);
  const difficultyLevel = requireOption(values.difficulty, DIFFICULTY_LEVELS, "Difficulty");
  const maxScenes = clampCount(values.maxScenes, 1, 20);

  const blueprintResult = await ax(contextAnalyzerSignature).forward(
    llm,
    { userContext, mainTheme, difficultyLevel },
    modelOptions(ANALYTICAL_TEMPERATURE, signal),
  );
  throwIfCancelled(signal);
  const blueprint = normalizeBlueprint(blueprintResult.scenarioBlueprint);
  const blueprintJson = JSON.stringify(blueprint);

  const sceneResult = await ax(situationGeneratorSignature).forward(
    llm,
    { scenarioBlueprint: blueprintJson, sceneNumber: 1, previousContext: "This is the opening scene." },
    modelOptions(CREATIVE_TEMPERATURE, signal),
  );
  throwIfCancelled(signal);
  const scene = normalizeScene(sceneResult);

  const optionsResult = await ax(optionDesignerSignature).forward(
    llm,
    {
      decisionPoint: orFallback(scene.decisionPoint, "What do you do next?"),
      sceneNarrative: orFallback(scene.sceneNarrative, CONTINUE_SCENE),
      scenarioBlueprint: blueprintJson,
    },
    modelOptions(CREATIVE_TEMPERATURE, signal),
  );
  throwIfCancelled(signal);

  return {
    scene,
    options: normalizeOptions(optionsResult.options),
    customOptionPrompt: textOf(optionsResult.customOptionPrompt),
    blueprint,
    maxScenes,
  };
}

/** Evaluates the choice, derives its consequences, and writes the next scene (or the final report). */
export async function processDecision(
  settings: AiSettings,
  input: DecisionInput,
  signal?: AbortSignal,
): Promise<DecisionOutcome> {
  const llm = createLlm(settings);
  const { session } = input;
  const choice = requireText(input.choice, "Your choice", 300);
  const reasoning = requireText(input.reasoning, "Your reasoning", 2000);
  const blueprintJson = JSON.stringify(session.blueprint);
  const sceneNarrative = orFallback(session.currentScene.sceneNarrative, CONTINUE_SCENE);

  const evaluationResult = await ax(decisionEvaluatorSignature).forward(
    llm,
    {
      userChoice: choice,
      userReasoning: reasoning,
      options: jsonLines(session.options),
      scenarioBlueprint: blueprintJson,
    },
    modelOptions(ANALYTICAL_TEMPERATURE, signal),
  );
  throwIfCancelled(signal);
  const evaluation = normalizeEvaluation(evaluationResult.evaluation);
  const evaluationJson = JSON.stringify(evaluation);

  const insightResult = await ax(insightGeneratorSignature).forward(
    llm,
    {
      evaluation: evaluationJson,
      userReasoning: reasoning,
      sceneNumber: session.sceneNumber,
      decisionHistory: session.decisionHistory.length > 0 ? jsonLines(session.decisionHistory) : undefined,
    },
    modelOptions(ANALYTICAL_TEMPERATURE, signal),
  );
  throwIfCancelled(signal);
  const insight = normalizeInsight(insightResult.insightReport);

  const consequenceResult = await ax(consequenceEngineSignature).forward(
    llm,
    {
      userChoice: choice,
      userReasoning: reasoning,
      scenarioBlueprint: blueprintJson,
      sceneNarrative,
      evaluation: evaluationJson,
    },
    modelOptions(CREATIVE_TEMPERATURE, signal),
  );
  throwIfCancelled(signal);
  const consequences = normalizeConsequences(consequenceResult.consequences);

  const history = [...session.decisionHistory, buildDecisionRecord(session.sceneNumber, choice, evaluation)];

  if (session.sceneNumber >= session.maxScenes) {
    const progressResult = await ax(progressTrackerSignature).forward(
      llm,
      { decisionHistory: jsonLines(history), mainTheme: session.theme },
      modelOptions(ANALYTICAL_TEMPERATURE, signal),
    );
    throwIfCancelled(signal);
    return {
      evaluation,
      consequences,
      insight,
      scenarioComplete: true,
      decisionHistory: history,
      progressReport: normalizeProgress(progressResult.progressReport),
      nextScene: null,
      nextOptions: [],
      customOptionPrompt: null,
    };
  }

  const nextSceneNumber = session.sceneNumber + 1;
  const nextResult = await ax(nextSceneGeneratorSignature).forward(
    llm,
    {
      consequences: JSON.stringify(consequences),
      scenarioBlueprint: blueprintJson,
      sceneNumber: nextSceneNumber,
      previousSceneSummary: `Scene ${session.sceneNumber}: User chose '${choice}'. ${consequences.worldStateUpdate}`,
      evaluation: evaluationJson,
    },
    modelOptions(CREATIVE_TEMPERATURE, signal),
  );
  throwIfCancelled(signal);
  const nextScene = normalizeScene(nextResult, true);

  const optionsResult = await ax(optionDesignerSignature).forward(
    llm,
    {
      decisionPoint: orFallback(nextScene.decisionPoint, "What do you do next?"),
      sceneNarrative: orFallback(nextScene.sceneNarrative, CONTINUE_SCENE),
      scenarioBlueprint: blueprintJson,
    },
    modelOptions(CREATIVE_TEMPERATURE, signal),
  );
  throwIfCancelled(signal);

  return {
    evaluation,
    consequences,
    insight,
    scenarioComplete: false,
    decisionHistory: history,
    progressReport: null,
    nextScene,
    nextOptions: normalizeOptions(optionsResult.options),
    customOptionPrompt: textOf(optionsResult.customOptionPrompt),
  };
}

function modelOptions(temperature: number, signal?: AbortSignal) {
  return { modelConfig: { temperature }, abortSignal: signal };
}

function throwIfCancelled(signal?: AbortSignal) {
  if (signal?.aborted) throw new Error(CANCELLED);
}
