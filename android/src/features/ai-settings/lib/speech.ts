// src/features/ai-settings/lib/speech.ts
/**
 * Connection used for text-to-speech. The speech base URL and API key may differ from the chat
 * model's; when left empty they fall back to the chat values.
 */
import type { AiSettings } from "../types";

export interface SpeechConnection {
  baseUrl: string;
  apiKey: string;
  model: string;
  voice: string;
}

export const TTS_MODEL_OPTIONS = [{ value: "google/gemini-3.8-flash-lite-tts", label: "Gemini 3.8 Flash Lite TTS" }];

export const TTS_VOICE_OPTIONS = [
  { value: "Zephyr", label: "Zephyr" },
  { value: "Puck", label: "Puck" },
  { value: "Kore", label: "Kore" },
  { value: "Charon", label: "Charon" },
  { value: "Fenrir", label: "Fenrir" },
  { value: "Aoede", label: "Aoede" },
];

export function resolveSpeechConnection(settings: AiSettings): SpeechConnection {
  return {
    baseUrl: settings.ttsBaseUrl.trim() || settings.baseUrl.trim(),
    apiKey: settings.ttsApiKey.trim() || settings.apiKey.trim(),
    model: settings.ttsModel.trim(),
    voice: settings.ttsVoice.trim(),
  };
}

export function isSpeechConfigured(connection: SpeechConnection): boolean {
  return connection.baseUrl !== "" && connection.apiKey !== "" && connection.model !== "" && connection.voice !== "";
}
