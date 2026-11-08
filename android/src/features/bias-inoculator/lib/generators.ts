// src/features/bias-inoculator/lib/generators.ts
/**
 * Cognitive Bias Inoculator generator. Validates the form, resolves a random bias when asked,
 * calls the model through Ax, and normalises the scenario.
 */
import { ax } from "@ax-llm/ax";
import type { AiSettings } from "@/features/ai-settings/types";
import { createLlm } from "@/features/ai-settings/lib/llm";
import type { BiasFormValues, BiasScenario } from "../types";
import { cognitiveBiasSignature } from "./signatures";
import { normalizeScenario } from "./normalize";
import { requireText, resolveTargetBias } from "./validate";

const TEMPERATURE = 0.7;
const NEW_SESSION = "New session.";

export async function generateBiasScenario(
  settings: AiSettings,
  values: BiasFormValues,
  signal: AbortSignal,
): Promise<BiasScenario> {
  const llm = createLlm(settings);
  const userInterest = requireText(values.userInterest, "Field of interest", 200);
  const targetBias = resolveTargetBias(values.targetBias);

  const result = await ax(cognitiveBiasSignature).forward(
    llm,
    {
      conversationHistory: NEW_SESSION,
      targetBias,
      userInterest,
    },
    { modelConfig: { temperature: TEMPERATURE }, abortSignal: signal },
  );
  if (signal.aborted) throw new Error("The scenario was cancelled.");
  return normalizeScenario(result, targetBias);
}
