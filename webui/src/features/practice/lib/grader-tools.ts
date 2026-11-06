// src/features/practice/lib/grader-tools.ts
/**
 * Tool registry for the Performance Grader.
 */
import type { LearningTool } from "@/features/learning/lib/learning-tools";
import { Gauge } from "lucide-react";

export const graderTools: LearningTool[] = [
  {
    id: "grader",
    title: "Performance Grader",
    shortTitle: "Performance Grader",
    description: "Grade a text or image answer against a target objective with a score and constructive feedback.",
    href: "/practice/grader",
    icon: Gauge,
    accent: "from-emerald-500/15 to-teal-500/15 text-emerald-500",
  },
];
