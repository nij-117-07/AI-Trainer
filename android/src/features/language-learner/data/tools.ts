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
  PenLine,
  Quote,
  SlidersHorizontal,
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
    key: "language-profiles",
    title: "Language Profiles",
    description: "Languages used by every sub-app",
    route: "/language-learner/profiles",
    icon: SlidersHorizontal,
    tone: "amber",
  },
  {
    key: "idioms",
    title: "Idioms",
    description: "Meaning and usage of idioms",
    route: "/language-learner/idioms",
    icon: Quote,
    tone: "amber",
  },
  {
    key: "word-of-the-day",
    title: "Word of the Day",
    description: "Meaning, origin, and examples",
    route: "/language-learner/word-of-the-day",
    icon: BookA,
    tone: "sky",
  },
  {
    key: "sentence-of-the-day",
    title: "Sentence of the Day",
    description: "A daily sentence, broken down",
    route: "/language-learner/sentence-of-the-day",
    icon: CalendarDays,
    tone: "emerald",
  },
  {
    key: "translator",
    title: "Translator",
    description: "Translate with context and notes",
    route: "/language-learner/translator",
    icon: Languages,
    tone: "sky",
  },
  {
    key: "rewriter",
    title: "Rewriter",
    description: "Rewrite in a new style or level",
    route: "/language-learner/rewriter",
    icon: PenLine,
    tone: "rose",
  },
  {
    key: "lesson",
    title: "Language Lesson",
    description: "A structured lesson by level",
    route: "/language-learner/lesson",
    icon: BookOpenText,
    tone: "emerald",
  },
  {
    key: "poet-engine",
    title: "Poet Engine",
    description: "Explain the devices in a poem",
    route: "/language-learner/poet-engine",
    icon: Feather,
    tone: "rose",
  },
  {
    key: "language-tester",
    title: "Language Tester",
    description: "Quizzes and translation challenges",
    route: "/language-learner/language-tester",
    icon: GraduationCap,
    tone: "amber",
  },
  {
    key: "roleplay",
    title: "Roleplay",
    description: "Talk in character with a role",
    route: "/language-learner/roleplay",
    icon: Drama,
    tone: "emerald",
  },
];
