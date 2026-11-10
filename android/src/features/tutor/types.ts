// src/features/tutor/types.ts

export interface TutorFormValues {
  /** Name of the persona template. The prompt text is read from the template at generate time. */
  persona: string;
  userQuery: string;
  studentLevel: string;
  learningStyle: string;
  currentScenario: string;
  lastTopicTaught: string;
}

export interface TutorResponse {
  adaptedExplanation: string;
  conceptAnalogy: string;
  tutorFeedback: string;
}

export interface PromptInput {
  name: string;
  content: string;
}

export interface StoredPrompt extends PromptInput {
  createdAt: string;
  updatedAt: string;
}

export type PromptSource = "built-in" | "customized" | "custom";

export interface PromptTemplate extends PromptInput {
  source: PromptSource;
}
