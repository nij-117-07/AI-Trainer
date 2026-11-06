// src/features/tools/lib/prompt-generator-tools.ts
/**
 * Tool registry for Prompt Generator.
 */
import type { LearningTool } from "@/features/learning/lib/learning-tools";
import { Bot } from "lucide-react";

export const promptGeneratorTools: LearningTool[] = [
  {
    id: "prompt-generator",
    title: "Prompt Generator",
    shortTitle: "Prompt Generator",
    description: "Generate or refine a full LLM system persona with a reproducible seed.",
    href: "/tools/prompt-generator",
    icon: Bot,
    accent: "from-teal-500/15 to-emerald-500/15 text-teal-500",
  },
];
