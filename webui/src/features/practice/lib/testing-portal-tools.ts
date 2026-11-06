// src/features/practice/lib/testing-portal-tools.ts
/**
 * Tool registry for the Testing Portal.
 */
import type { LearningTool } from "@/features/learning/lib/learning-tools";
import { ListChecks } from "lucide-react";

export const testingPortalTools: LearningTool[] = [
  {
    id: "testing-portal",
    title: "Testing Portal",
    shortTitle: "Testing Portal",
    description: "Generate MCQs and theoretical questions, get expert answers, and analyze existing questions.",
    href: "/practice/testing-portal",
    icon: ListChecks,
    accent: "from-indigo-500/15 to-blue-500/15 text-indigo-500",
  },
];
