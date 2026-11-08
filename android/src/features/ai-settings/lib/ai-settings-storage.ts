// src/features/ai-settings/lib/ai-settings-storage.ts
/** Persists AI settings, including the API key, through the shared on-device store. */
import { readStoredValue, writeStoredValue } from "@/lib/storage";
import { EMPTY_AI_SETTINGS, type AiSettings } from "../types";

const STORAGE_KEY = "ai_trainer.ai_settings";

export async function loadAiSettings(): Promise<AiSettings> {
  const raw = await readStoredValue(STORAGE_KEY);
  if (!raw) return EMPTY_AI_SETTINGS;
  try {
    return { ...EMPTY_AI_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return EMPTY_AI_SETTINGS;
  }
}

export function saveAiSettings(settings: AiSettings): Promise<void> {
  return writeStoredValue(STORAGE_KEY, JSON.stringify(settings));
}
