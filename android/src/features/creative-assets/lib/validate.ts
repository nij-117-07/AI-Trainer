// src/features/creative-assets/lib/validate.ts
/**
 * Input checks for the Creative Assets form. Lengths and options match the webui zod schema, so
 * a request is rejected here before it reaches the model.
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

/** Newline-separated list input. Returns undefined when empty so the optional field is omitted. */
export function optionalLines(value: string, label: string, max: number): string | undefined {
  const trimmed = value.trim();
  if (trimmed.length > max) throw new Error(`${label} must be ${max} characters or fewer.`);
  const lines = splitLines(trimmed);
  return lines.length > 0 ? lines.join("\n") : undefined;
}

export function splitLines(value: string): string[] {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
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

export function throwIfAborted(signal: AbortSignal): void {
  if (signal.aborted) throw new Error("Generation was cancelled.");
}
