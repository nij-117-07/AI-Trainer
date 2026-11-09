// src/features/speech-input/lib/transcribe.ts
/**
 * Sends one recording to an OpenAI-compatible speech-to-text endpoint (for example OpenRouter's
 * /api/v1/audio/transcriptions) and returns the transcript text.
 */
import type { VoiceConnection } from "@/features/ai-settings/lib/voice";
import { describeFailure, hostOf, looksLikeWebPage } from "@/lib/provider-errors";

export function transcriptionEndpoint(baseUrl: string): string {
  return `${baseUrl.trim().replace(/\/+$/, "")}/audio/transcriptions`;
}

export function buildTranscriptionBody(model: string, audioBase64: string, format: string): string {
  return JSON.stringify({
    model: model.trim(),
    input_audio: {
      data: audioBase64,
      format,
    },
  });
}

interface TranscribeInput {
  connection: VoiceConnection;
  audioBase64: string;
  format: string;
  signal?: AbortSignal;
}

export async function transcribeAudio({ connection, audioBase64, format, signal }: TranscribeInput): Promise<string> {
  const endpoint = transcriptionEndpoint(connection.baseUrl);
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${connection.apiKey}`,
      "Content-Type": "application/json",
    },
    body: buildTranscriptionBody(connection.model, audioBase64, format),
    signal,
  });

  const raw = await response.text();
  const host = hostOf(endpoint);

  if (looksLikeWebPage(raw)) {
    throw new Error(`${host} returned a web page, not a speech API. Check the voice base URL in AI settings.`);
  }
  if (!response.ok) {
    throw new Error(describeFailure("Transcription", response.status, host, raw, "voice API key"));
  }

  const text = extractTranscript(raw);
  if (!text) {
    throw new Error("The model returned no transcript. Try recording again, a little louder or closer.");
  }
  return text;
}

/** Reads the transcript from a JSON body, tolerating a missing or non-string `text` field. */
export function extractTranscript(raw: string): string {
  try {
    const parsed = JSON.parse(raw) as { text?: unknown };
    return typeof parsed.text === "string" ? parsed.text.trim() : "";
  } catch {
    return "";
  }
}
