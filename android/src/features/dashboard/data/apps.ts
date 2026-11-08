// src/features/dashboard/data/apps.ts
/** Every application shown on the dashboard. Each one opens its own route. */
import {
  Bot,
  Brain,
  ClipboardList,
  Drama,
  Flame,
  FolderKanban,
  GraduationCap,
  Library,
  Link2,
  MapPinned,
  MessagesSquare,
  Network,
  Signpost,
  type LucideIcon,
} from "lucide-react-native";
import type { Tone } from "@/theme";

export interface AppCard {
  key: string;
  title: string;
  description: string;
  route: string;
  icon: LucideIcon;
  tone: Tone;
}

export const APPS: AppCard[] = [
  {
    key: "testing-portal",
    title: "Testing Portal",
    description: "Generate MCQs and theoretical questions, write expert answers, and solve MCQs with your AI model.",
    route: "/practice/testing-portal",
    icon: ClipboardList,
    tone: "rose",
  },
  {
    key: "explainer",
    title: "Explainer Tools",
    description: "Explain topics, write A-to-Z tutorials and roadmaps, simplify ideas, and plan your learning.",
    route: "/learning/explainer",
    icon: GraduationCap,
    tone: "sky",
  },
  {
    key: "guides",
    title: "Learning Guides",
    description: "Daily study plans, topic and project suggestions, project blueprints, and guided tasks.",
    route: "/learning/guides",
    icon: Signpost,
    tone: "emerald",
  },
  {
    key: "roadmap",
    title: "Roadmap Planner",
    description: "Build learning roadmaps with main points, subpoints, and progress tracking.",
    route: "/learning/roadmap",
    icon: MapPinned,
    tone: "amber",
  },
  {
    key: "skill-architect",
    title: "Skill Architect",
    description: "Turn a goal into a skill tree and track each skill as you learn it.",
    route: "/learning/skill-architect",
    icon: Network,
    tone: "emerald",
  },
  {
    key: "tutor",
    title: "Tutor",
    description: "Ask a tutor for explanations in the teaching style you choose, with saved prompt templates.",
    route: "/learning/tutor",
    icon: Bot,
    tone: "sky",
  },
  {
    key: "tutor-chat",
    title: "Tutor Chat",
    description: "Chat sessions with a tutor that keeps the thread and breaks down each answer.",
    route: "/learning/tutor-chat",
    icon: MessagesSquare,
    tone: "sky",
  },
  {
    key: "memory-helper",
    title: "Memory Helper",
    description: "Turn material into memory aids such as mnemonics, anchors, and recall cues.",
    route: "/learning/memory-helper",
    icon: Brain,
    tone: "rose",
  },
  {
    key: "motivation",
    title: "Motivation & Reflection",
    description: "Get a quote for the moment and reflect on your progress with guided prompts.",
    route: "/learning/motivation",
    icon: Flame,
    tone: "amber",
  },
  {
    key: "projects",
    title: "Project Recommender",
    description: "Get project ideas matched to your skills, interests, and time.",
    route: "/learning/projects",
    icon: FolderKanban,
    tone: "emerald",
  },
  {
    key: "resource-suggestor",
    title: "Resource Suggestor",
    description: "Find books, courses, and articles that fit the topic and your level.",
    route: "/learning/resource-suggestor",
    icon: Library,
    tone: "sky",
  },
  {
    key: "conceptual-bridge",
    title: "Conceptual Bridge",
    description: "Connect a new idea to something you already know, with a bridge explanation and check questions.",
    route: "/learning/conceptual-bridge",
    icon: Link2,
    tone: "rose",
  },
  {
    key: "roleplay-chatbot",
    title: "Roleplay Chatbot",
    description: "Practise a conversation with a character you define, who stays in role.",
    route: "/learning/roleplay-chatbot",
    icon: Drama,
    tone: "amber",
  },
];
