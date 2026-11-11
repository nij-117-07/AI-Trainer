// src/features/language-profiles/types.ts

export interface LanguageProfile {
  id: string;
  name: string;
  nativeLanguage: string;
  targetLanguage: string;
}

export interface LanguageProfilesState {
  profiles: LanguageProfile[];
  activeProfileId: string;
}

export interface LanguageProfilesContextValue {
  profiles: LanguageProfile[];
  activeProfile: LanguageProfile;
  loaded: boolean;
  saveError: boolean;
  upsertProfile: (profile: LanguageProfile) => Promise<void>;
  removeProfile: (id: string) => Promise<void>;
  activateProfile: (id: string) => Promise<void>;
}
