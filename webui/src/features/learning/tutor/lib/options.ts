// src/features/learning/tutor/lib/options.ts
/**
 * Form option lists for the Adaptive Tutor tool. Learning style presets are
 * derived from the canonical list in the types module so they never drift.
 */
import { learningStyles } from "../types";
import type { FieldOption } from "@/features/learning/explainer/components/fields";

const TITLE_CASE = (value: string) =>
  value
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

export const learningStyleOptions: FieldOption[] = learningStyles.map((value) => ({
  value,
  label: TITLE_CASE(value),
}));
