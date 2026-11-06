// src/features/practice/lib/interview-tools.ts
/**
 * Tool registry for the Interview Simulator.
 */
import type { LearningTool } from "@/features/learning/lib/learning-tools";
import { Briefcase } from "lucide-react";

export const interviewTools: LearningTool[] = [
  {
    id: "interview",
    title: "Interview Simulator",
    shortTitle: "Interview",
    description:
      "Run a gated mock interview: the session manager plans each move and you approve every step.",
    href: "/practice/interview",
    icon: Briefcase,
    accent: "from-sky-500/15 to-indigo-500/15 text-sky-500",
  },
];
