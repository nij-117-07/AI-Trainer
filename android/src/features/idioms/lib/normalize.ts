// src/features/idioms/lib/normalize.ts
/** Turns the raw model output into an IdiomLesson. Missing or non-text fields become empty strings. */
import type { IdiomLesson } from "../types";
import { textOf } from "./text";

type RawIdiomLesson = { [K in keyof IdiomLesson]?: unknown };

export function normalizeIdiomLesson(raw: RawIdiomLesson): IdiomLesson {
  return {
    rationale: textOf(raw.rationale),
    idiomInTargetLanguage: textOf(raw.idiomInTargetLanguage),
    phoneticPronunciation: textOf(raw.phoneticPronunciation),
    figurativeMeaning: textOf(raw.figurativeMeaning),
    culturalContext: textOf(raw.culturalContext),
    equivalentInNativeLanguage: textOf(raw.equivalentInNativeLanguage),
    dialogueScenario: textOf(raw.dialogueScenario),
    practicePrompt: textOf(raw.practicePrompt),
  };
}
