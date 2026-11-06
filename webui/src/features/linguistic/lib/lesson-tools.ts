// src/features/linguistic/lib/lesson-tools.ts
/**
 * Registry of Lesson tools. Used by the Linguistic sidebar and hub.
 */
import { NotebookPen } from "lucide-react";
import type { LearningTool } from "@/features/learning/lib/learning-tools";

export const lessonTools: LearningTool[] = [
  {
    id: "generate",
    title: "Language Lesson",
    shortTitle: "Lesson",
    description:
      "Generate a scaffolded language lesson tuned to your CEFR level, learning focus, and theme.",
    href: "/linguistic/lesson",
    icon: NotebookPen,
    accent: "from-violet-500/15 to-purple-500/15 text-violet-500",
  },
];
