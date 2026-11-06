// src/features/linguistic/lib/translator-tools.ts
/**
 * Registry of Translator tools. Used by the Linguistic sidebar and hub.
 */
import { ArrowRightLeft } from "lucide-react";
import type { LearningTool } from "@/features/learning/lib/learning-tools";

export const translatorTools: LearningTool[] = [
  {
    id: "process",
    title: "Translator",
    shortTitle: "Translator",
    description:
      "Contextual translation with a chosen tone, reference material, and cultural notes.",
    href: "/linguistic/translator",
    icon: ArrowRightLeft,
    accent: "from-indigo-500/15 to-violet-500/15 text-indigo-500",
  },
];
