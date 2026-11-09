// src/features/chatbot/lib/ids.ts
/** Short sortable ids for personas, chats, and messages. */
export function makeId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}
