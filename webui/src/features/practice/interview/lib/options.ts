// src/features/practice/interview/lib/options.ts
/**
 * Select options for the Interview Simulator setup form and stage badges.
 */
import type { FieldOption } from "@/features/learning/explainer/components/fields";

export const questionTypeOptions: FieldOption[] = [
  { value: "technical", label: "Technical" },
  { value: "behavioral", label: "Behavioral" },
  { value: "system_design", label: "System design" },
  { value: "coding", label: "Coding" },
  { value: "hr", label: "HR" },
  { value: "leadership", label: "Leadership" },
  { value: "domain", label: "Domain" },
];

export const difficultyOptions: FieldOption[] = [
  { value: "easy", label: "Easy" },
  { value: "medium", label: "Medium" },
  { value: "hard", label: "Hard" },
  { value: "expert", label: "Expert" },
];

export const positionLevelOptions: FieldOption[] = [
  { value: "intern", label: "Intern" },
  { value: "junior", label: "Junior" },
  { value: "mid-level", label: "Mid-level" },
  { value: "senior", label: "Senior" },
  { value: "staff", label: "Staff" },
  { value: "principal", label: "Principal" },
];

export const roundOptions: FieldOption[] = [
  { value: "phone screen", label: "Phone screen" },
  { value: "technical round", label: "Technical round" },
  { value: "system design round", label: "System design round" },
  { value: "onsite", label: "Onsite" },
  { value: "final round", label: "Final round" },
  { value: "HR round", label: "HR round" },
];

export const stageLabels: Record<string, string> = {
  decide: "Session manager",
  question: "Question generator",
  answer: "Your answer",
  review: "Answer review",
  progress: "Progress tracker",
  report: "Final report",
};
