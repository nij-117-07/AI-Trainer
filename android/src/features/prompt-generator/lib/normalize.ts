// src/features/prompt-generator/lib/normalize.ts
/** Turns raw model output into the typed persona result the screen renders. */
import type { PersonaResult } from "../types";
import { textOf } from "./text";

export function normalizePersona(
  raw: { personaName?: unknown; generatedPersonaSystemPrompt?: unknown },
  seedUsed: string,
): PersonaResult {
  return {
    personaName: textOf(raw.personaName),
    systemPrompt: textOf(raw.generatedPersonaSystemPrompt),
    seedUsed,
  };
}
