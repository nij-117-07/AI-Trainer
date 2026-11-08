// src/lib/document-store.ts
/**
 * JSON documents kept on the device. AsyncStorage works on Android and web and has no small
 * size limit, so it suits roadmaps, skill trees, and chat sessions. Settings stay in storage.ts.
 */
import AsyncStorage from "@react-native-async-storage/async-storage";

/** Reads a JSON value. Missing or unreadable data returns the fallback. */
export async function loadDocument<T>(key: string, fallback: T): Promise<T> {
  const raw = await AsyncStorage.getItem(key);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export async function saveDocument<T>(key: string, value: T): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

export async function removeDocument(key: string): Promise<void> {
  await AsyncStorage.removeItem(key);
}
