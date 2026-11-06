// src/features/practice/testing-portal/lib/pastQuestions.ts
/**
 * Helper to normalize a free-form "past questions" textarea block into the
 * `array[string]` shape expected by the Testing Portal API
 * (Backend/practice/testing_portal/api.md).
 */
export function splitPastQuestions(value: string): string[] {
  return value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}
