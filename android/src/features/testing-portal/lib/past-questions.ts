// src/features/testing-portal/lib/past-questions.ts
/** How many recent questions are sent as past questions. The webui backend defaults to 5. */
export const PAST_QUESTIONS_LIMIT = 10;

/** Splits the "past questions" text block into the most recent entries, one per line. */
export function recentPastQuestions(value: string): string[] {
  return value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .slice(-PAST_QUESTIONS_LIMIT);
}
