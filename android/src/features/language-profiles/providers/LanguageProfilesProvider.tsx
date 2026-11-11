// src/features/language-profiles/providers/LanguageProfilesProvider.tsx
/**
 * Holds the saved language profiles (native and target language pairs). Every sub-app reads the
 * active profile through useLanguageProfiles() instead of asking for languages itself.
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { DEFAULT_PROFILE, normalizeProfilesState } from "../lib/profiles";
import { loadLanguageProfiles, saveLanguageProfiles } from "../lib/profiles-storage";
import type { LanguageProfile, LanguageProfilesContextValue, LanguageProfilesState } from "../types";

const LanguageProfilesContext = createContext<LanguageProfilesContextValue | null>(null);

const INITIAL_STATE: LanguageProfilesState = normalizeProfilesState({
  profiles: [DEFAULT_PROFILE],
  activeProfileId: DEFAULT_PROFILE.id,
});

export function LanguageProfilesProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<LanguageProfilesState>(INITIAL_STATE);
  const [loaded, setLoaded] = useState(false);
  const [saveError, setSaveError] = useState(false);

  useEffect(() => {
    let active = true;
    loadLanguageProfiles()
      .then((stored) => {
        if (active) setState(stored);
      })
      .catch(() => undefined)
      .finally(() => {
        if (active) setLoaded(true);
      });
    return () => {
      active = false;
    };
  }, []);

  const commit = useCallback(async (next: LanguageProfilesState) => {
    setState(next);
    await saveLanguageProfiles(next).then(
      () => setSaveError(false),
      () => setSaveError(true),
    );
  }, []);

  const upsertProfile = useCallback(
    (profile: LanguageProfile) => {
      const exists = state.profiles.some((item) => item.id === profile.id);
      const profiles = exists
        ? state.profiles.map((item) => (item.id === profile.id ? profile : item))
        : [...state.profiles, profile];
      return commit({ ...state, profiles });
    },
    [commit, state],
  );

  const removeProfile = useCallback(
    (id: string) => {
      const profiles = state.profiles.filter((item) => item.id !== id);
      if (profiles.length === 0) return Promise.reject(new Error("At least one language profile is needed."));
      const activeProfileId = profiles.some((item) => item.id === state.activeProfileId)
        ? state.activeProfileId
        : profiles[0].id;
      return commit({ profiles, activeProfileId });
    },
    [commit, state],
  );

  const activateProfile = useCallback(
    (id: string) => {
      if (!state.profiles.some((item) => item.id === id)) return Promise.resolve();
      return commit({ ...state, activeProfileId: id });
    },
    [commit, state],
  );

  const value = useMemo<LanguageProfilesContextValue>(() => {
    const activeProfile =
      state.profiles.find((item) => item.id === state.activeProfileId) ?? state.profiles[0];
    return {
      profiles: state.profiles,
      activeProfile,
      loaded,
      saveError,
      upsertProfile,
      removeProfile,
      activateProfile,
    };
  }, [state, loaded, saveError, upsertProfile, removeProfile, activateProfile]);

  return <LanguageProfilesContext.Provider value={value}>{children}</LanguageProfilesContext.Provider>;
}

export function useLanguageProfiles(): LanguageProfilesContextValue {
  const context = useContext(LanguageProfilesContext);
  if (!context) {
    throw new Error("useLanguageProfiles must be used within a LanguageProfilesProvider");
  }
  return context;
}
