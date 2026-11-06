// src/features/linguistic/lib/word-of-the-day-tools.ts
/**
 * Registry of Word of the Day tools. Used by the Linguistic sidebar and hub.
 */
import { CalendarDays } from "lucide-react";
import type { LearningTool } from "@/features/learning/lib/learning-tools";

export const wordOfTheDayTools: LearningTool[] = [
  {
    id: "generate",
    title: "Word of the Day",
    shortTitle: "Word of the Day",
    description:
      "Discover a rich word from a target language with pronunciation, morphology, and history.",
    href: "/linguistic/word-of-the-day",
    icon: CalendarDays,
    accent: "from-amber-500/15 to-yellow-500/15 text-amber-500",
  },
];
