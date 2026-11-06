// src/features/learning/lib/tutor-tools.ts
/**
 * Registry of Adaptive Tutor tools. Used by the Learning sidebar and hub.
 */
import { BookOpenCheck, Presentation } from "lucide-react";
import type { LearningTool } from "./learning-tools";

export const tutorTools: LearningTool[] = [
  {
    id: "explain",
    title: "Adaptive Tutor",
    shortTitle: "Adaptive Tutor",
    description:
      "Get an explanation adapted to your level, learning style, and current scenario.",
    href: "/learning/tutor",
    icon: Presentation,
    accent: "from-teal-500/15 to-cyan-500/15 text-teal-500",
  },
  {
    id: "prompts",
    title: "Prompt Templates",
    shortTitle: "Prompt Templates",
    description:
      "Manage the tutor persona system prompts stored by the Adaptive Tutor service.",
    href: "/learning/tutor/prompts",
    icon: BookOpenCheck,
    accent: "from-cyan-500/15 to-sky-500/15 text-cyan-500",
  },
];
