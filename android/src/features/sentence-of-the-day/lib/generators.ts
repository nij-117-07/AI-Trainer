// src/features/sentence-of-the-day/lib/generators.ts
/**
 * Sentence of the Day generator. Validates the form the same way the webui does, uses the same
 * per-day seed as the backend, calls the model through Ax, and normalises the result.
 */
import { ax } from "@ax-llm/ax";
import type { AiSettings } from "@/features/ai-settings/types";
import { createLlm } from "@/features/ai-settings/lib/llm";
import { COMPLEXITY_LEVELS, CONTEXT_SETTINGS } from "../options";
import type { SentenceFormValues, SentenceOfTheDay } from "../types";
import { sentenceOfTheDaySignature } from "./signatures";
import { normalizeSentence } from "./normalize";
import { formatLocalDate } from "./text";
import { requireOption, requireText } from "./validate";

const TEMPERATURE = 0.7;

export async function generateSentenceOfTheDay(
  settings: AiSettings,
  values: SentenceFormValues,
  signal?: AbortSignal,
): Promise<SentenceOfTheDay> {
  const llm = createLlm(settings);
  const targetLanguage = requireText(values.targetLanguage, "Target language", 100);
  const date = formatLocalDate(new Date());
  const input = {
    sentenceDate: date,
    targetLanguage,
    nativeLanguage: requireText(values.nativeLanguage, "Native language", 100),
    contextSetting: requireOption(values.contextSetting, CONTEXT_SETTINGS, "Context setting"),
    complexityLevel: requireOption(values.complexityLevel, COMPLEXITY_LEVELS, "Complexity level"),
    seed: `${date}_${targetLanguage}`,
  };
  if (signal?.aborted) throw new Error("Sentence request cancelled.");
  const result = await ax(sentenceOfTheDaySignature).forward(llm, input, {
    modelConfig: { temperature: TEMPERATURE },
    abortSignal: signal,
  });
  if (signal?.aborted) throw new Error("Sentence request cancelled.");
  return normalizeSentence(result, date);
}
