// src/features/practice/lib/executive-eq-tools.ts
/**
 * Tool registry for the Executive EQ Trainer.
 */
import type { LearningTool } from "@/features/learning/lib/learning-tools";
import { Briefcase } from "lucide-react";

export const executiveEqTools: LearningTool[] = [
  {
    id: "executive-eq",
    title: "Executive EQ Trainer",
    shortTitle: "Executive EQ",
    description: "Handle high-stakes executive meetings with NPCs, reading subtext and managing status.",
    href: "/practice/executive-eq",
    icon: Briefcase,
    accent: "from-indigo-500/15 to-blue-500/15 text-indigo-500",
  },
];
