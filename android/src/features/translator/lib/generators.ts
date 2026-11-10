// src/features/translator/lib/generators.ts
/**
 * Translator generator. Validates the form, calls the model through Ax with the same temperature as
 * Backend/linguistic/translator, and normalises the result.
 */
import { ax } from "@ax-llm/ax";
import type { AiSettings } from "@/features/ai-settings/types";
import { createLlm } from "@/features/ai-settings/lib/llm";
import type { TranslatorRequest, TranslationResponse } from "../types";
import { contextualTranslatorSignature } from "./signatures";
import { normalizeTranslation } from "./normalize";
import { optionalText, requireText } from "./validate";

const TEMPERATURE = 0.7;

export async function translateText(
  settings: AiSettings,
  values: TranslatorRequest,
  signal?: AbortSignal,
): Promise<TranslationResponse> {
  const input = {
    textToTranslate: requireText(values.textToTranslate, "Text to translate", 10000),
    sourceLanguage: requireText(values.sourceLanguage, "Source language", 100),
    targetLanguage: requireText(values.targetLanguage, "Target language", 100),
    tone: requireText(values.tone, "Tone", 100),
    customInstructions: optionalText(values.customInstructions, "Custom instructions", 1000),
  };
  if (signal?.aborted) throw new Error("Translation cancelled.");

  const llm = createLlm(settings);
  const result = await ax(contextualTranslatorSignature).forward(llm, input, {
    modelConfig: { temperature: TEMPERATURE },
    abortSignal: signal,
  });
  if (signal?.aborted) throw new Error("Translation cancelled.");
  return normalizeTranslation(result);
}
