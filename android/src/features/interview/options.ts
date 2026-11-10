// src/features/interview/options.ts
/** Choices, labels and setup defaults for the Interview Simulator. Values match the webui and backend. */
import type { InterviewSetupForm } from "./types";

export interface ChoiceOption {
  value: string;
  label: string;
}

export const QUESTION_TYPE_OPTIONS: ChoiceOption[] = [
  { value: "technical", label: "Technical" },
  { value: "behavioral", label: "Behavioral" },
  { value: "system_design", label: "System design" },
  { value: "coding", label: "Coding" },
  { value: "hr", label: "HR" },
  { value: "leadership", label: "Leadership" },
  { value: "domain", label: "Domain" },
];

export const DIFFICULTY_OPTIONS: ChoiceOption[] = [
  { value: "easy", label: "Easy" },
  { value: "medium", label: "Medium" },
  { value: "hard", label: "Hard" },
  { value: "expert", label: "Expert" },
];

export const POSITION_LEVEL_OPTIONS: ChoiceOption[] = [
  { value: "intern", label: "Intern" },
  { value: "junior", label: "Junior" },
  { value: "mid-level", label: "Mid-level" },
  { value: "senior", label: "Senior" },
  { value: "staff", label: "Staff" },
  { value: "principal", label: "Principal" },
];

export const ROUND_OPTIONS: ChoiceOption[] = [
  { value: "phone screen", label: "Phone screen" },
  { value: "technical round", label: "Technical round" },
  { value: "system design round", label: "System design round" },
  { value: "onsite", label: "Onsite" },
  { value: "final round", label: "Final round" },
  { value: "HR round", label: "HR round" },
];

export const STAGE_LABELS: Record<string, string> = {
  decide: "Session manager",
  question: "Question generator",
  answer: "Your answer",
  review: "Answer review",
  progress: "Progress tracker",
  report: "Final report",
};

export function optionValues(options: ChoiceOption[]): string[] {
  return options.map((option) => option.value);
}

export const DEFAULT_SETUP_FORM: InterviewSetupForm = {
  candidateName: "",
  candidateExperience: "",
  candidateSkills: "",
  positionRole: "",
  positionCompany: "",
  positionSkills: "",
  positionLevel: "senior",
  interviewerRole: "",
  interviewType: "technical",
  interviewRound: "technical round",
  interviewFormat: "",
  maxQuestions: 8,
  durationMinutes: "60",
};

export const ANSWER_MAX_LENGTH = 5000;
export const MAX_QUESTIONS_LIMIT = 50;
export const DURATION_LIMITS = { min: 5, max: 480 } as const;
