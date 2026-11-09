// src/features/dharma-instructor/types.ts

export interface DharmaMessage {
  role: "user" | "assistant";
  content: string;
}

export interface DharmaTurnValues {
  message: string;
  history: string[];
}

export interface DharmaTurn {
  reply: string;
  teaching: string | null;
  practice: string | null;
}
