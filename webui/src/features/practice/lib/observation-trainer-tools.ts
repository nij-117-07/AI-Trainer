// src/features/practice/lib/observation-trainer-tools.ts
/**
 * Tool registry for the Observation Trainer.
 */
import type { LearningTool } from "@/features/learning/lib/learning-tools";
import { Eye } from "lucide-react";

export const observationTrainerTools: LearningTool[] = [
  {
    id: "observation-trainer",
    title: "Observation Trainer",
    shortTitle: "Observation",
    description: "Upload an image, report what you notice, and get scored on accuracy, relevance, and missed details.",
    href: "/practice/observation-trainer",
    icon: Eye,
    accent: "from-sky-500/15 to-cyan-500/15 text-sky-500",
  },
];
