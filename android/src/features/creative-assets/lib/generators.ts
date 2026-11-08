// src/features/creative-assets/lib/generators.ts
/**
 * Creative asset generator. Validates the form, calls the model through Ax with the user's saved
 * AI settings, and normalises the result. Stops early when the signal is aborted.
 */
import { ax } from "@ax-llm/ax";
import type { AiSettings } from "@/features/ai-settings/types";
import { createLlm } from "@/features/ai-settings/lib/llm";
import { TASK_TYPES } from "../options";
import type { CreativeAssetsFormValues, CreativeAssetsResult } from "../types";
import { creativeAssetSignature } from "./signatures";
import { normalizeCreativeAssets } from "./normalize";
import { clampCount, optionalLines, optionalText, requireOption, requireText, throwIfAborted } from "./validate";

const TEMPERATURE = 0.4;

export async function generateCreativeAssets(
  settings: AiSettings,
  values: CreativeAssetsFormValues,
  signal: AbortSignal,
): Promise<CreativeAssetsResult> {
  const llm = createLlm(settings);
  throwIfAborted(signal);
  const result = await ax(creativeAssetSignature).forward(
    llm,
    {
      taskType: requireOption(values.taskType, TASK_TYPES, "Task type"),
      userQuery: requireText(values.userQuery, "Topic / product description", 2000),
      context: optionalText(values.context, "Context", 2000),
      referenceExamples: optionalLines(values.referenceExamples, "Reference examples", 3000),
      numberOfSuggestions: clampCount(values.numberOfSuggestions, 1, 20),
    },
    { abortSignal: signal, modelConfig: { temperature: TEMPERATURE } },
  );
  throwIfAborted(signal);
  return normalizeCreativeAssets(result);
}
