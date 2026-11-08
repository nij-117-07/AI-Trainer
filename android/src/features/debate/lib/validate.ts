// src/features/debate/lib/validate.ts
/**
 * Input checks for the Debate Engine. Lengths match the webui zod schemas, and the influence list
 * is split the same way the webui splits it (on commas) before it reaches the model.
 */
import { LIMITS } from "../options";
import type { DebateSide, PersonaFormValues, PersonaInput } from "../types";

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

export function clampCount(value: number, min: number, max: number): number {
  const rounded = Math.round(Number.isFinite(value) ? value : min);
  return Math.min(max, Math.max(min, rounded));
}

export function parseInfluences(raw: string): string[] {
  return raw
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function buildPersonaInput(values: PersonaFormValues, side: DebateSide): PersonaInput {
  const influences = parseInfluences(requireText(values.influences, "Influences", LIMITS.influences));
  if (influences.length === 0) throw new Error("Influences must list at least one thinker or school.");
  return {
    archetype: requireText(values.archetype, "Archetype", LIMITS.archetype),
    style: requireText(values.style, "Speech style", LIMITS.style),
    intensity: clampCount(values.intensity, 1, 10),
    influences,
    topic: requireText(values.topic, "Debate topic", LIMITS.topic),
    side,
    customConstraints: optionalText(values.customConstraints, "Custom constraints", LIMITS.constraints),
  };
}
