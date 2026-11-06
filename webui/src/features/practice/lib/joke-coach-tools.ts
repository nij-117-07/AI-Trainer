// src/features/practice/lib/joke-coach-tools.ts
/**
 * Tool registry for the Joke Coach.
 */
import type { LearningTool } from "@/features/learning/lib/learning-tools";
import { Laugh } from "lucide-react";

export const jokeCoachTools: LearningTool[] = [
  {
    id: "joke-coach",
    title: "Joke Coach",
    shortTitle: "Joke Coach",
    description: "Generate, evaluate, rewrite, classify, and practice jokes with crowd simulation feedback.",
    href: "/practice/joke-coach",
    icon: Laugh,
    accent: "from-yellow-500/15 to-amber-500/15 text-yellow-500",
  },
];
