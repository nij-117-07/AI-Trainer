// src/features/poet-engine/lib/generators.ts
/**
 * Poet Engine generator. Validates the form, applies the backend's "mystical" mood default, calls
 * the model through Ax with the user's saved AI settings, and normalises the result. Stops early
 * when the signal is aborted.
 */
import { ax } from "@ax-llm/ax";
import type { AiSettings } from "@/features/ai-settings/types";
import { createLlm } from "@/features/ai-settings/lib/llm";
import { POETIC_STYLES } from "../options";
import type { ConceptFormValues, ConceptResult } from "../types";
import { poeticLanguageExplainerSignature } from "./signatures";
import { normalizeConcept } from "./normalize";
import {
  optionalText,
  requireOption,
  requireText,
  throwIfAborted,
} from "./validate";

const TEMPERATURE = 0.7;

export async function explainConcept(
  settings: AiSettings,
  values: ConceptFormValues,
  signal: AbortSignal,
): Promise<ConceptResult> {
  const llm = createLlm(settings);
  throwIfAborted(signal);
  const result = await ax(poeticLanguageExplainerSignature).forward(
    llm,
    {
      targetLanguage: requireText(
        values.targetLanguage,
        "Target language",
        100,
      ),
      nativeLanguage: requireText(
        values.nativeLanguage,
        "Native language",
        100,
      ),
      conceptWord: requireText(values.conceptWord, "Concept word", 200),
      poeticStyle: requireOption(
        values.poeticStyle,
        POETIC_STYLES,
        "Poetic style",
      ),
      userMood: optionalText(values.userMood, "User mood", 200) ?? "mystical",
      userCustomInstruction: optionalText(
        values.userCustomInstruction,
        "Custom instruction",
        1000,
      ),
    },
    { abortSignal: signal, modelConfig: { temperature: TEMPERATURE } },
  );
  throwIfAborted(signal);
  return normalizeConcept(result);
}
