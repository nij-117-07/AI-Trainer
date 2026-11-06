// src/features/practice/lib/clarity-trainer-tools.ts
/**
 * Tool registry for the Clarity Trainer.
 */
import type { LearningTool } from "@/features/learning/lib/learning-tools";
import { MessageSquareText } from "lucide-react";

export const clarityTrainerTools: LearningTool[] = [
  {
    id: "clarity-trainer",
    title: "Clarity Trainer",
    shortTitle: "Clarity Trainer",
    description: "Practice crisp communication on real scenarios and get verbosity, clarity, and rewrite feedback.",
    href: "/practice/clarity-trainer",
    icon: MessageSquareText,
    accent: "from-teal-500/15 to-emerald-500/15 text-teal-500",
  },
];
