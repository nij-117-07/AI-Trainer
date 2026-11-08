// src/features/debate/options.ts
/** Dropdown presets, chip choices, and input limits for the Debate Engine. */
import { STANCE_VALUES, STRATEGY_VALUES, type DebateSide, type TurnMode, type TurnStrategy } from "./types";

export interface DebateChoice<T extends string> {
  value: T;
  label: string;
}

export const SIDE_CHOICES: DebateChoice<DebateSide>[] = [
  { value: "pro", label: "Pro" },
  { value: "con", label: "Con" },
];

export const MODE_CHOICES: DebateChoice<TurnMode>[] = [
  { value: "type", label: "Type it myself" },
  { value: "ai", label: "Generate with AI" },
];

export const STRATEGY_OPTIONS: DebateChoice<TurnStrategy>[] = STRATEGY_VALUES.map((value) => ({
  value,
  label: value[0].toUpperCase() + value.slice(1),
}));

export const STANCE_OPTIONS: DebateChoice<string>[] = STANCE_VALUES.map((value) => ({
  value,
  label: value[0].toUpperCase() + value.slice(1),
}));

export const LIMITS = {
  archetype: 300,
  style: 300,
  influences: 500,
  topic: 300,
  constraints: 500,
  statement: 2000,
  evidence: 2000,
  direction: 1000,
} as const;

export const DEFAULT_INSTRUCTIONS = "Keep the spoken argument concise.";
