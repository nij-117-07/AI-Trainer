// src/features/practice/components/chat/types.ts
/**
 * Shared chat message shape for the practice chat-style apps (negotiation,
 * debate, socratic, battleground, executive EQ).
 */
export interface PracticeChatMessage {
  role: "user" | "assistant";
  content: string;
}
