// src/features/tools/lib/flexible-writer-tools.ts
/**
 * Tool registry for Flexible Writer.
 */
import type { LearningTool } from "@/features/learning/lib/learning-tools";
import { PenTool } from "lucide-react";

export const flexibleWriterTools: LearningTool[] = [
  {
    id: "flexible-writer",
    title: "Flexible Writer",
    shortTitle: "Flexible Writer",
    description: "Adopt any persona or rule set and transform your input data however you ask.",
    href: "/tools/flexible-writer",
    icon: PenTool,
    accent: "from-indigo-500/15 to-blue-600/15 text-indigo-500",
  },
];
