// src/features/learning/lib/motivation-tools.ts
/**
 * Registry of Motivation & Reflection tools. Used by the Learning sidebar, the
 * overview page, and the hub.
 */
import { Flame, NotebookPen } from "lucide-react";
import type { LearningTool } from "./learning-tools";

export const motivationTools: LearningTool[] = [
  {
    id: "quote",
    title: "Motivational Quote",
    shortTitle: "Quote",
    description: "Get a personalized quote matched to your emotional state and a micro-action to take.",
    href: "/learning/motivation/quote",
    icon: Flame,
    accent: "from-orange-500/15 to-red-500/15 text-orange-500",
  },
  {
    id: "reflect",
    title: "Reflection Journal",
    shortTitle: "Reflect",
    description: "Generate deep journaling prompts and a perspective shift for your mood and goals.",
    href: "/learning/motivation/reflect",
    icon: NotebookPen,
    accent: "from-teal-500/15 to-cyan-500/15 text-teal-500",
  },
];
