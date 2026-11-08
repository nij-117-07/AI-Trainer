// src/features/lesson/lib/normalize.ts
/**
 * Turns the raw Ax lesson output into the typed Lesson the screen renders. Every list is checked,
 * every vocabulary item is read field by field, and empty entries are dropped.
 */
import type { Lesson, VocabularyEntry } from "../types";
import { isRecord, listOf, textList, textOf } from "./text";

export function normalizeLesson(raw: {
  lessonHeader?: unknown;
  comparativeAnalysis?: unknown;
  conceptDeepDive?: unknown;
  thematicVocabulary?: unknown;
  practiceSuite?: unknown;
  culturalNuance?: unknown;
  homeworkMission?: unknown;
}): Lesson {
  const vocabulary: VocabularyEntry[] = listOf(raw.thematicVocabulary)
    .filter(isRecord)
    .map((item) => ({
      word: textOf(item.word),
      ipa: textOf(item.ipa),
      translation: textOf(item.translation),
      example: textOf(item.example),
    }))
    .filter((entry) => entry.word !== "");
  return {
    header: textOf(raw.lessonHeader),
    comparativeAnalysis: textOf(raw.comparativeAnalysis),
    deepDive: textOf(raw.conceptDeepDive),
    vocabulary,
    practice: textList(raw.practiceSuite),
    nuance: textOf(raw.culturalNuance),
    homework: textOf(raw.homeworkMission),
  };
}
