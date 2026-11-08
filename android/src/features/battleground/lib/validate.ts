// src/features/battleground/lib/validate.ts
/**
 * Input checks for the Battleground Simulator. Lengths and difficulty values match the webui zod
 * schemas, so a request is rejected here before it reaches the model.
 */
import { BATTLE_DIFFICULTIES, type BattleDifficulty } from "../types";

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

export function requireDifficulty(value: string): BattleDifficulty {
  const match = BATTLE_DIFFICULTIES.find((item) => item === value);
  if (!match) throw new Error(`Difficulty must be one of: ${BATTLE_DIFFICULTIES.join(", ")}.`);
  return match;
}

export function requireMove(value: string): string {
  return requireText(value, "Your move", 2000);
}
