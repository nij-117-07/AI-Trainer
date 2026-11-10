// src/features/ai-detector/lib/analysis.ts
/**
 * Colour bands and labels for the AI Detector result. These mirror the webui thresholds in
 * components/results/ScoreBar.tsx and types/index.ts.
 */
import type { Tone } from "@/theme";
import type { Verdict } from "../types";

export function formatScore(score: number): string {
  return `${Math.round(score * 100)}% AI`;
}

/** Colour for AI likelihood: high is bad. */
export function riskTone(score: number): Tone {
  if (score >= 0.7) return "rose";
  if (score >= 0.4) return "amber";
  return "emerald";
}

export function verdictTone(verdict: Verdict): Tone {
  if (verdict === "Likely AI") return "rose";
  if (verdict === "Likely Human") return "emerald";
  return "amber";
}
