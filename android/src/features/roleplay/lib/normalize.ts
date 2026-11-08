// src/features/roleplay/lib/normalize.ts
/** Reads the in-character reply from the model output. A missing reply is an error, not an empty bubble. */
import { isRecord, textOf } from "./text";

export function normalizeReply(raw: unknown): string {
  const reply = isRecord(raw) ? textOf(raw.responseMessage) : "";
  if (!reply) throw new Error("The persona did not reply. Please try again.");
  return reply;
}
