// src/features/roleplay/lib/normalize.ts
/** Reads the in-character reply from the model output. A missing reply is an error, not an empty bubble. */
import { SYSTEM_PROMPT_MAX } from "../options";
import { isRecord, textOf } from "./text";

export function normalizeReply(raw: unknown): string {
  const reply = isRecord(raw) ? textOf(raw.responseMessage) : "";
  if (!reply) throw new Error("The persona did not reply. Please try again.");
  return reply;
}

/** Reads the written system prompt, capped to the field limit so it always fits the persona form. */
export function normalizeSystemPrompt(raw: unknown): string {
  const prompt = isRecord(raw) ? textOf(raw.systemPrompt) : "";
  if (!prompt) throw new Error("The assistant did not write a prompt. Please try again.");
  return prompt.slice(0, SYSTEM_PROMPT_MAX).trim();
}
