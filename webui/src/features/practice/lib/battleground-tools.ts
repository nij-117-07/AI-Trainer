// src/features/practice/lib/battleground-tools.ts
/**
 * Tool registry for the Battleground Simulator.
 */
import type { LearningTool } from "@/features/learning/lib/learning-tools";
import { Swords } from "lucide-react";

export const battlegroundTools: LearningTool[] = [
  {
    id: "battleground",
    title: "Battleground Simulator",
    shortTitle: "Battleground",
    description: "Fight a strategic battle of wits against an AI opponent across rounds with HP and resources.",
    href: "/practice/battleground",
    icon: Swords,
    accent: "from-red-500/15 to-rose-500/15 text-red-500",
  },
];
