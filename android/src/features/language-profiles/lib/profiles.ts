// src/features/language-profiles/lib/profiles.ts
/** Pure helpers for language profiles: defaults, validation, and reading saved state safely. */
import type { LanguageProfile, LanguageProfilesState } from "../types";

export const PROFILE_TEXT_MAX = 100;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export const DEFAULT_PROFILE: LanguageProfile = {
  id: "default",
  name: "English to Japanese",
  nativeLanguage: "English",
  targetLanguage: "Japanese",
};

export function createProfileId(): string {
  return `profile_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function languagePair(profile: LanguageProfile): { nativeLanguage: string; targetLanguage: string } {
  return { nativeLanguage: profile.nativeLanguage, targetLanguage: profile.targetLanguage };
}

export function describePair(profile: LanguageProfile): string {
  return `${profile.nativeLanguage} → ${profile.targetLanguage}`;
}

export function validateProfile(input: { name: string; nativeLanguage: string; targetLanguage: string }): string | null {
  const name = input.name.trim();
  const native = input.nativeLanguage.trim();
  const target = input.targetLanguage.trim();
  if (!name) return "Profile name is required.";
  if (!native) return "Native language is required.";
  if (!target) return "Target language is required.";
  if (name.length > PROFILE_TEXT_MAX || native.length > PROFILE_TEXT_MAX || target.length > PROFILE_TEXT_MAX) {
    return `Each field must be ${PROFILE_TEXT_MAX} characters or fewer.`;
  }
  if (native.toLowerCase() === target.toLowerCase()) return "Native and target language must be different.";
  return null;
}

function readProfile(raw: unknown): LanguageProfile | null {
  if (!isRecord(raw)) return null;
  const { id, name, nativeLanguage, targetLanguage } = raw;
  if (typeof id !== "string" || !id) return null;
  if (typeof name !== "string" || typeof nativeLanguage !== "string" || typeof targetLanguage !== "string") return null;
  if (!name.trim() || !nativeLanguage.trim() || !targetLanguage.trim()) return null;
  return { id, name: name.trim(), nativeLanguage: nativeLanguage.trim(), targetLanguage: targetLanguage.trim() };
}

/** Turns saved data into a valid state: drops broken entries and always keeps one active profile. */
export function normalizeProfilesState(raw: unknown): LanguageProfilesState {
  const seen = new Set<string>();
  const profiles: LanguageProfile[] = [];
  if (isRecord(raw) && Array.isArray(raw.profiles)) {
    for (const item of raw.profiles) {
      const profile = readProfile(item);
      if (profile && !seen.has(profile.id)) {
        seen.add(profile.id);
        profiles.push(profile);
      }
    }
  }
  if (profiles.length === 0) profiles.push(DEFAULT_PROFILE);

  const savedActive = isRecord(raw) && typeof raw.activeProfileId === "string" ? raw.activeProfileId : "";
  const activeProfileId = profiles.some((profile) => profile.id === savedActive) ? savedActive : profiles[0].id;
  return { profiles, activeProfileId };
}
