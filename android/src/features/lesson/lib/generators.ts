// src/features/lesson/lib/generators.ts
/**
 * Language Lesson generator. Validates the form the same way the webui does, fills the seed when
 * it is blank, calls the model through Ax, and normalises the result.
 */
import { ax } from "@ax-llm/ax";
import type { AiSettings } from "@/features/ai-settings/types";
import { createLlm } from "@/features/ai-settings/lib/llm";
import { CEFR_LEVELS, COMPLEXITY_WEIGHTS, LEARNING_FOCUSES } from "../options";
import type { Lesson, LessonFormValues } from "../types";
import { languageLessonSignature } from "./signatures";
import { normalizeLesson } from "./normalize";
import { optionalText, requireOption, requireText } from "./validate";

const TEMPERATURE = 0.7;

export async function generateLesson(
  settings: AiSettings,
  values: LessonFormValues,
  signal?: AbortSignal,
): Promise<Lesson> {
  const llm = createLlm(settings);
  const input = {
    nativeLanguage: requireText(values.nativeLanguage, "Native language", 100),
    targetLanguage: requireText(values.targetLanguage, "Target language", 100),
    currentLevel: requireOption(values.currentLevel, CEFR_LEVELS, "Current level"),
    lastLessonSummary: optionalText(values.lastLessonSummary, "Last lesson summary", 2000),
    learningFocus: requireOption(values.learningFocus, LEARNING_FOCUSES, "Learning focus"),
    complexityWeight: requireOption(values.complexityWeight, COMPLEXITY_WEIGHTS, "Complexity weight"),
    seed: optionalText(values.seed, "Seed", 200) ?? `lesson_${Date.now()}`,
    userCustomInstruction: optionalText(values.userCustomInstruction, "Custom instruction", 2000),
  };
  if (signal?.aborted) throw new Error("Lesson request cancelled.");
  const result = await ax(languageLessonSignature).forward(llm, input, {
    modelConfig: { temperature: TEMPERATURE },
    abortSignal: signal,
  });
  if (signal?.aborted) throw new Error("Lesson request cancelled.");
  return normalizeLesson(result);
}
