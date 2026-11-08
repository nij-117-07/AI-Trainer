// src/theme/palettes.ts
/**
 * Colour presets. Each preset sets the accent, the hero panel, and the surfaces for light
 * and dark mode. Text, tone, and button colours are derived from them in buildThemeColors.
 */
import { mix, readableOn, rgba, type ThemeColors, type ThemeMode, type ToneColors } from "./colors";

export type ThemePresetId = "ocean" | "sunset" | "forest" | "violet" | "rose" | "classic";

export interface ThemeSurfaces {
  primary: string;
  hero: string;
  background: string;
  card: string;
  muted: string;
  border: string;
}

export interface ThemePreset {
  id: ThemePresetId;
  name: string;
  description: string;
  light: ThemeSurfaces;
  dark: ThemeSurfaces;
}

export const DEFAULT_PRESET_ID: ThemePresetId = "ocean";

export const THEME_PRESETS: ThemePreset[] = [
  {
    id: "ocean",
    name: "Ocean",
    description: "Calm blues. Default.",
    light: { primary: "#2563EB", hero: "#2563EB", background: "#F4F8FF", card: "#FFFFFF", muted: "#E6EEFB", border: "#D5E2F7" },
    dark: { primary: "#60A5FA", hero: "#1E3A8A", background: "#050914", card: "#0E1628", muted: "#16203A", border: "#22304F" },
  },
  {
    id: "sunset",
    name: "Sunset",
    description: "Warm oranges and coral.",
    light: { primary: "#EA580C", hero: "#F97316", background: "#FFF8F3", card: "#FFFFFF", muted: "#FDEBDD", border: "#F8D5BD" },
    dark: { primary: "#FB923C", hero: "#7C2D12", background: "#100805", card: "#1C110B", muted: "#2A1A10", border: "#3D2616" },
  },
  {
    id: "forest",
    name: "Forest",
    description: "Fresh greens.",
    light: { primary: "#059669", hero: "#059669", background: "#F3FBF7", card: "#FFFFFF", muted: "#E0F5EC", border: "#CDEBDC" },
    dark: { primary: "#34D399", hero: "#064E3B", background: "#04100B", card: "#0C1F17", muted: "#142E23", border: "#1F3D30" },
  },
  {
    id: "violet",
    name: "Violet",
    description: "Bold purples.",
    light: { primary: "#7C3AED", hero: "#7C3AED", background: "#F8F5FF", card: "#FFFFFF", muted: "#EDE7FD", border: "#DDD3FA" },
    dark: { primary: "#A78BFA", hero: "#3B0764", background: "#0A0614", card: "#160F26", muted: "#221738", border: "#33244F" },
  },
  {
    id: "rose",
    name: "Rose",
    description: "Pink and crimson.",
    light: { primary: "#E11D48", hero: "#E11D48", background: "#FFF5F7", card: "#FFFFFF", muted: "#FDE6EC", border: "#F9CFDB" },
    dark: { primary: "#FB7185", hero: "#881337", background: "#12060A", card: "#1F0D14", muted: "#2C1420", border: "#3F1C2B" },
  },
  {
    id: "classic",
    name: "Classic",
    description: "The original webui look.",
    light: { primary: "#1E9DF1", hero: "#1E9DF1", background: "#FFFFFF", card: "#F7F8F8", muted: "#E5E5E6", border: "#E1EAEF" },
    dark: { primary: "#1C9CF0", hero: "#1C9CF0", background: "#000000", card: "#17181C", muted: "#181818", border: "#242628" },
  },
];

const TONE_BASE = {
  sky: "#0EA5E9",
  rose: "#F43F5E",
  emerald: "#10B981",
  amber: "#F59E0B",
} as const;

export function getPreset(id: ThemePresetId): ThemePreset {
  return THEME_PRESETS.find((preset) => preset.id === id) ?? THEME_PRESETS[0];
}

export function buildThemeColors(presetId: ThemePresetId, mode: ThemeMode): ThemeColors {
  const preset = getPreset(presetId);
  const dark = mode === "dark";
  const surfaces = dark ? preset.dark : preset.light;

  const tone = (base: string): ToneColors => ({
    fg: dark ? mix(base, "#FFFFFF", 0.25) : base,
    bg: rgba(base, dark ? 0.18 : 0.12),
    border: rgba(base, dark ? 0.4 : 0.3),
  });

  return {
    background: surfaces.background,
    foreground: dark ? "#F1F5F9" : "#0F172A",
    card: surfaces.card,
    primary: surfaces.primary,
    primaryForeground: readableOn(surfaces.primary),
    muted: surfaces.muted,
    mutedForeground: dark ? "#94A3B8" : "#475569",
    accent: surfaces.muted,
    border: surfaces.border,
    ring: surfaces.primary,
    destructive: dark ? "#F87171" : "#DC2626",
    hero: surfaces.hero,
    heroForeground: readableOn(surfaces.hero),
    tone: {
      sky: tone(TONE_BASE.sky),
      rose: tone(TONE_BASE.rose),
      emerald: tone(TONE_BASE.emerald),
      amber: tone(TONE_BASE.amber),
    },
  };
}
