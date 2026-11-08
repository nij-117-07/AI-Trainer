// src/features/language-tester/lib/validate.ts
/**
 * Input checks for the Language Tester forms. Lengths and option sets match the webui zod
 * schemas, so a request is rejected here before it reaches the model.
 */

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

/** A typed seed, or a fresh one when the field is blank, as the webui does. */
export function seedOrFresh(value: string, prefix: string): string {
  return optionalText(value, "Seed", 200) ?? `${prefix}_${Date.now()}`;
}

export function requireOption<T extends string>(value: string, options: readonly T[], label: string): T {
  const match = options.find((option) => option === value);
  if (!match) throw new Error(`${label} must be one of: ${options.join(", ")}.`);
  return match;
}

export function clampCount(value: number, min: number, max: number): number {
  const rounded = Math.round(Number.isFinite(value) ? value : min);
  return Math.min(max, Math.max(min, rounded));
}

export function throwIfAborted(signal?: AbortSignal): void {
  if (signal?.aborted) throw new Error("Request cancelled.");
}
