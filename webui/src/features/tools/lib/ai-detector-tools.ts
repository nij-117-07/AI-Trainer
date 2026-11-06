// src/features/tools/lib/ai-detector-tools.ts
/**
 * Tool registry for AI Detector (detect → humanize → re-detect wizard).
 */
import type { LearningTool } from "@/features/learning/lib/learning-tools";
import { ScanSearch } from "lucide-react";

export const aiDetectorTools: LearningTool[] = [
  {
    id: "ai-detector",
    title: "AI Detector",
    shortTitle: "AI Detector",
    description:
      "Detect AI-written text, humanize it, then re-detect to verify — each step runs on click.",
    href: "/tools/ai-detector",
    icon: ScanSearch,
    accent: "from-teal-500/15 to-emerald-600/15 text-teal-500",
  },
];
