// src/features/ingredients/options.ts
/** Health level labels and tones. Wording matches the webui result view. */
import type { HealthLevel, HealthLevelInfo } from "./types";

export const HEALTH_LEVEL_INFO: Record<HealthLevel, HealthLevelInfo> = {
  1: {
    label: "1 / 5",
    description: "Ultra-processed / harmful additives (avoid)",
    tone: "rose",
  },
  2: {
    label: "2 / 5",
    description: "High sugar/sodium or artificial preservatives",
    tone: "amber",
  },
  3: {
    label: "3 / 5",
    description: "Moderately processed but generally safe",
    tone: "sky",
  },
  4: {
    label: "4 / 5",
    description: "Whole foods with minimal processing",
    tone: "emerald",
  },
  5: {
    label: "5 / 5",
    description: "Organic / pure / highly nutritious (excellent)",
    tone: "emerald",
  },
};
