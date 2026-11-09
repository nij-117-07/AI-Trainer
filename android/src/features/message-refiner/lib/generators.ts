// src/features/message-refiner/lib/generators.ts
/** Message Refiner generator. Validates the form, calls the model from the saved AI settings, and returns a normalised result. */
import { ax } from "@ax-llm/ax";
import type { AiSettings } from "@/features/ai-settings/types";
import { createLlm } from "@/features/ai-settings/lib/llm";
import type { MessageRefinerFormValues, MessageRefinerResult } from "../types";
import { messageRefinerSignature } from "./signatures";
import { toMessageRefinerResult } from "./normalise";
import { AUDIENCE_MAX, GOAL_MAX, MESSAGE_MAX, optionalText, requireText } from "./validate";

const TEMPERATURE = 0.5;

export async function refineMessage(settings: AiSettings, values: MessageRefinerFormValues): Promise<MessageRefinerResult> {
  const input = {
    message: requireText(values.message, "Message", MESSAGE_MAX),
    tone: values.tone,
    audience: optionalText(values.audience, AUDIENCE_MAX) ?? "None",
    goal: optionalText(values.goal, GOAL_MAX) ?? "None",
  };
  const llm = createLlm(settings);
  const result = await ax(messageRefinerSignature).forward(llm, input, {
    modelConfig: { temperature: TEMPERATURE },
  });
  return toMessageRefinerResult(result);
}
