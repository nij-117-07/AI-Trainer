// src/features/linguistic/lib/roleplay-tools.ts
/**
 * Registry of Roleplay Module tools. Used by the Linguistic sidebar and hub.
 */
import { Theater, UserCog } from "lucide-react";
import type { LearningTool } from "@/features/learning/lib/learning-tools";

export const roleplayTools: LearningTool[] = [
  {
    id: "chat",
    title: "Roleplay Chat",
    shortTitle: "Chat",
    description:
      "Step into a scene with any persona you describe and hold an in-character conversation.",
    href: "/linguistic/roleplay",
    icon: Theater,
    accent: "from-rose-500/15 to-red-500/15 text-rose-500",
  },
  {
    id: "roles",
    title: "Roleplay Roles",
    shortTitle: "Roles",
    description:
      "Create, edit, and delete the persona system prompts stored by the Roleplay service.",
    href: "/linguistic/roleplay/roles",
    icon: UserCog,
    accent: "from-slate-500/15 to-zinc-500/15 text-slate-500",
  },
];
