// src/features/guess-game/lib/validate.ts
/** Input checks for the Guess Game. Lengths match the webui zod schemas before a request is sent. */
import { CUSTOM_CATEGORY_MAX_LENGTH } from "../options";
import { GAME_CATEGORIES, OTHER_CATEGORY, type GameSetupFormValues } from "../types";

/** The category name sent to the model: a preset, or the custom text when "Other" is picked. */
export function resolveCategory(values: Pick<GameSetupFormValues, "category" | "customCategory">): string {
  if (values.category === OTHER_CATEGORY) {
    return requireText(values.customCategory, "Custom category", CUSTOM_CATEGORY_MAX_LENGTH);
  }
  return requireOption(values.category, GAME_CATEGORIES, "Category");
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
