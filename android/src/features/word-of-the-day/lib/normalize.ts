// src/features/word-of-the-day/lib/normalize.ts
/** Turns the raw model output into a WordOfTheDay. Missing or wrongly typed fields become empty values. */
import type { WordOfTheDay } from "../types";
import { textList, textOf } from "./text";

type RawWordOfTheDay = { [K in keyof WordOfTheDay]?: unknown };

export function normalizeWordOfTheDay(raw: RawWordOfTheDay): WordOfTheDay {
  return {
    chosenWord: textOf(raw.chosenWord),
    nativeTranslation: textOf(raw.nativeTranslation),
    phoneticAndAudioGuide: textOf(raw.phoneticAndAudioGuide),
    morphologyBreakdown: textOf(raw.morphologyBreakdown),
    primaryDefinition: textOf(raw.primaryDefinition),
    theVibeCheck: textOf(raw.theVibeCheck),
    historicalEvolution: textOf(raw.historicalEvolution),
    modernUsageSentence: textOf(raw.modernUsageSentence),
    synonymWeb: textList(raw.synonymWeb),
  };
}
