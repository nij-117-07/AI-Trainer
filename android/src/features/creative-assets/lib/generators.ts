// src/features/creative-assets/lib/generators.ts
/**
 * Creative asset generators. Validates the form, calls the model through Ax with the user's saved
 * AI settings, and normalises the result. "More" rounds send the liked suggestions and the user's
 * instructions. Both stop early when the signal is aborted.
 */
import { ax } from "@ax-llm/ax";
import type { AiSettings } from "@/features/ai-settings/types";
import { createLlm } from "@/features/ai-settings/lib/llm";
import type { CreativeAssetsFormValues, CreativeMoreInput, CreativeSuggestion } from "../types";
import { creativeAssetMoreSignature, creativeAssetSignature } from "./signatures";
import { normalizeCreativeAssets } from "./normalize";
import { clampCount, optionalLines, optionalText, requireText, throwIfAborted } from "./validate";

const TEMPERATURE = 0.4;
const MORE_TEMPERATURE = 0.6;

export async function generateCreativeAssets(
  settings: AiSettings,
  values: CreativeAssetsFormValues,
  signal: AbortSignal,
): Promise<CreativeSuggestion[]> {
  const llm = createLlm(settings);
  throwIfAborted(signal);
  const result = await ax(creativeAssetSignature).forward(
    llm,
    {
      taskType: requireText(values.taskType, "Task type", 100),
      userQuery: requireText(values.userQuery, "Topic / product description", 2000),
      context: optionalText(values.context, "Context", 2000),
      referenceExamples: optionalLines(values.referenceExamples, "Reference examples", 3000),
      numberOfSuggestions: clampCount(values.numberOfSuggestions, 1, 20),
    },
    { abortSignal: signal, modelConfig: { temperature: TEMPERATURE } },
  );
  throwIfAborted(signal);
  return normalizeCreativeAssets(result).suggestions;
}

export async function generateMoreCreativeAssets(
  settings: AiSettings,
  values: CreativeMoreInput,
  signal: AbortSignal,
): Promise<CreativeSuggestion[]> {
  const llm = createLlm(settings);
  throwIfAborted(signal);
  if (values.likedSuggestions.length === 0) throw new Error("Tick at least one suggestion first.");
  const result = await ax(creativeAssetMoreSignature).forward(
    llm,
    {
      taskType: requireText(values.taskType, "Task type", 100),
      userQuery: requireText(values.userQuery, "Topic / product description", 2000),
      context: optionalText(values.context, "Context", 2000),
      likedSuggestions: values.likedSuggestions.join("\n"),
      userInstructions: optionalText(values.userInstructions, "User instructions", 1000),
      numberOfSuggestions: clampCount(values.numberOfSuggestions, 1, 20),
    },
    { abortSignal: signal, modelConfig: { temperature: MORE_TEMPERATURE } },
  );
  throwIfAborted(signal);
  return normalizeCreativeAssets(result).suggestions;
}
