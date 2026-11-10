// src/features/testing-portal/options.ts
/** Form choices for the Testing Portal tabs. Values match the webui options. */
import type { AnswerFormValues, McqFormValues, Options, ResponseFormat, TheoreticalFormValues } from "./types";

export const EMPTY_OPTIONS: Options = { A: "", B: "", C: "", D: "" };

export interface ChoiceItem<T extends string | number = string> {
  value: T;
  label: string;
}

export const MCQ_MAX_QUESTIONS = 10;

export const MCQ_FORM_DEFAULTS: McqFormValues = {
  topic: "",
  questionType: "academic",
  numQuestions: 3,
  difficultyLevel: "intermediate",
  contextSetting: "",
  customInstructions: "",
  pastQuestions: "",
};

export const ANSWER_FORM_DEFAULTS: AnswerFormValues = {
  question: "",
  context: "",
  difficulty: "Intermediate",
  responseFormat: "bullet_points",
  customInstructions: "",
};

export const GRADER_FORM_DEFAULTS = {
  scenario: "",
  questionAsked: "",
  targetObjective: "",
  expectedLevel: "intermediate",
  userAnswerText: "",
};

export const THEORETICAL_MAX_QUESTIONS = 5;

export const THEORETICAL_FORM_DEFAULTS: TheoreticalFormValues = {
  topic: "",
  questionType: "architectural",
  numQuestions: 2,
  difficultyLevel: "advanced",
  contextSetting: "",
  sourceContext: "",
  customInstructions: "",
  pastQuestions: "",
};

export const mcqQuestionTypeOptions: ChoiceItem[] = [
  { value: "academic", label: "Academic" },
  { value: "practical", label: "Practical" },
  { value: "scenario-based", label: "Scenario-based" },
  { value: "conceptual", label: "Conceptual" },
  { value: "recall", label: "Recall" },
];

export const mcqDifficultyLevelOptions: ChoiceItem[] = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
  { value: "expert", label: "Expert" },
];

export const theoreticalQuestionTypeOptions: ChoiceItem[] = [
  { value: "academic", label: "Academic" },
  { value: "practical", label: "Practical" },
  { value: "case-study", label: "Case Study" },
  { value: "philosophical", label: "Philosophical" },
  { value: "architectural", label: "Architectural" },
];

export const theoreticalDifficultyLevelOptions: ChoiceItem[] = [
  { value: "basic", label: "Basic" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
  { value: "architectural", label: "Architectural" },
];

export const difficultyOptions: ChoiceItem[] = [
  { value: "Beginner", label: "Beginner" },
  { value: "Intermediate", label: "Intermediate" },
  { value: "Advanced", label: "Advanced" },
  { value: "Expert", label: "Expert" },
];

export const responseFormatOptions: ChoiceItem<ResponseFormat>[] = [
  { value: "bullet_points", label: "Bullet points" },
  { value: "paragraph", label: "Paragraph" },
  { value: "step_by_step", label: "Step-by-step" },
  { value: "technical_whitepaper", label: "Technical whitepaper" },
];

export const expectedLevelOptions: ChoiceItem[] = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "expert", label: "Expert" },
];

export function countOptions(max: number): ChoiceItem<number>[] {
  return Array.from({ length: max }, (_, index) => ({ value: index + 1, label: String(index + 1) }));
}
