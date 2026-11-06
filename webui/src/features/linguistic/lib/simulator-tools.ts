// src/features/linguistic/lib/simulator-tools.ts
/**
 * Registry of Simulator tools. Used by the Linguistic sidebar and hub.
 */
import { Clapperboard, FileText, MessageCircle } from "lucide-react";
import type { LearningTool } from "@/features/learning/lib/learning-tools";

export const simulatorTools: LearningTool[] = [
  {
    id: "run",
    title: "Simulator Run",
    shortTitle: "Run",
    description:
      "Drop a persona into a scenario and deliver your line for a one-shot behavioral simulation.",
    href: "/linguistic/simulator",
    icon: Clapperboard,
    accent: "from-rose-500/15 to-pink-500/15 text-rose-500",
  },
  {
    id: "chat",
    title: "Simulator Chat",
    shortTitle: "Chat",
    description:
      "Hold a running, in-character conversation with a persona that remembers the whole scene.",
    href: "/linguistic/simulator/chat",
    icon: MessageCircle,
    accent: "from-fuchsia-500/15 to-purple-500/15 text-fuchsia-500",
  },
  {
    id: "prompts",
    title: "Simulator Prompts",
    shortTitle: "Prompts",
    description:
      "Create and edit the persona system prompts stored by the Simulator service.",
    href: "/linguistic/simulator/prompts",
    icon: FileText,
    accent: "from-orange-500/15 to-red-500/15 text-orange-500",
  },
];
