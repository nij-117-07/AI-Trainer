// src/features/guess-game/lib/validate.ts
/** Input checks for the Guess Game. Lengths match the webui zod schemas before a request is sent. */
import { CATEGORY_MAX_LENGTH } from "../options";
import type { GameSetupFormValues } from "../types";

/** The category sent to the model: a preset, or the custom text the user typed. */
export function resolveCategory(values: Pick<GameSetupFormValues, "category">): string {
  return requireText(values.category, "Category", CATEGORY_MAX_LENGTH);
}

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
