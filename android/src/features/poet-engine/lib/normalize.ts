// src/features/poet-engine/lib/normalize.ts
/** Turns the raw model output into the ConceptResult the screen renders. Missing fields become empty text. */
import type { ConceptResult } from "../types";
import { textOf } from "./text";

export function normalizeConcept(
  raw: Partial<Record<keyof ConceptResult, unknown>>,
): ConceptResult {
  return {
    etymologicalSoul: textOf(raw.etymologicalSoul),
    originalPoetry: textOf(raw.originalPoetry),
    soulfulTranslation: textOf(raw.soulfulTranslation),
    philosophicalReflection: textOf(raw.philosophicalReflection),
    visualMetaphor: textOf(raw.visualMetaphor),
  };
}
