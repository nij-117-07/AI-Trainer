// src/features/learning/lib/skill-architect-tools.ts
/**
 * Registry of Skill Architect tools. Used by the Learning sidebar and hub.
 */
import { TreePine } from "lucide-react";
import type { LearningTool } from "./learning-tools";

export const skillArchitectTools: LearningTool[] = [
  {
    id: "generate",
    title: "Skill Architect",
    shortTitle: "Skill Architect",
    description:
      "Deconstruct a domain into its root skills and a level-wise progression tree with proof of mastery.",
    href: "/learning/skill-architect",
    icon: TreePine,
    accent: "from-emerald-500/15 to-lime-500/15 text-emerald-500",
  },
];
