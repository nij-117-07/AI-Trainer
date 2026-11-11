// src/features/topic-of-the-day/options.ts
/** Dropdown presets, input limits, and starting values for the Topic of the Day screens. */
import type { SelectOption } from "@/components/tool/SelectField";
import type { TopicOfTheDayFormValues } from "./types";

export const LEVEL_OPTIONS: SelectOption[] = [
  { value: "Beginner", label: "Beginner" },
  { value: "Intermediate", label: "Intermediate" },
  { value: "Advanced", label: "Advanced" },
  { value: "Professional", label: "Professional" },
  { value: "Expert", label: "Expert" },
];

export const TOPIC_OF_THE_DAY_LIMITS = {
  broadTopic: 100,
  focus: 200,
  level: 100,
  context: 500,
  customInstructions: 1000,
} as const;

export const TOPIC_OF_THE_DAY_DEFAULTS: TopicOfTheDayFormValues = {
  focus: "",
  level: "Beginner",
  context: "",
  customInstructions: "",
};
