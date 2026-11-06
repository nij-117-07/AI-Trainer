// src/features/learning/lib/tutor-chat-tools.ts
/**
 * Registry of Tutor Chat tools. Used by the Learning sidebar and hub.
 */
import { MessagesSquare } from "lucide-react";
import type { LearningTool } from "./learning-tools";

export const tutorChatTools: LearningTool[] = [
  {
    id: "chat",
    title: "Tutor Chat",
    shortTitle: "Tutor Chat",
    description:
      "A topic-scoped chatbot that explains concepts conversationally and breaks them down each turn.",
    href: "/learning/tutor-chat",
    icon: MessagesSquare,
    accent: "from-amber-500/15 to-orange-500/15 text-amber-500",
  },
];
