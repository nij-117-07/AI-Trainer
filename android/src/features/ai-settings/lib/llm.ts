// src/features/ai-settings/lib/llm.ts
/**
 * Builds an Ax language model client from the saved AI settings. Any OpenAI-compatible
 * endpoint works through the base URL; an empty base URL uses the OpenAI default.
 */
import { ai, type AxAIOpenAIModel } from "@ax-llm/ax";
import type { AiSettings } from "@/features/ai-settings/types";

export class AiNotConfiguredError extends Error {
  constructor() {
    super("Add a model name and API key in AI settings first.");
    this.name = "AiNotConfiguredError";
  }
}

export function isAiConfigured(settings: AiSettings): boolean {
  return settings.modelName.trim() !== "" && settings.apiKey.trim() !== "";
}

export function createLlm(settings: AiSettings) {
  if (!isAiConfigured(settings)) {
    throw new AiNotConfiguredError();
  }
  return ai({
    name: "openai",
    apiKey: settings.apiKey.trim(),
    ...(settings.baseUrl ? { apiURL: settings.baseUrl } : {}),
    // Custom endpoints accept model names outside Ax's built-in OpenAI list.
    config: { model: settings.modelName.trim() as AxAIOpenAIModel },
  });
}
