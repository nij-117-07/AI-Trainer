// src/features/joke-coach/lib/validate.ts
/**
 * Input checks for the Joke Lab forms. Lengths match the webui zod schemas, so a request is
 * rejected here before it reaches the model.
 */

export const LANGUAGE_MAX = 60;
export const THEME_MAX = 200;
export const JOKE_MAX = 5000;
export const SCENARIO_TEXT_MAX = 1000;

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

export function requireOption<T extends string>(value: string, options: readonly T[], label: string): T {
  const match = options.find((option) => option === value);
  if (!match) throw new Error(`${label} must be one of: ${options.join(", ")}.`);
  return match;
}

export function throwIfAborted(signal: AbortSignal): void {
  if (signal.aborted) throw new Error("Generation was cancelled.");
}
