// src/features/roleplay/lib/text.ts
/**
 * Readers for values loaded from the device or returned by the model. Anything missing or of the
 * wrong type becomes an empty value instead of a crash.
 */

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function listOf(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

export function textOf(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

/** The first line of a persona prompt, shown as a one-line scenario. */
export function scenarioOf(prompt: string): string {
  return prompt.trim().split("\n")[0]?.trim() ?? "";
}
