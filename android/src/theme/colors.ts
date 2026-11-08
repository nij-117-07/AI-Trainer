// src/theme/colors.ts
/** Theme types and colour maths. Presets live in palettes.ts. */

export type ThemeMode = "light" | "dark";
export type Tone = "sky" | "rose" | "emerald" | "amber";

export interface ToneColors {
  fg: string;
  bg: string;
  border: string;
}

export interface ThemeColors {
  background: string;
  foreground: string;
  card: string;
  primary: string;
  primaryForeground: string;
  muted: string;
  mutedForeground: string;
  accent: string;
  border: string;
  ring: string;
  destructive: string;
  hero: string;
  heroForeground: string;
  tone: Record<Tone, ToneColors>;
}

export function hexToRgb(hex: string): [number, number, number] {
  const value = hex.replace("#", "");
  const full = value.length === 3 ? value.split("").map((char) => char + char).join("") : value;
  const number = parseInt(full, 16);
  return [(number >> 16) & 255, (number >> 8) & 255, number & 255];
}

export function mix(hex: string, target: string, amount: number): string {
  const from = hexToRgb(hex);
  const to = hexToRgb(target);
  const channels = from.map((channel, index) => channel + (to[index] - channel) * amount);
  return `#${channels.map((channel) => Math.round(channel).toString(16).padStart(2, "0")).join("")}`;
}

export function rgba(hex: string, alpha: number): string {
  const [red, green, blue] = hexToRgb(hex);
  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

function luminance(hex: string): number {
  const [red, green, blue] = hexToRgb(hex).map((channel) => {
    const value = channel / 255;
    return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}

export function contrastRatio(first: string, second: string): number {
  const [lighter, darker] = [luminance(first), luminance(second)].sort((a, b) => b - a);
  return (lighter + 0.05) / (darker + 0.05);
}

const LIGHT_TEXT = "#FFFFFF";
const DARK_TEXT = "#0B0F19";

/** Picks white or near-black text, whichever is more legible on the given fill. */
export function readableOn(hex: string): string {
  return contrastRatio(LIGHT_TEXT, hex) >= contrastRatio(DARK_TEXT, hex) ? LIGHT_TEXT : DARK_TEXT;
}
