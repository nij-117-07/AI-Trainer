// src/features/language-learner/data/tools.ts
/** Sub-apps shown in the Language Learner menu. Each one opens its own route. */
import {
  BookA,
  BookOpenText,
  CalendarDays,
  Drama,
  Feather,
  GraduationCap,
  Languages,
  MessagesSquare,
  PenLine,
  Quote,
  type LucideIcon,
} from "lucide-react-native";
import type { Tone } from "@/theme";

export interface LanguageTool {
  key: string;
  title: string;
  description: string;
  route: string;
  icon: LucideIcon;
  tone: Tone;
}

export const LANGUAGE_TOOLS: LanguageTool[] = [
  {
    key: "idioms",
    title: "Idioms",
    description: "Explain idiomatic expressions with meaning, cultural context, and real-world usage.",
    route: "/language-learner/idioms",
    icon: Quote,
    tone: "amber",
  },
  {
    key: "word-of-the-day",
    title: "Word of the Day",
    description: "Explore a word in depth: meaning, origin, usage, and example sentences.",
    route: "/language-learner/word-of-the-day",
    icon: BookA,
    tone: "sky",
  },
  {
    key: "sentence-of-the-day",
    title: "Sentence of the Day",
    description: "Learn a sentence each day with its breakdown, translation, and usage notes.",
    route: "/language-learner/sentence-of-the-day",
    icon: CalendarDays,
    tone: "emerald",
  },
  {
    key: "translator",
    title: "Translator",
    description: "Translate text with context, tone, and notes on the choices made.",
    route: "/language-learner/translator",
    icon: Languages,
    tone: "sky",
  },
  {
    key: "rewriter",
    title: "Rewriter",
    description: "Rewrite text in a chosen style, level, or register and explain the changes.",
    route: "/language-learner/rewriter",
    icon: PenLine,
    tone: "rose",
  },
  {
    key: "lesson",
    title: "Language Lesson",
    description: "Generate a structured lesson for the language and level you choose.",
    route: "/language-learner/lesson",
    icon: BookOpenText,
    tone: "emerald",
  },
  {
    key: "poet-engine",
    title: "Poet Engine",
    description: "Explain the poetic devices and language in a poem or verse.",
    route: "/language-learner/poet-engine",
    icon: Feather,
    tone: "rose",
  },
  {
    key: "language-tester",
    title: "Language Tester",
    description: "Test your skills with assessments, fill-in-the-blank, translation challenges, and roleplay.",
    route: "/language-learner/language-tester",
    icon: GraduationCap,
    tone: "amber",
  },
  {
    key: "simulator",
    title: "Simulator",
    description: "Practise real situations with a simulated partner, chat sessions, and custom personas.",
    route: "/language-learner/simulator",
    icon: MessagesSquare,
    tone: "sky",
  },
  {
    key: "roleplay",
    title: "Roleplay",
    description: "Converse in character with a role you choose, and manage your saved roles.",
    route: "/language-learner/roleplay",
    icon: Drama,
    tone: "emerald",
  },
];
