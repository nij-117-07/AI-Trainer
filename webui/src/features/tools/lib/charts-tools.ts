// src/features/tools/lib/charts-tools.ts
/**
 * Tool registry for Chart.js Generator.
 */
import type { LearningTool } from "@/features/learning/lib/learning-tools";
import { BarChart3 } from "lucide-react";

export const chartsTools: LearningTool[] = [
  {
    id: "charts",
    title: "Chart.js Generator",
    shortTitle: "Charts",
    description: "Generate a Chart.js HTML/JS visualization from raw data and style instructions.",
    href: "/tools/charts",
    icon: BarChart3,
    accent: "from-amber-500/15 to-orange-500/15 text-amber-500",
  },
];
