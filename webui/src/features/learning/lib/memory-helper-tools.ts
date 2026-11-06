// src/features/learning/lib/memory-helper-tools.ts
/**
 * Registry of Memory Helper tools. Used by the Learning sidebar and hub.
 */
import { Brain } from "lucide-react";
import type { LearningTool } from "./learning-tools";

export const memoryHelperTools: LearningTool[] = [
  {
    id: "process",
    title: "Memory Mnemonics",
    shortTitle: "Mnemonics",
    description: "Turn dense facts into vivid memory hooks and a spaced retention plan.",
    href: "/learning/memory-helper",
    icon: Brain,
    accent: "from-violet-500/15 to-purple-500/15 text-violet-500",
  },
];
