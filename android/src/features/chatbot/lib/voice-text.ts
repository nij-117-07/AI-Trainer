// src/features/chatbot/lib/voice-text.ts
/** Puts a transcript into the message draft and formats recording time. Pure functions only. */

export function appendTranscript(draft: string, transcript: string): string {
  const text = transcript.trim();
  if (!text) return draft;
  const head = draft.trimEnd();
  return head ? `${head} ${text}` : text;
}

export function formatElapsed(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}
