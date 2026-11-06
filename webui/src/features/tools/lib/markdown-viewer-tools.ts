// src/features/tools/lib/markdown-viewer-tools.ts
/**
 * Tool registry for Markdown Viewer.
 */
import type { LearningTool } from "@/features/learning/lib/learning-tools";
import { FileText } from "lucide-react";

export const markdownViewerTools: LearningTool[] = [
  {
    id: "markdown-viewer",
    title: "Markdown Viewer",
    shortTitle: "Markdown Viewer",
    description: "Edit Markdown and instantly preview the rendered output.",
    href: "/tools/markdown-viewer",
    icon: FileText,
    accent: "from-sky-500/15 to-cyan-600/15 text-sky-500",
  },
];