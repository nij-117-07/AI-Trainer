/**
 * Input checks for the Puzzle Generator. The topic limit matches the webui zod schema. The answer,
 * puzzle, and instruction limits are the app's own caps, since the backend sets none.
 */

export const TOPIC_MAX = 200;
export const CHOICE_MAX = 100;
export const USER_INSTRUCTIONS_MAX = 1000;
export const ANSWER_MAX = 2000;
export const PUZZLE_TEXT_MAX = 10000;

export function requireText(value: string, label: string, max: number): string {
  const trimmed = value.trim();
  if (!trimmed) throw new Error(`${label} is required.`);
  if (trimmed.length > max) throw new Error(`${label} must be ${max} characters or fewer.`);
  return trimmed;
}

export function optionalText(value: string, label: string, max: number): string | undefined {
  const trimmed = value.trim();
  if (trimmed.length > max) throw new Error(`${label} must be ${max} characters or fewer.`);
  return trimmed || undefined;
}
