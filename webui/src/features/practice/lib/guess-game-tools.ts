// src/features/practice/lib/guess-game-tools.ts
/**
 * Tool registry for the Guess Game.
 */
import type { LearningTool } from "@/features/learning/lib/learning-tools";
import { Gamepad2 } from "lucide-react";

export const guessGameTools: LearningTool[] = [
  {
    id: "guess-game",
    title: "Guess Game",
    shortTitle: "Guess Game",
    description: "Guess a hidden mystery item using increasingly revealing hints, with an AI coach on your side.",
    href: "/practice/guess-game",
    icon: Gamepad2,
    accent: "from-fuchsia-500/15 to-pink-500/15 text-fuchsia-500",
  },
];
