// src/theme/ThemeProvider.tsx
/**
 * Holds the chosen colour preset and light/dark/system mode. The choice is saved on the
 * device and restored on launch.
 */
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useColorScheme, View } from "react-native";
import { readStoredValue, writeStoredValue } from "@/lib/storage";
import type { ThemeColors, ThemeMode } from "./colors";
import { buildThemeColors, DEFAULT_PRESET_ID, THEME_PRESETS, type ThemePresetId } from "./palettes";

export type ThemePreference = ThemeMode | "system";

interface ThemePrefs {
  presetId: ThemePresetId;
  preference: ThemePreference;
}

export interface ThemeContextValue {
  colors: ThemeColors;
  preference: ThemePreference;
  resolvedMode: ThemeMode;
  presetId: ThemePresetId;
  setPreference: (preference: ThemePreference) => void;
  setPresetId: (presetId: ThemePresetId) => void;
}

const STORAGE_KEY = "ai_trainer.theme";
const PREFERENCES: ThemePreference[] = ["light", "dark", "system"];
const DEFAULT_PREFS: ThemePrefs = { presetId: DEFAULT_PRESET_ID, preference: "system" };

const ThemeContext = createContext<ThemeContextValue | null>(null);

function parsePrefs(raw: string | null): ThemePrefs {
  if (!raw) return DEFAULT_PREFS;
  try {
    const parsed = JSON.parse(raw) as Partial<ThemePrefs>;
    const presetId = THEME_PRESETS.some((preset) => preset.id === parsed.presetId)
      ? (parsed.presetId as ThemePresetId)
      : DEFAULT_PREFS.presetId;
    const preference = PREFERENCES.includes(parsed.preference as ThemePreference)
      ? (parsed.preference as ThemePreference)
      : DEFAULT_PREFS.preference;
    return { presetId, preference };
  } catch {
    return DEFAULT_PREFS;
  }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemScheme = useColorScheme();
  const [prefs, setPrefs] = useState<ThemePrefs>(DEFAULT_PREFS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    readStoredValue(STORAGE_KEY).then((raw) => {
      if (!active) return;
      setPrefs(parsePrefs(raw));
      setLoaded(true);
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (loaded) void writeStoredValue(STORAGE_KEY, JSON.stringify(prefs));
  }, [prefs, loaded]);

  const resolvedMode: ThemeMode =
    prefs.preference === "system" ? (systemScheme === "dark" ? "dark" : "light") : prefs.preference;

  const value = useMemo<ThemeContextValue>(
    () => ({
      colors: buildThemeColors(prefs.presetId, resolvedMode),
      preference: prefs.preference,
      resolvedMode,
      presetId: prefs.presetId,
      setPreference: (preference) => setPrefs((prev) => ({ ...prev, preference })),
      setPresetId: (presetId) => setPrefs((prev) => ({ ...prev, presetId })),
    }),
    [prefs.presetId, prefs.preference, resolvedMode]
  );

  if (!loaded) {
    return <View style={{ flex: 1, backgroundColor: value.colors.background }} />;
  }

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

export function useThemeColors(): ThemeColors {
  const context = useContext(ThemeContext);
  return context ? context.colors : buildThemeColors(DEFAULT_PRESET_ID, "light");
}
