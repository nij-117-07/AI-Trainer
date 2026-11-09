// src/features/text-to-speech/lib/clip.ts
/**
 * Turns generated audio bytes into something the audio player can open. Native writes a file to
 * the cache directory; web uses an object URL.
 */
import { Platform } from "react-native";
import { File, Paths } from "expo-file-system";
import { extensionForMime } from "./mime";

export async function createPlayableClip(bytes: ArrayBuffer, mimeType: string, id: string): Promise<string> {
  if (Platform.OS === "web") {
    return URL.createObjectURL(new Blob([bytes], { type: mimeType }));
  }
  const file = new File(Paths.cache, `tts-${id}.${extensionForMime(mimeType)}`);
  await file.write(new Uint8Array(bytes));
  return file.uri;
}

export function releaseClip(uri: string): void {
  if (Platform.OS === "web" && uri.startsWith("blob:")) {
    URL.revokeObjectURL(uri);
  }
}
