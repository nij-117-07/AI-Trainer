// src/features/confidence-builder/options.ts
/** Choices for the Confidence Builder. Each value is sent to the model as written. */
import type { ComfortLevel, ConfidenceFocus, Rating } from "./types";

export interface ChoiceItem<T extends string | number = string> {
  value: T;
  label: string;
}

export const focusOptions: ChoiceItem<ConfidenceFocus>[] = [
  { value: "speak-up", label: "Speaking up" },
  { value: "ask", label: "Asking for help" },
  { value: "share", label: "Sharing ideas" },
  { value: "decide", label: "Deciding" },
  { value: "everyday", label: "Everyday talk" },
];

export const comfortOptions: ChoiceItem<ComfortLevel>[] = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
];

export const ratingOptions: ChoiceItem<Rating>[] = [
  { value: 1, label: "1" },
  { value: 2, label: "2" },
  { value: 3, label: "3" },
  { value: 4, label: "4" },
  { value: 5, label: "5" },
];
