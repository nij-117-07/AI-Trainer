// src/features/text-to-speech/lib/synthesize.ts
/**
 * Sends text to an OpenAI-compatible speech endpoint (for example OpenRouter's
 * /api/v1/audio/speech) and returns the audio bytes that come back.
 */
import type { SpeechConnection } from "@/features/ai-settings/lib/speech";
import { describeFailure, extractErrorMessage, hostOf, looksLikeWebPage } from "@/lib/provider-errors";
import { isPcmMime, pcmToWav, sampleRateFromMime } from "./wav";

export const MAX_SPEECH_CHARS = 4000;

export interface SpeechClip {
  bytes: ArrayBuffer;
  mimeType: string;
  generationId: string | null;
}

interface SynthesizeInput {
  connection: SpeechConnection;
  text: string;
  signal?: AbortSignal;
}

export function speechEndpoint(baseUrl: string): string {
  return `${baseUrl.trim().replace(/\/+$/, "")}/audio/speech`;
}

export function buildSpeechBody(model: string, input: string, voice: string): string {
  return JSON.stringify({
    model: model.trim(),
    input,
    voice: voice.trim(),
  });
}

export async function synthesizeSpeech({ connection, text, signal }: SynthesizeInput): Promise<SpeechClip> {
  const endpoint = speechEndpoint(connection.baseUrl);
  const host = hostOf(endpoint);
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${connection.apiKey}`,
      "Content-Type": "application/json",
    },
    body: buildSpeechBody(connection.model, text, connection.voice),
    signal,
  });

  if (!response.ok) {
    const raw = await response.text();
    if (looksLikeWebPage(raw)) throw webPageError(host);
    throw new Error(describeFailure("Speech generation", response.status, host, raw, "speech API key"));
  }

  const contentType = (response.headers.get("content-type") ?? "").toLowerCase();
  const bytes = await response.arrayBuffer();

  if (contentType.includes("json") || contentType.includes("html") || contentType.startsWith("text/")) {
    const raw = new TextDecoder().decode(bytes);
    if (looksLikeWebPage(raw)) throw webPageError(host);
    throw new Error(`${host} did not return audio. ${extractErrorMessage(raw)}`);
  }
  if (bytes.byteLength === 0) {
    throw new Error("The model returned an empty audio file. Try again.");
  }

  const generationId = response.headers.get("X-Generation-Id");
  if (isPcmMime(contentType)) {
    return {
      bytes: pcmToWav(bytes, sampleRateFromMime(contentType)),
      mimeType: "audio/wav",
      generationId,
    };
  }
  return {
    bytes,
    mimeType: contentType.split(";")[0].trim() || "audio/mpeg",
    generationId,
  };
}

function webPageError(host: string): Error {
  return new Error(`${host} returned a web page, not a speech API. Check the speech base URL in AI settings.`);
}
