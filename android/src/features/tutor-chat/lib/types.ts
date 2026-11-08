// src/features/tutor-chat/lib/types.ts
/** Shapes for tutor chat messages, concept breakdowns, and the sessions kept on the device. */

export type ChatRole = "user" | "assistant";

export interface ChatMessage {
  role: ChatRole;
  content: string;
}

export interface ConceptItem {
  title: string;
  description: string;
}

export interface TutorChatSession {
  id: string;
  masterTopic: string;
  additionalContext: string;
  chatHistory: ChatMessage[];
  /** One breakdown per assistant reply, in the same order as the replies. */
  breakdowns: ConceptItem[][];
  createdAt: string;
  updatedAt: string;
}

export interface TutorSettingsValues {
  masterTopic: string;
  additionalContext: string;
}

export interface SessionSummary {
  id: string;
  masterTopic: string;
  updatedAt: string;
  messageCount: number;
  lastMessage: string;
}

export interface TutorTurnValues extends TutorSettingsValues {
  chatHistory: ChatMessage[];
  userInput: string;
}

export interface TutorTurnResult {
  tutorResponse: string;
  educationalBreakdown: ConceptItem[];
}
