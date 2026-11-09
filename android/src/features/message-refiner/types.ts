// src/features/message-refiner/types.ts

export type MessageTone = "friendly" | "professional" | "concise" | "persuasive" | "empathetic" | "apologetic" | "assertive";

export interface MessageRefinerFormValues {
  message: string;
  tone: MessageTone;
  audience: string;
  goal: string;
}

export interface MessageRefinerResult {
  refinedMessage: string;
  subjectLine: string;
  changes: string[];
}
