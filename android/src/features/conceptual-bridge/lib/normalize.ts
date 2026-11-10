// src/features/conceptual-bridge/lib/normalize.ts
/**
 * Turns model output and stored JSON into typed bridge values. Missing or malformed fields fall
 * back to safe defaults, so the screen never reads a field the model left out.
 */
import type { BridgeResult } from "../types";

const DEFAULT_SCORE = 3;
const MIN_SCORE = 1;
const MAX_SCORE = 5;

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function textOf(value: unknown): string {
  return typeof value === "string" ? value : "";
}

/** Truncates to a whole number and clamps to 1-5. Blank or non-numeric values use the default. */
export function clampCognitiveScore(value: unknown): number {
  if (value === null || value === undefined || value === "") return DEFAULT_SCORE;
  const parsed = Math.trunc(Number(value));
  if (!Number.isFinite(parsed)) return DEFAULT_SCORE;
  return Math.min(MAX_SCORE, Math.max(MIN_SCORE, parsed));
}

export function normalizeBridge(raw: unknown): BridgeResult {
  const source = isRecord(raw) ? raw : {};
  return {
    structuralAnalogy: textOf(source.structuralAnalogy),
    bridgingNarrative: textOf(source.bridgingNarrative),
    insightQuestion: textOf(source.insightQuestion),
    cognitiveFlexibilityScore: clampCognitiveScore(source.cognitiveFlexibilityScore),
  };
}
