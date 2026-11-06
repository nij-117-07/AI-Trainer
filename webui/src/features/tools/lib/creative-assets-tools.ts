// src/features/tools/lib/creative-assets-tools.ts
/**
 * Tool registry for Creative Assets.
 */
import type { LearningTool } from "@/features/learning/lib/learning-tools";
import { Palette } from "lucide-react";

export const creativeAssetsTools: LearningTool[] = [
  {
    id: "creative-assets",
    title: "Creative Assets",
    shortTitle: "Creative Assets",
    description: "Generate names, hashtags, slogans, and SEO titles with explanations for each.",
    href: "/tools/creative-assets",
    icon: Palette,
    accent: "from-rose-500/15 to-pink-500/15 text-rose-500",
  },
];
