// src/features/learning/guides/lib/options.ts
/**
 * Label/value option sets for the Guides dropdown fields. Values mirror the
 * enums in the backend API contract (Backend/learning/guides/api.md).
 */
import type { FieldOption } from "@/features/learning/explainer/components/fields";

export const currentLevelOptions: FieldOption[] = [
  { value: "Beginner", label: "Beginner" },
  { value: "Intermediate", label: "Intermediate" },
  { value: "Advanced", label: "Advanced" },
  { value: "Professional", label: "Professional" },
  { value: "Expert", label: "Expert" },
];

export const dailyPlanLevelOptions: FieldOption[] = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
];

export const targetMasteryOptions: FieldOption[] = [
  { value: "familiarity", label: "Familiarity" },
  { value: "competency", label: "Competency" },
  { value: "expert-level troubleshooting", label: "Expert-Level Troubleshooting" },
  { value: "architectural-design", label: "Architectural Design" },
];

export const learningFocusOptions: FieldOption[] = [
  { value: "practical", label: "Practical" },
  { value: "debugging", label: "Debugging" },
  { value: "theoretical", label: "Theoretical" },
  { value: "project-based", label: "Project-Based" },
];

export const topicLevelOptions: FieldOption[] = [
  { value: "Beginner", label: "Beginner" },
  { value: "Intermediate", label: "Intermediate" },
  { value: "Advanced", label: "Advanced" },
];
