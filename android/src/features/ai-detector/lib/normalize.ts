// src/features/ai-detector/lib/normalize.ts
/**
 * Turns raw model output into the typed results the screens render. Lists and strings are read
 * defensively. A missing score or rewrite is reported as an error, since the screen cannot use it.
 */
import type { AiDetection, HumanizedText, Verdict } from "../types";
import { VERDICTS } from "../types";

export interface DetectionRaw {
  aiScore?: unknown;
  verdict?: unknown;
  reason?: unknown;
  flaggedPatterns?: unknown;
  suggestedChanges?: unknown;
}

export interface HumanizeRaw {
  humanizedText?: unknown;
  changesMade?: unknown;
  confidence?: unknown;
}

export function listOf(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

export function textOf(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export function textList(value: unknown): string[] {
  if (typeof value === "string") return value.split("\n").map((line) => line.trim()).filter(Boolean);
  return listOf(value).map(textOf).filter(Boolean);
}

/** Reads a 0–1 probability. A 0–100 percentage from the model is scaled down. */
export function unitOf(value: unknown): number | null {
  const parsed = typeof value === "string" ? Number(value) : value;
  if (typeof parsed !== "number" || !Number.isFinite(parsed)) return null;
  const scaled = parsed > 1 && parsed <= 100 ? parsed / 100 : parsed;
  return Math.min(1, Math.max(0, scaled));
}

export function verdictFromScore(score: number): Verdict {
  if (score >= 0.7) return "Likely AI";
  if (score <= 0.3) return "Likely Human";
  return "Mixed";
}

function isVerdict(value: unknown): value is Verdict {
  return typeof value === "string" && (VERDICTS as readonly string[]).includes(value);
}

export function normalizeDetection(raw: DetectionRaw): AiDetection {
  const aiScore = unitOf(raw.aiScore);
  if (aiScore === null) throw new Error("The model did not return an AI score. Please try again.");
  return {
    aiScore,
    verdict: isVerdict(raw.verdict) ? raw.verdict : verdictFromScore(aiScore),
    reason: textOf(raw.reason),
    flaggedPatterns: textList(raw.flaggedPatterns),
    suggestedChanges: textList(raw.suggestedChanges),
  };
}

export function normalizeHumanized(raw: HumanizeRaw): HumanizedText {
  const humanizedText = textOf(raw.humanizedText);
  if (!humanizedText) throw new Error("The model returned no rewritten text. Please try again.");
  const confidence = unitOf(raw.confidence);
  if (confidence === null) throw new Error("The model did not return a confidence score. Please try again.");
  return {
    humanizedText,
    changesMade: textList(raw.changesMade),
    confidence,
  };
}
