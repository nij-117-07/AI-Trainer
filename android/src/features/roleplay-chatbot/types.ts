// src/features/roleplay-chatbot/types.ts
/** Shapes for the Roleplay Chatbot: the persona, the transcript, and each model reply. */

export type ChatRole = "user" | "assistant";

/** One turn sent to the model as history. */
export interface ChatTurn {
  role: ChatRole;
  content: string;
}

/** One message on screen. Character replies also carry the emotion and action tags. */
export interface ChatMessage extends ChatTurn {
  emotion?: string;
  action?: string;
}

export interface RoleplayTurnValues {
  systemPrompt: string;
  characterName: string;
  history: ChatTurn[];
  userInput: string;
}

export interface RoleplayTurnResult {
  response: string;
  emotion: string;
  action: string;
}
