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

export const TOPIC_LEVEL_OPTIONS: GuideChoice[] = [
  { value: "Beginner", label: "Beginner" },
  { value: "Intermediate", label: "Intermediate" },
  { value: "Advanced", label: "Advanced" },
];

export const CURRENT_LEVELS = ["Beginner", "Intermediate", "Advanced", "Professional", "Expert"] as const;
export const TOPIC_LEVELS = ["Beginner", "Intermediate", "Advanced"] as const;
