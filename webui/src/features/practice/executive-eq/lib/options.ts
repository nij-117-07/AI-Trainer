// src/features/practice/executive-eq/lib/options.ts
/**
 * Form options for the Executive EQ Trainer.
 */
import type { FieldOption } from "@/features/learning/explainer/components/fields";

export const learningFocusOptions: FieldOption[] = [
  { value: "diplomatic_refusal", label: "Diplomatic refusal" },
  { value: "assertive_silence", label: "Assertive silence" },
  { value: "implied_authority", label: "Implied authority" },
  { value: "strategic_ambiguity", label: "Strategic ambiguity" },
];

export const difficultyOptions: FieldOption[] = [
  { value: "Rising Star", label: "Rising Star" },
  { value: "Seasoned Exec", label: "Seasoned Exec" },
  { value: "Ruthless Board", label: "Ruthless Board" },
  { value: "Crisis Mode", label: "Crisis Mode" },
];
