// src/features/resource-suggestor/lib/validate.ts
/** Input checks for the Resource Suggestor. Limits follow the webui schema. */

export const SUBJECT_MAX = 500;
export const PREFERENCES_MAX = 1000;
export const NO_PREFERENCES = "No specific preferences provided.";

export function requireText(value: string, label: string, max: number): string {
  const trimmed = value.trim();
  if (!trimmed) throw new Error(`${label} is required.`);
  if (trimmed.length > max) throw new Error(`${label} must be ${max} characters or fewer.`);
  return trimmed;
}

export function preferencesOrDefault(value: string): string {
  const trimmed = value.trim().slice(0, PREFERENCES_MAX);
  return trimmed || NO_PREFERENCES;
}
