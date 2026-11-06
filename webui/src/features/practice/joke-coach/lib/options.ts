// src/features/practice/joke-coach/lib/options.ts
/**
 * Form options for the Joke Coach.
 */
import type { FieldOption } from "@/features/learning/explainer/components/fields";

export const jokeStyleOptions: FieldOption[] = [
  { value: "dad-joke", label: "Dad joke" },
  { value: "pun", label: "Pun" },
  { value: "one-liner", label: "One-liner" },
  { value: "story", label: "Story" },
  { value: "observational", label: "Observational" },
];

export const improvementGoalOptions: FieldOption[] = [
  { value: "funnier", label: "Funnier" },
  { value: "cleaner", label: "Cleaner" },
  { value: "shorter", label: "Shorter" },
  { value: "more-clever", label: "More clever" },
  { value: "better-timing", label: "Better timing" },
];

export const skillLevelOptions: FieldOption[] = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
];

export const practiceFocusOptions: FieldOption[] = [
  { value: "writing", label: "Writing" },
  { value: "delivery", label: "Delivery" },
  { value: "timing", label: "Timing" },
  { value: "crowd-work", label: "Crowd work" },
  { value: "stage-presence", label: "Stage presence" },
  { value: "all", label: "Everything" },
];

export const venueTypeOptions: FieldOption[] = [
  { value: "comedy-club", label: "Comedy club" },
  { value: "open-mic", label: "Open mic" },
  { value: "corporate-event", label: "Corporate event" },
  { value: "family-gathering", label: "Family gathering" },
  { value: "college-show", label: "College show" },
];
