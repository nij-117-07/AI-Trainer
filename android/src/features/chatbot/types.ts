// src/features/chatbot/types.ts
/** Data shapes for the chatbot. Everything is kept on the device. */

export interface Persona {
  id: string;
  name: string;
  description: string;
  avatar: string;
  systemPrompt: string;
  model: string;
  temperature: number;
  topP: number;
  maxTokens: number;
  starters: string[];
  createdAt: string;
  updatedAt: string;
}

export type PersonaDraft = Omit<Persona, "id" | "createdAt" | "updatedAt">;

export interface ChatbotSettings {
  defaultPersonaId: string;
  streamReplies: boolean;
  historyLimit: number;
  autoSpeak: boolean;
}

export type MessageRole = "user" | "assistant";
export type MessageStatus = "done" | "streaming" | "error";

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  status: MessageStatus;
  error: string | null;
  createdAt: string;
}

export interface ChatThread {
  id: string;
  personaId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}
