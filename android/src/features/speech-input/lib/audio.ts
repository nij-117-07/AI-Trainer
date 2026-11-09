// src/features/speech-input/lib/audio.ts
/** Reads a finished recording from its URI as base64, with the format the endpoint needs. */

export interface RecordedAudio {
  base64: string;
  format: string;
}

const FALLBACK_FORMAT = "m4a";

export function formatFromUri(uri: string): string | null {
  const match = /\.([a-z0-9]+)(?:[?#].*)?$/i.exec(uri);
  return match ? match[1].toLowerCase() : null;
}

export function formatFromMimeType(mimeType: string): string | null {
  const match = /^audio\/([a-z0-9]+)/i.exec(mimeType);
  if (!match) return null;
  const subtype = match[1].toLowerCase();
  if (subtype === "mpeg") return "mp3";
  if (subtype === "x-m4a") return "m4a";
  return subtype;
}

export async function readRecording(uri: string): Promise<RecordedAudio> {
  const response = await fetch(uri);
  const blob = await response.blob();
  const dataUrl = await blobToDataUrl(blob);
  const comma = dataUrl.indexOf(",");
  const base64 = comma >= 0 ? dataUrl.slice(comma + 1) : dataUrl;
  const format = formatFromUri(uri) ?? formatFromMimeType(blob.type) ?? FALLBACK_FORMAT;
  return { base64, format };
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(reader.error ?? new Error("Could not read the recording."));
    reader.readAsDataURL(blob);
  });
}
