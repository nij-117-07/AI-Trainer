// src/features/linguistic/lib/language-tester-tools.ts
/**
 * Registry of Language Tester tools. Used by the Linguistic sidebar and hub.
 */
import { Bot, ListChecks, Repeat, TextCursorInput } from "lucide-react";
import type { LearningTool } from "@/features/learning/lib/learning-tools";

export const languageTesterTools: LearningTool[] = [
  {
    id: "assessment",
    title: "Language Tester",
    shortTitle: "MCQ Test",
    description:
      "Generate a personalized multiple-choice assessment tuned to your CEFR level and scenario.",
    href: "/linguistic/language-tester",
    icon: ListChecks,
    accent: "from-emerald-500/15 to-teal-500/15 text-emerald-500",
  },
  {
    id: "fib",
    title: "Fill in the Blank",
    shortTitle: "Fill in the Blank",
    description:
      "Generate sentence-completion questions and get answers evaluated for typos and grammar.",
    href: "/linguistic/language-tester/fib",
    icon: TextCursorInput,
    accent: "from-cyan-500/15 to-sky-500/15 text-cyan-500",
  },
  {
    id: "challenge",
    title: "Translation Challenge",
    shortTitle: "Challenge",
    description:
      "Generate an active or passive translation challenge and compare with the reference answer.",
    href: "/linguistic/language-tester/challenge",
    icon: Repeat,
    accent: "from-blue-500/15 to-indigo-500/15 text-blue-500",
  },
  {
    id: "roleplay",
    title: "Roleplay Coach",
    shortTitle: "Roleplay Coach",
    description:
      "Converse with a character and get grammar feedback, a fluency score, and suggested strategies.",
    href: "/linguistic/language-tester/roleplay",
    icon: Bot,
    accent: "from-lime-500/15 to-green-500/15 text-lime-500",
  },
];
