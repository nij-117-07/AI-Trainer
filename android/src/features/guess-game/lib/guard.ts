// src/features/guess-game/lib/guard.ts
/** Type guard for plain JSON objects read back from device storage. */

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
