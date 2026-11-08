// src/features/riddle/lib/generators.ts
/**
 * Riddle Generator calls. Each function validates its input, calls the model through Ax with the
 * same temperature as Backend/practice/riddle/services.py, and normalises the result.
 */
import { ax } from "@ax-llm/ax";
import type { AiSettings } from "@/features/ai-settings/types";
import { createLlm } from "@/features/ai-settings/lib/llm";
import { COGNITIVE_DOMAINS, DIFFICULTY_LEVELS } from "../options";
import type { RiddleContent, RiddleEvaluation, RiddleFormValues } from "../types";
import { adaptiveRiddleSignature, riddleEvaluatorSignature } from "./signatures";
import { normalizeEvaluation, normalizeRiddle } from "./normalize";
import { requireOption, requireText } from "./validate";

const GENERATOR_TEMPERATURE = 0.7;
const EVALUATOR_TEMPERATURE = 0.2;
const SEED_RANGE = 1_000_000;

export async function generateRiddle(
  settings: AiSettings,
  values: RiddleFormValues,
  signal?: AbortSignal,
): Promise<RiddleContent> {
  const fieldOfInterest = requireText(values.fieldOfInterest, "Topic", 200);
  const targetDomain = requireOption(values.targetDomain, COGNITIVE_DOMAINS, "Cognitive domain");
  const difficultyLevel = requireOption(values.difficultyLevel, DIFFICULTY_LEVELS, "Difficulty");
  const llm = createLlm(settings);
  if (signal?.aborted) throw new Error("Request cancelled.");
  const result = await ax(adaptiveRiddleSignature).forward(
    llm,
    {
      fieldOfInterest,
      targetDomain,
      difficultyLevel,
      seed: Math.floor(Math.random() * SEED_RANGE),
    },
    { modelConfig: { temperature: GENERATOR_TEMPERATURE }, abortSignal: signal },
  );
  return normalizeRiddle(result);
}

export async function evaluateRiddleAnswer(
  settings: AiSettings,
  riddle: RiddleContent,
  userAnswer: string,
  signal?: AbortSignal,
): Promise<RiddleEvaluation> {
  const answer = requireText(userAnswer, "Your answer", 2000);
  const llm = createLlm(settings);
  if (signal?.aborted) throw new Error("Request cancelled.");
  const result = await ax(riddleEvaluatorSignature).forward(
    llm,
    {
      riddleText: riddle.riddleText,
      solution: riddle.solution,
      userAnswer: answer,
    },
    { modelConfig: { temperature: EVALUATOR_TEMPERATURE }, abortSignal: signal },
  );
  return normalizeEvaluation(result);
}
