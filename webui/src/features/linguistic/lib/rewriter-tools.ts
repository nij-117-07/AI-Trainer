// src/features/linguistic/lib/rewriter-tools.ts
/**
 * Registry of Rewriter tools. Used by the Linguistic sidebar and hub.
 */
import { Wand2 } from "lucide-react";
import type { LearningTool } from "@/features/learning/lib/learning-tools";

export const rewriterTools: LearningTool[] = [
  {
    id: "process",
    title: "Rewriter",
    shortTitle: "Rewriter",
    description:
      "Rewrite text to improve quality, adjust tone, or change structure while preserving intent.",
    href: "/linguistic/rewriter",
    icon: Wand2,
    accent: "from-sky-500/15 to-blue-500/15 text-sky-500",
  },
];
