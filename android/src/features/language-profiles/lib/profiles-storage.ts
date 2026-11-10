// src/features/language-profiles/lib/profiles-storage.ts
/** Saves the language profiles and the active profile on the device. */
import { loadDocument, saveDocument } from "@/lib/document-store";
import { normalizeProfilesState } from "./profiles";
import type { LanguageProfilesState } from "../types";

const STORAGE_KEY = "language-learner.profiles.v1";

export async function loadLanguageProfiles(): Promise<LanguageProfilesState> {
  return normalizeProfilesState(await loadDocument<unknown>(STORAGE_KEY, null));
}

export function saveLanguageProfiles(state: LanguageProfilesState): Promise<void> {
  return saveDocument(STORAGE_KEY, state);
}
