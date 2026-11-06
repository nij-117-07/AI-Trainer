// src/features/tools/lib/diagram-tools.ts
/**
 * Tool registry for Diagram Generator.
 */
import type { LearningTool } from "@/features/learning/lib/learning-tools";
import { GitBranch } from "lucide-react";

export const diagramTools: LearningTool[] = [
  {
    id: "diagram",
    title: "Diagram Generator",
    shortTitle: "Diagram",
    description: "Generate or refine Mermaid and Draw.io diagram code from natural language.",
    href: "/tools/diagram",
    icon: GitBranch,
    accent: "from-slate-500/15 to-zinc-500/15 text-slate-500",
  },
];
