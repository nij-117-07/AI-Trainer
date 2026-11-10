// src/features/roleplay/hooks/usePersona.ts
/**
 * Persona settings for the Persona page. Every change is saved to the device at once, so the
 * chat page reads the same persona when the user comes back.
 */
import { useCallback, useEffect, useState } from "react";
import { DEFAULT_SETTINGS } from "../options";
import { loadSettings, saveSettings } from "../lib/persistence";
import type { RoleplaySettings } from "../types";

export function usePersona() {
  const [settings, setSettings] = useState<RoleplaySettings>(DEFAULT_SETTINGS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    loadSettings()
      .then((saved) => {
        if (active) setSettings(saved);
      })
      .catch(() => undefined)
      .finally(() => {
        if (active) setLoaded(true);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!loaded) return;
    saveSettings(settings).catch(() => undefined);
  }, [loaded, settings]);

  const updateSettings = useCallback((patch: Partial<RoleplaySettings>) => {
    setSettings((current) => ({ ...current, ...patch }));
  }, []);

  const reset = useCallback(() => {
    setSettings((current) => ({ ...current, systemPrompt: "", additionalInstructions: "", seed: "" }));
  }, []);

  return { loaded, settings, updateSettings, reset };
}

export type PersonaState = ReturnType<typeof usePersona>;
