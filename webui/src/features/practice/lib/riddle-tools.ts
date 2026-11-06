// src/features/practice/lib/riddle-tools.ts
/**
 * Tool registry for the Riddle Generator.
 */
import type { LearningTool } from "@/features/learning/lib/learning-tools";
import { Brain } from "lucide-react";

export const riddleTools: LearningTool[] = [
  {
    id: "riddle",
    title: "Riddle Generator",
    shortTitle: "Riddles",
    description: "Adaptive riddles tuned to your topic and cognitive domain, with feedback on every answer.",
    href: "/practice/riddle",
    icon: Brain,
    accent: "from-cyan-500/15 to-sky-500/15 text-cyan-500",
  },
];
