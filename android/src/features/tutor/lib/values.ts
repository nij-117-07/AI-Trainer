// src/features/tutor/lib/values.ts
/**
 * Guards for user input and model output. Model fields can be missing or the wrong type, so
 * every model string is read through textOf before it reaches the screen.
 */

export function requireText(value: string, label: string, max: number, min = 1): string {
  const trimmed = value.trim();
  if (!trimmed) throw new Error(`${label} is required.`);
  if (trimmed.length < min) throw new Error(`${label} must be at least ${min} characters.`);
  if (trimmed.length > max) throw new Error(`${label} must be ${max} characters or fewer.`);
  return trimmed;
}

export function optionalText(value: string | undefined, label: string, max: number): string | undefined {
  const trimmed = (value ?? "").trim();
  if (trimmed.length > max) throw new Error(`${label} must be ${max} characters or fewer.`);
  return trimmed || undefined;
}

export function textOf(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function messageOf(error: unknown, fallback = "Something went wrong. Please try again."): string {
  return error instanceof Error && error.message ? error.message : fallback;
}
