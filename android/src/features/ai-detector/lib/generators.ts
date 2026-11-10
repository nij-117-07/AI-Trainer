// src/features/ai-detector/lib/generators.ts
/**
 * AI Detector generator. Validates the form, applies the same fallbacks as
 * Backend/tools/ai_detector/services.py, calls the model through Ax, and normalises the result.
 */
import { ax } from "@ax-llm/ax";
import type { AiSettings } from "@/features/ai-settings/types";
import { createLlm } from "@/features/ai-settings/lib/llm";
import type { AiDetection, DetectFormValues } from "../types";
import { aiDetectorSignature } from "./signatures";
import { normalizeDetection } from "./normalize";
import { COMMENTS_MAX, TEXT_MAX, optionalText, requireText } from "./validate";

const DETECTION_TEMPERATURE = 0.2;
const DEFAULT_DETECTION_CONTEXT = "No additional context provided.";

function throwIfCancelled(signal: AbortSignal): void {
  if (signal.aborted) throw new Error("Request cancelled.");
}

export async function detectAiText(
  settings: AiSettings,
  values: DetectFormValues,
  signal: AbortSignal,
): Promise<AiDetection> {
  const textToCheck = requireText(values.textToCheck, "Text to analyze", TEXT_MAX);
  const additionalComments = optionalText(values.additionalComments, "Additional context", COMMENTS_MAX);
  const llm = createLlm(settings);
  throwIfCancelled(signal);
  const result = await ax(aiDetectorSignature).forward(
    llm,
    {
      textToCheck,
      additionalComments: additionalComments ?? DEFAULT_DETECTION_CONTEXT,
    },
    { abortSignal: signal, modelConfig: { temperature: DETECTION_TEMPERATURE } },
  );
  return normalizeDetection(result);
}
