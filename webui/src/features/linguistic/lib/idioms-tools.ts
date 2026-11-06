// src/features/linguistic/lib/idioms-tools.ts
/**
 * Registry of Linguistic tools (Idioms, and future language tools). Used by
 * the Linguistic sidebar and hub.
 */
import { MessageSquareQuote } from "lucide-react";
import type { LearningTool } from "@/features/learning/lib/learning-tools";

export const idiomsTools: LearningTool[] = [
  {
    id: "generate",
    title: "Idioms",
    shortTitle: "Idioms",
    description:
      "Learn an idiomatic expression in a target language with meaning, cultural context, and a dialogue.",
    href: "/linguistic/idioms",
    icon: MessageSquareQuote,
    accent: "from-rose-500/15 to-pink-500/15 text-rose-500",
  },
];
