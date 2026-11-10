// src/features/message-refiner/lib/generators.ts
/** Message Refiner generator. Validates the form, calls the model from the saved AI settings, and returns a normalised result. */
import { ax } from "@ax-llm/ax";
import type { AiSettings } from "@/features/ai-settings/types";
import { createLlm } from "@/features/ai-settings/lib/llm";
import type { MessageEditValues, MessageRefinerFormValues, MessageRefinerResult } from "../types";
import { messageEditSignature, messageRefinerSignature } from "./signatures";
import { toMessageRefinerResult } from "./normalise";
import { AUDIENCE_MAX, EDIT_INSTRUCTION_MAX, GOAL_MAX, MESSAGE_MAX, SUBJECT_MAX, optionalText, requireText } from "./validate";

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

/** Applies one edit instruction to the refined message the user may have already changed. */
export async function editRefinedMessage(settings: AiSettings, values: MessageEditValues): Promise<MessageRefinerResult> {
  const input = {
    message: requireText(values.message, "Message", MESSAGE_MAX),
    currentSubjectLine: optionalText(values.subjectLine, SUBJECT_MAX) ?? "None",
    instruction: requireText(values.instruction, "Edit instruction", EDIT_INSTRUCTION_MAX),
    tone: values.tone,
    audience: optionalText(values.audience, AUDIENCE_MAX) ?? "None",
    goal: optionalText(values.goal, GOAL_MAX) ?? "None",
  };
  const llm = createLlm(settings);
  const result = await ax(messageEditSignature).forward(llm, input, {
    modelConfig: { temperature: TEMPERATURE },
  });
  return toMessageRefinerResult(result);
}
