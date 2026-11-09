// src/features/text-to-speech/lib/mime.ts
/** Maps an audio MIME type from the speech endpoint to a file extension. */

const EXTENSIONS: Record<string, string> = {
  mpeg: "mp3",
  mp3: "mp3",
  wav: "wav",
  "x-wav": "wav",
  wave: "wav",
  ogg: "ogg",
  opus: "opus",
  webm: "webm",
  flac: "flac",
  aac: "aac",
  mp4: "m4a",
  "x-m4a": "m4a",
};

export function extensionForMime(mimeType: string): string {
  const subtype = mimeType.toLowerCase().split("/")[1] ?? "";
  return EXTENSIONS[subtype] ?? "mp3";
}
