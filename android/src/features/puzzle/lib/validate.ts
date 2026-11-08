// src/features/puzzle/lib/validate.ts
/**
 * Input checks for the Puzzle Generator. The topic limit matches the webui zod schema. The answer
 * and puzzle limits are the app's own caps, since the backend sets none.
 */
import { PUZZLE_TYPES, COGNITIVE_DOMAINS, DIFFICULTY_LEVELS, type CognitiveDomain, type DifficultyLevel, type PuzzleType } from "../types";

export const TOPIC_MAX = 200;
export const ANSWER_MAX = 2000;
export const PUZZLE_TEXT_MAX = 10000;

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

export function requirePuzzleType(value: string): PuzzleType {
  return requireOption(value, PUZZLE_TYPES, "Puzzle type");
}

export function requireCognitiveDomain(value: string): CognitiveDomain {
  return requireOption(value, COGNITIVE_DOMAINS, "Cognitive domain");
}

export function requireDifficulty(value: string): DifficultyLevel {
  return requireOption(value, DIFFICULTY_LEVELS, "Difficulty");
}
