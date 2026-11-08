// src/features/tutor-chat/lib/generators.ts
/**
 * Tutor chat turn generator. Validates the topic, context, and question, sends the history the
 * way the backend does, and returns the reply with its concept breakdown. Model output is
 * checked field by field, so a missing value cannot crash the chat.
 */
import { ax } from "@ax-llm/ax";
import type { AiSettings } from "@/features/ai-settings/types";
import { createLlm } from "@/features/ai-settings/lib/llm";
import { tutorTurnSignature } from "./signatures";
import {
  formatHistory,
  isPresent,
  listOf,
  normaliseConcept,
  requireUserInput,
  textOf,
  validateSettings,
} from "./session-model";
import type { TutorTurnResult, TutorTurnValues } from "./types";

const TEMPERATURE = 0.4;

export async function runTutorTurn(
  settings: AiSettings,
  values: TutorTurnValues,
  signal: AbortSignal,
): Promise<TutorTurnResult> {
  const { masterTopic, additionalContext } = validateSettings(values);
  const userInput = requireUserInput(values.userInput);
  const llm = createLlm(settings);
  const result = await ax(tutorTurnSignature).forward(
    llm,
    {
      masterTopic,
      additionalContext: additionalContext || undefined,
      chatHistory: formatHistory(values.chatHistory),
      userInput,
    },
    { abortSignal: signal, modelConfig: { temperature: TEMPERATURE } },
  );
  return {
    tutorResponse: textOf(result.tutorResponse),
    educationalBreakdown: listOf(result.educationalBreakdown).map(normaliseConcept).filter(isPresent),
  };
}
