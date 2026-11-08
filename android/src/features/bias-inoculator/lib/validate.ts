// src/features/bias-inoculator/lib/validate.ts
/**
 * Input checks for the Cognitive Bias Inoculator. The field length matches the webui zod schema,
 * and the bias must be one of the backend values. "random" is resolved here, as the webui does
 * by omitting target_bias.
 */
import { TARGET_BIASES, type TargetBias } from "../types";

export function requireText(value: string, label: string, max: number): string {
  const trimmed = value.trim();
  if (!trimmed) throw new Error(`${label} is required.`);
  if (trimmed.length > max) throw new Error(`${label} must be ${max} characters or fewer.`);
  return trimmed;
}

export function resolveTargetBias(value: string, random: () => number = Math.random): TargetBias {
  if (value === "random") return TARGET_BIASES[Math.floor(random() * TARGET_BIASES.length)];
  const match = TARGET_BIASES.find((bias) => bias === value);
  if (!match) throw new Error(`Target bias must be random or one of: ${TARGET_BIASES.join(", ")}.`);
  return match;
}
