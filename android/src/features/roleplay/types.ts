// src/features/roleplay/types.ts
/** Shapes for the roleplay chat settings, transcript, and saved roles kept on the device. */

export type ChatRole = "user" | "assistant";

export interface ChatMessage {
  role: ChatRole;
  content: string;
}

export interface RoleplaySettings {
  systemPrompt: string;
  language: string;
  seed: string;
  additionalInstructions: string;
}

export interface RoleplayTurnValues {
  systemPrompt: string;
  language: string;
  seed: string;
  additionalInstructions: string;
  history: ChatMessage[];
  message: string;
}

export interface RoleRecord {
  name: string;
  prompt: string;
}

export interface RoleFormValues {
  name: string;
  prompt: string;
}

export interface SystemPromptValues {
  idea: string;
  language: string;
}
