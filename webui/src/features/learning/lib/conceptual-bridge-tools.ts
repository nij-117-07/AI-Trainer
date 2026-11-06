// src/features/learning/lib/conceptual-bridge-tools.ts
/**
 * Tool registry for the Conceptual Bridge Builder.
 */
import type { LearningTool } from "@/features/learning/lib/learning-tools";
import { Link2 } from "lucide-react";

export const conceptualBridgeTools: LearningTool[] = [
  {
    id: "conceptual-bridge",
    title: "Conceptual Bridge Builder",
    shortTitle: "Conceptual Bridge",
    description: "Connect two seemingly unrelated concepts through deep structural analogies.",
    href: "/learning/conceptual-bridge",
    icon: Link2,
    accent: "from-violet-500/15 to-purple-500/15 text-violet-500",
  },
];
