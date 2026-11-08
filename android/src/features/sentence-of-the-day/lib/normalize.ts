// src/features/sentence-of-the-day/lib/normalize.ts
/** Turns the raw Ax sentence output into the typed SentenceOfTheDay the screen renders. */
import type { SentenceOfTheDay } from "../types";
import { textList, textOf } from "./text";

export function normalizeSentence(
  raw: {
    targetSentence?: unknown;
    literalTranslation?: unknown;
    naturalTranslation?: unknown;
    grammaticalHighlight?: unknown;
    culturalContext?: unknown;
    substitutionOptions?: unknown;
  },
  date: string,
): SentenceOfTheDay {
  return {
    date,
    targetSentence: textOf(raw.targetSentence),
    literalTranslation: textOf(raw.literalTranslation),
    naturalTranslation: textOf(raw.naturalTranslation),
    grammaticalHighlight: textOf(raw.grammaticalHighlight),
    culturalContext: textOf(raw.culturalContext),
    substitutionOptions: textList(raw.substitutionOptions),
  };
}
