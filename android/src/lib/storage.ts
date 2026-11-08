// src/lib/storage.ts
/**
 * Small key-value store for on-device settings. Uses the Keystore-backed SecureStore on
 * Android. expo-secure-store has no web implementation, so web falls back to localStorage.
 */
import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

export async function readStoredValue(key: string): Promise<string | null> {
  if (Platform.OS === "web") {
    return localStorage.getItem(key);
  }
  return SecureStore.getItemAsync(key);
}

export async function writeStoredValue(key: string, value: string): Promise<void> {
  if (Platform.OS === "web") {
    localStorage.setItem(key, value);
    return;
  }
  await SecureStore.setItemAsync(key, value);
}
