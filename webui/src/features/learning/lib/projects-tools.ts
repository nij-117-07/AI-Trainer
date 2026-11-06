// src/features/learning/lib/projects-tools.ts
/**
 * Registry of Project Recommender tools. Used by the Learning sidebar and hub.
 */
import { Hammer } from "lucide-react";
import type { LearningTool } from "./learning-tools";

export const projectsTools: LearningTool[] = [
  {
    id: "generate",
    title: "Project Recommender",
    shortTitle: "Projects",
    description: "Get hands-on project ideas matched to your topic, scope, and difficulty level.",
    href: "/learning/projects",
    icon: Hammer,
    accent: "from-blue-500/15 to-indigo-500/15 text-blue-500",
  },
];
