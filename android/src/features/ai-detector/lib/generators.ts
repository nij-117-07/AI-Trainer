// src/features/ai-detector/lib/generators.ts
/**
 * AI Detector generators. Each function validates its input, applies the same fallbacks as
 * Backend/tools/ai_detector/services.py, calls the model through Ax, and normalises the result.
 */
import { ax } from "@ax-llm/ax";
import type { AiSettings } from "@/features/ai-settings/types";
import { createLlm } from "@/features/ai-settings/lib/llm";
import { DEFAULT_TONE } from "../options";
import type { AiDetection, DetectFormValues, HumanizedText, HumanizeFormValues } from "../types";
import { aiDetectorSignature, humanizerSignature } from "./signatures";
import { normalizeDetection, normalizeHumanized } from "./normalize";
import { COMMENTS_MAX, FEEDBACK_MAX, TEXT_MAX, TONE_MAX, optionalText, requireText } from "./validate";

const DETECTION_TEMPERATURE = 0.2;
const HUMANIZER_TEMPERATURE = 0.7;
const DEFAULT_DETECTION_CONTEXT = "No additional context provided.";
const DEFAULT_DETECTION_FEEDBACK = "No specific feedback provided.";
const DEFAULT_ADDITIONAL_COMMENTS = "No additional comments provided.";

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

export async function humanizeText(
  settings: AiSettings,
  values: HumanizeFormValues,
  signal: AbortSignal,
): Promise<HumanizedText> {
  const aiText = requireText(values.aiText, "Text to humanize", TEXT_MAX);
  const targetTone = requireText(values.targetTone || DEFAULT_TONE, "Target tone", TONE_MAX);
  const detectionFeedback = optionalText(values.detectionFeedback, "Detection feedback", FEEDBACK_MAX);
  const additionalComments = optionalText(values.additionalComments, "Extra instructions", COMMENTS_MAX);
  const llm = createLlm(settings);
  throwIfCancelled(signal);
  const result = await ax(humanizerSignature).forward(
    llm,
    {
      aiText,
      targetTone,
      detectionFeedback: detectionFeedback ?? DEFAULT_DETECTION_FEEDBACK,
      additionalComments: additionalComments ?? DEFAULT_ADDITIONAL_COMMENTS,
    },
    { abortSignal: signal, modelConfig: { temperature: HUMANIZER_TEMPERATURE } },
  );
  return normalizeHumanized(result);
}
