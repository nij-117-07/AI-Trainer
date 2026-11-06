// src/features/practice/testing-portal/lib/options.ts
/**
 * Form options for the Testing Portal question generators.
 */
import type { FieldOption } from "@/features/learning/explainer/components/fields";

export const mcqQuestionTypeOptions: FieldOption[] = [
  { value: "academic", label: "Academic" },
  { value: "practical", label: "Practical" },
  { value: "scenario-based", label: "Scenario-based" },
  { value: "conceptual", label: "Conceptual" },
  { value: "recall", label: "Recall" },
];

export const mcqDifficultyLevelOptions: FieldOption[] = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
  { value: "expert", label: "Expert" },
];

export const theoreticalQuestionTypeOptions: FieldOption[] = [
  { value: "academic", label: "Academic" },
  { value: "practical", label: "Practical" },
  { value: "case-study", label: "Case Study" },
  { value: "philosophical", label: "Philosophical" },
  { value: "architectural", label: "Architectural" },
];

export const theoreticalDifficultyLevelOptions: FieldOption[] = [
  { value: "basic", label: "Basic" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
  { value: "architectural", label: "Architectural" },
];

export const difficultyOptions: FieldOption[] = [
  { value: "Beginner", label: "Beginner" },
  { value: "Intermediate", label: "Intermediate" },
  { value: "Advanced", label: "Advanced" },
  { value: "Expert", label: "Expert" },
];

export const responseFormatOptions: FieldOption[] = [
  { value: "bullet_points", label: "Bullet Points" },
  { value: "paragraph", label: "Paragraph" },
  { value: "step_by_step", label: "Step-by-Step" },
  { value: "technical_whitepaper", label: "Technical Whitepaper" },
];
