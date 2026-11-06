// src/features/learning/lib/resource-suggestor-tools.ts
/**
 * Registry of Resource Suggestor tools. Used by the Learning sidebar and hub.
 */
import { BookMarked } from "lucide-react";
import type { LearningTool } from "./learning-tools";

export const resourceSuggestorTools: LearningTool[] = [
  {
    id: "suggest",
    title: "Resource Suggestor",
    shortTitle: "Resources",
    description: "Get personalized learning resources, a path summary, and next steps based on your background and goals.",
    href: "/learning/resource-suggestor",
    icon: BookMarked,
    accent: "from-amber-500/15 to-orange-500/15 text-amber-600",
  },
];
