// src/features/practice/lib/debate-tools.ts
/**
 * Tool registry for the Debate Engine.
 */
import type { LearningTool } from "@/features/learning/lib/learning-tools";
import { Scale } from "lucide-react";

export const debateTools: LearningTool[] = [
  {
    id: "debate",
    title: "Debate Engine",
    shortTitle: "Debate",
    description: "Build a debate persona, trade arguments with it, and get a judge's verdict.",
    href: "/practice/debate",
    icon: Scale,
    accent: "from-red-500/15 to-orange-500/15 text-red-500",
  },
];
