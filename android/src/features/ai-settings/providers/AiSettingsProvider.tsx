// src/features/ai-settings/providers/AiSettingsProvider.tsx
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { EMPTY_AI_SETTINGS, type AiSettings, type AiSettingsContextValue } from "../types";
import { loadAiSettings, saveAiSettings } from "../lib/ai-settings-storage";

const AiSettingsContext = createContext<AiSettingsContextValue | null>(null);

export function AiSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AiSettings>(EMPTY_AI_SETTINGS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    loadAiSettings().then((stored) => {
      if (!active) return;
      setSettings(stored);
      setLoaded(true);
    });
    return () => {
      active = false;
    };
  }, []);

  const saveSettings = useCallback(async (next: AiSettings) => {
    await saveAiSettings(next);
    setSettings(next);
  }, []);

  const value = useMemo(
    () => ({ settings, loaded, saveSettings }),
    [settings, loaded, saveSettings]
  );

  return <AiSettingsContext.Provider value={value}>{children}</AiSettingsContext.Provider>;
}

export function useAiSettings(): AiSettingsContextValue {
  const context = useContext(AiSettingsContext);
  if (!context) {
    throw new Error("useAiSettings must be used within an AiSettingsProvider");
  }
  return context;
}
