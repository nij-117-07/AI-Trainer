// src/features/battleground/options.ts
/**
 * Form defaults and dropdown options for the Battleground Simulator. Values match the webui
 * options and the backend difficulty values.
 */
import type { BattleFormValues } from "./types";

export interface BattleChoice {
  value: string;
  label: string;
}

export const DIFFICULTY_OPTIONS: BattleChoice[] = [
  { value: "easy", label: "Easy" },
  { value: "medium", label: "Medium" },
  { value: "hard", label: "Hard" },
];

export const BATTLE_FORM_DEFAULTS: BattleFormValues = {
  name: "Commander",
  expertise: "cybersecurity",
  preferredStyle: "defensive",
  background: "10 years as a SOC analyst",
  topic: "Cybersecurity Ransomware Attack",
  difficulty: "medium",
};
