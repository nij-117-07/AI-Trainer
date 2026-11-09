// src/features/dharma-instructor/lib/generators.ts
/**
 * One Dharma instructor turn. Validates the student's message, sends the recent conversation,
 * and returns the reply with its teaching and practice. Calls take an AbortSignal so a reset
 * stops the request in flight.
 */
import { ax } from "@ax-llm/ax";
import type { AiSettings } from "@/features/ai-settings/types";
import { createLlm } from "@/features/ai-settings/lib/llm";
import { MESSAGE_MAX } from "../options";
import type { DharmaTurn, DharmaTurnValues } from "../types";
import { normalizeTurn } from "./normalize";
import { dharmaTurnSignature } from "./signatures";
import { formatHistory } from "./transcript";
import { requireText } from "./validate";

const TEMPERATURE = 0.5;

export async function runDharmaTurn(
  settings: AiSettings,
  values: DharmaTurnValues,
  signal?: AbortSignal,
): Promise<DharmaTurn> {
  const message = requireText(values.message, "Message", MESSAGE_MAX);
  const llm = createLlm(settings);
  if (signal?.aborted) throw new Error("Request cancelled.");
  const result = await ax(dharmaTurnSignature).forward(
    llm,
    {
      message,
      history: formatHistory(values.history),
    },
    { modelConfig: { temperature: TEMPERATURE }, abortSignal: signal },
  );
  return normalizeTurn(result);
}
