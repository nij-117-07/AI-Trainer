// src/features/practice/lib/foresight-trainer-tools.ts
/**
 * Tool registry for the Foresight Trainer.
 */
import type { LearningTool } from "@/features/learning/lib/learning-tools";
import { Compass } from "lucide-react";

export const foresightTrainerTools: LearningTool[] = [
  {
    id: "foresight-trainer",
    title: "Foresight Trainer",
    shortTitle: "Foresight",
    description: "Step into immersive decision scenarios, make consequential choices, and grow your strategic thinking.",
    href: "/practice/foresight-trainer",
    icon: Compass,
    accent: "from-blue-500/15 to-cyan-500/15 text-blue-500",
  },
];
