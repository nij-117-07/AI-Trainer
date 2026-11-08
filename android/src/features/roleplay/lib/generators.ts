// src/features/roleplay/lib/generators.ts
/**
 * Roleplay chat turn. Validates the persona and message, sends the recent history with the
 * backend's fallbacks, and returns the in-character reply.
 */
import { ax } from "@ax-llm/ax";
import type { AiSettings } from "@/features/ai-settings/types";
import { createLlm } from "@/features/ai-settings/lib/llm";
import { LANGUAGE_MAX, MESSAGE_MAX, SEED_MAX, SYSTEM_PROMPT_MAX, ADDITIONAL_INSTRUCTIONS_MAX } from "../options";
import type { RoleplayTurnValues } from "../types";
import { formatHistory } from "./history";
import { normalizeReply } from "./normalize";
import { roleplayChatSignature } from "./signatures";
import { optionalText, requireText } from "./validate";

const TEMPERATURE = 0.7;

export async function sendRoleplayTurn(
  settings: AiSettings,
  values: RoleplayTurnValues,
  signal?: AbortSignal,
): Promise<string> {
  const llm = createLlm(settings);
  const systemPrompt = requireText(values.systemPrompt, "System prompt", SYSTEM_PROMPT_MAX);
  const language = requireText(values.language, "Language", LANGUAGE_MAX);
  const seed = requireText(values.seed, "Session seed", SEED_MAX);
  const message = requireText(values.message, "Message", MESSAGE_MAX);
  const additionalInstructions = optionalText(
    values.additionalInstructions,
    "Additional instructions",
    ADDITIONAL_INSTRUCTIONS_MAX,
  );

  if (signal?.aborted) throw new Error("Request cancelled.");
  const result = await ax(roleplayChatSignature).forward(
    llm,
    {
      roleplaySystemPrompt: systemPrompt,
      chatHistory: formatHistory(values.history),
      currentUserMessage: message,
      language,
      seedUuid: seed,
      additionalInstructions,
    },
    { modelConfig: { temperature: TEMPERATURE }, abortSignal: signal },
  );
  if (signal?.aborted) throw new Error("Request cancelled.");
  return normalizeReply(result);
}
