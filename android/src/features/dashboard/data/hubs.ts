// src/features/dashboard/data/hubs.ts
import { GraduationCap, Languages, Swords, Wrench, type LucideIcon } from "lucide-react-native";
import type { Tone } from "@/theme";

export interface HubConfig {
  key: string;
  title: string;
  tagline: string;
  description: string;
  tone: Tone;
  icon: LucideIcon;
}

/** Mirrors the HUBS list in webui/src/app/(authenticated)/dashboard/page.tsx (admin hub omitted for single-user mode). */
export const HUBS: HubConfig[] = [
  {
    key: "learning",
    title: "Learning",
    tagline: "Understand deeply",
    description: "Explainer tools, adaptive tutors, roadmaps, skill trees, and hands-on project ideas.",
    tone: "sky",
    icon: GraduationCap,
  },
  {
    key: "practice",
    title: "Practice",
    tagline: "Sharpen skills",
    description: "Puzzles, riddles, debates, negotiation, bias training, and AI-powered challenge games.",
    tone: "rose",
    icon: Swords,
  },
  {
    key: "linguistic",
    title: "Linguistic",
    tagline: "Master languages",
    description: "Idioms, lessons, translators, roleplay, poetry, and language testing in your target language.",
    tone: "emerald",
    icon: Languages,
  },
  {
    key: "tools",
    title: "Tools",
    tagline: "Build faster",
    description: "Vision conversion, diagrams, charts, content generators, and prompt engineering utilities.",
    tone: "amber",
    icon: Wrench,
  },
];
