// src/features/practice/lib/socratic-tools.ts
/**
 * Tool registry for the Socratic Challenger.
 */
import type { LearningTool } from "@/features/learning/lib/learning-tools";
import { MessagesSquare } from "lucide-react";

export const socraticTools: LearningTool[] = [
  {
    id: "socratic",
    title: "Socratic Challenger",
    shortTitle: "Socratic",
    description: "Stress-test your opinions with falsification questions, edge cases, and logical fallacy checks.",
    href: "/practice/socratic",
    icon: MessagesSquare,
    accent: "from-blue-500/15 to-indigo-500/15 text-blue-500",
  },
];
