// src/features/roadmap/lib/validation.ts
/**
 * Input limits and text checks for the roadmap. Limits follow the explainer's conventions; the
 * backend schemas set no maximum, so these keep prompts a sensible size.
 */
import type { RoadmapMode } from "../types";

export const ROADMAP_LIMITS = {
  subject: 200,
  level: 100,
  personaStyle: 100,
  instructions: 1000,
  title: 300,
  milestone: 500,
  persona: 20000,
} as const;

/** Trims and caps text. Empty input returns an empty string. */
export function cleanText(value: string, max: number): string {
  return value.trim().slice(0, max);
}

export function requireText(value: string, label: string, max: number): string {
  const trimmed = value.trim();
  if (!trimmed) throw new Error(`${label} is required.`);
  if (trimmed.length > max) throw new Error(`${label} must be ${max} characters or fewer.`);
  return trimmed;
}

export function optionalText(value: string, max: number): string | undefined {
  return cleanText(value, max) || undefined;
}

export function normalizeMode(value: unknown): RoadmapMode {
  return value === "short" ? "short" : "detailed";
}
