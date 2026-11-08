// src/features/guides/options.ts
/**
 * Dropdown presets for the Learning Guides forms. Values match the webui options and the backend
 * enums, so these fields do not accept custom text.
 */

export interface GuideChoice {
  value: string;
  label: string;
}

export const CURRENT_LEVEL_OPTIONS: GuideChoice[] = [
  { value: "Beginner", label: "Beginner" },
  { value: "Intermediate", label: "Intermediate" },
  { value: "Advanced", label: "Advanced" },
  { value: "Professional", label: "Professional" },
  { value: "Expert", label: "Expert" },
];

export const DAILY_PLAN_LEVEL_OPTIONS: GuideChoice[] = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
];

export const TARGET_MASTERY_OPTIONS: GuideChoice[] = [
  { value: "familiarity", label: "Familiarity" },
  { value: "competency", label: "Competency" },
  { value: "expert-level troubleshooting", label: "Expert-Level Troubleshooting" },
  { value: "architectural-design", label: "Architectural Design" },
];

export const LEARNING_FOCUS_OPTIONS: GuideChoice[] = [
  { value: "practical", label: "Practical" },
  { value: "debugging", label: "Debugging" },
  { value: "theoretical", label: "Theoretical" },
  { value: "project-based", label: "Project-Based" },
];

export const TOPIC_LEVEL_OPTIONS: GuideChoice[] = [
  { value: "Beginner", label: "Beginner" },
  { value: "Intermediate", label: "Intermediate" },
  { value: "Advanced", label: "Advanced" },
];

export const CURRENT_LEVELS = ["Beginner", "Intermediate", "Advanced", "Professional", "Expert"] as const;
export const DAILY_PLAN_LEVELS = ["beginner", "intermediate", "advanced"] as const;
export const TARGET_MASTERY_LEVELS = [
  "familiarity",
  "competency",
  "expert-level troubleshooting",
  "architectural-design",
] as const;
export const LEARNING_FOCUSES = ["practical", "debugging", "theoretical", "project-based"] as const;
export const TOPIC_LEVELS = ["Beginner", "Intermediate", "Advanced"] as const;
