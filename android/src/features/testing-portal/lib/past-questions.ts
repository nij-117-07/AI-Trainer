// src/features/testing-portal/lib/past-questions.ts
/** Matches PAST_QUESTIONS_LIMIT in Backend/core/config.py. */
export const PAST_QUESTIONS_LIMIT = 5;

/** Splits the "past questions" text block into the most recent entries, one per line. */
export function recentPastQuestions(value: string): string[] {
  return value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .slice(-PAST_QUESTIONS_LIMIT);
}
