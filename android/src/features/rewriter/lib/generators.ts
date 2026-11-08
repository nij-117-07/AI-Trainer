// src/features/rewriter/lib/generators.ts
/**
 * Rewriter generator. Validates the form, applies the backend's "None" custom-instruction fallback,
 * calls the model through Ax with the user's saved AI settings, and normalises the result. Stops
 * early when the signal is aborted.
 */
import { ax } from "@ax-llm/ax";
import type { AiSettings } from "@/features/ai-settings/types";
import { createLlm } from "@/features/ai-settings/lib/llm";
import { TRANSFORMATION_GOALS } from "../options";
import type { RewriteFormValues, RewriteResult } from "../types";
import { textRewriterSignature } from "./signatures";
import { normalizeRewrite } from "./normalize";
import {
  optionalText,
  requireOption,
  requireText,
  throwIfAborted,
} from "./validate";

const TEMPERATURE = 0.7;

export async function rewriteText(
  settings: AiSettings,
  values: RewriteFormValues,
  signal: AbortSignal,
): Promise<RewriteResult> {
  const llm = createLlm(settings);
  throwIfAborted(signal);
  const result = await ax(textRewriterSignature).forward(
    llm,
    {
      originalText: requireText(values.originalText, "Original text", 10000),
      targetTone: requireText(values.targetTone, "Target tone", 200),
      audience: requireText(values.audience, "Audience", 200),
      transformationGoal: requireOption(
        values.transformationGoal,
        TRANSFORMATION_GOALS,
        "Transformation goal",
      ),
      customInstructions:
        optionalText(values.customInstructions, "Custom instructions", 1000) ??
        "None",
    },
    { abortSignal: signal, modelConfig: { temperature: TEMPERATURE } },
  );
  throwIfAborted(signal);
  return normalizeRewrite(result);
}
