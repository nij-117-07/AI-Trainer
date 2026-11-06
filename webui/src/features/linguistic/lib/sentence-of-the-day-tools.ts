// src/features/linguistic/lib/sentence-of-the-day-tools.ts
/**
 * Registry of Sentence of the Day tools. Used by the Linguistic sidebar and hub.
 */
import { Quote } from "lucide-react";
import type { LearningTool } from "@/features/learning/lib/learning-tools";

export const sentenceOfTheDayTools: LearningTool[] = [
  {
    id: "generate",
    title: "Sentence of the Day",
    shortTitle: "Sentence of the Day",
    description:
      "Discover the daily featured sentence in a target language with grammar, culture, and variations.",
    href: "/linguistic/sentence-of-the-day",
    icon: Quote,
    accent: "from-teal-500/15 to-cyan-500/15 text-teal-500",
  },
];
