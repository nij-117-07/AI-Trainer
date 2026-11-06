// src/features/linguistic/lib/poet-engine-tools.ts
/**
 * Registry of Poet Engine tools. Used by the Linguistic sidebar and hub.
 */
import { Feather } from "lucide-react";
import type { LearningTool } from "@/features/learning/lib/learning-tools";

export const poetEngineTools: LearningTool[] = [
  {
    id: "explain",
    title: "Poet Engine",
    shortTitle: "Poet Engine",
    description:
      "Explain the 'Soul' of a word using AI-driven poetic philology — etymology, poetry, and metaphor.",
    href: "/linguistic/poet-engine",
    icon: Feather,
    accent: "from-fuchsia-500/15 to-pink-500/15 text-fuchsia-500",
  },
];
