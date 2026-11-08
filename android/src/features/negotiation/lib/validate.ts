// src/features/negotiation/lib/validate.ts
/**
 * Input checks for Negotiation Practice. Lengths match the webui zod schemas where they set one;
 * the transcript and outcome limits keep one request within a sensible size.
 */

export const DOMAIN_MAX = 200;
export const MESSAGE_MAX = 2000;
export const OUTCOME_MAX = 500;

export function requireText(value: string, label: string, max: number): string {
  const trimmed = value.trim();
  if (!trimmed) throw new Error(`${label} is required.`);
  if (trimmed.length > max) throw new Error(`${label} must be ${max} characters or fewer.`);
  return trimmed;
}

export function requireOption<T extends string>(value: string, options: readonly T[], label: string): T {
  const match = options.find((option) => option === value);
  if (!match) throw new Error(`${label} must be one of: ${options.join(", ")}.`);
  return match;
}

export function throwIfAborted(signal: AbortSignal): void {
  if (signal.aborted) throw new Error("Negotiation request was cancelled.");
}
