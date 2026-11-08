// src/features/flexible-writer/lib/generators.ts
/**
 * Flexible Writer generator. Validates the form, calls the model through Ax with the saved AI
 * settings, and normalises the result. Temperature matches the backend (0.7).
 */
import { ax } from "@ax-llm/ax";
import type { AiSettings } from "@/features/ai-settings/types";
import { createLlm } from "@/features/ai-settings/lib/llm";
import type { FlexibleWriterFormValues, FlexibleWriterResult } from "../types";
import { normalizeFlexibleWriter } from "./normalize";
import { flexibleWriterSignature } from "./signatures";
import { INPUT_DATA_MAX, INSTRUCTIONS_MAX, SYSTEM_PROMPT_MAX, optionalText, requireText } from "./validate";

const TEMPERATURE = 0.7;

export async function transformData(
  settings: AiSettings,
  values: FlexibleWriterFormValues,
  signal?: AbortSignal,
): Promise<FlexibleWriterResult> {
  const input = {
    systemPrompt: requireText(values.systemPrompt, "System prompt", SYSTEM_PROMPT_MAX),
    inputData: requireText(values.inputData, "Input data", INPUT_DATA_MAX),
    additionalUserInput: optionalText(values.additionalUserInput, "Additional instructions", INSTRUCTIONS_MAX),
  };
  if (signal?.aborted) throw new Error("Transformation cancelled.");
  const llm = createLlm(settings);
  const result = await ax(flexibleWriterSignature).forward(llm, input, {
    abortSignal: signal,
    modelConfig: { temperature: TEMPERATURE },
  });
  return normalizeFlexibleWriter(result);
}
