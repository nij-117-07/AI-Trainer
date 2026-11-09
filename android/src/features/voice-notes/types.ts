// src/features/voice-notes/types.ts

export interface VoiceNote {
  id: string;
  title: string;
  text: string;
  model: string;
  durationMs: number;
  createdAt: string;
  updatedAt: string;
}
