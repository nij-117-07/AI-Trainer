// src/features/ai-settings/lib/voice.ts
/**
 * Connection used for speech-to-text. The voice base URL and API key may differ from the chat
 * model's; when left empty they fall back to the chat values.
 */
import type { AiSettings } from "../types";

export interface VoiceConnection {
  baseUrl: string;
  apiKey: string;
  model: string;
}

export const VOICE_MODEL_OPTIONS = [
  { value: "nvidia/nemotron-3.5-asr-streaming-multilingual-0.6b", label: "NVIDIA Nemotron ASR (multilingual)" },
  { value: "openai/whisper-large-v3", label: "Whisper Large v3" },
];

export function resolveVoiceConnection(settings: AiSettings): VoiceConnection {
  return {
    baseUrl: settings.transcriptionBaseUrl.trim() || settings.baseUrl.trim(),
    apiKey: settings.transcriptionApiKey.trim() || settings.apiKey.trim(),
    model: settings.transcriptionModel.trim(),
  };
}

export function isVoiceConfigured(connection: VoiceConnection): boolean {
  return connection.baseUrl !== "" && connection.apiKey !== "" && connection.model !== "";
}
