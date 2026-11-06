// src/features/practice/lib/puzzle-tools.ts
/**
 * Tool registry for the Puzzle Generator.
 */
import type { LearningTool } from "@/features/learning/lib/learning-tools";
import { Puzzle } from "lucide-react";

export const puzzleTools: LearningTool[] = [
  {
    id: "puzzle",
    title: "Puzzle Generator",
    shortTitle: "Puzzles",
    description: "Personalized cognitive puzzles — riddles, logic grids, sequences, wordplay, and ciphers.",
    href: "/practice/puzzle",
    icon: Puzzle,
    accent: "from-rose-500/15 to-pink-500/15 text-rose-500",
  },
];
