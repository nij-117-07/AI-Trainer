// src/features/learning/lib/guides-tools.ts
/**
 * Registry of all Learning Guides tools. Single source of truth used by the
 * Learning sidebar, the overview cards, and page metadata.
 * Edit this file to add, reorder, or rename tools.
 */

import {
  ListChecks,
  CalendarDays,
  DraftingCompass,
  Lightbulb,
  FolderGit2,
  type LucideIcon,
} from "lucide-react";

export interface GuidesTool {
  /** Stable unique id (used for storage keys and metadata) */
  id: string;
  /** Human-friendly title */
  title: string;
  /** Short label for the sidebar */
  shortTitle: string;
  /** One-line description shown on cards */
  description: string;
  /** Route within the learning area */
  href: string;
  /** Icon used across the UI */
  icon: LucideIcon;
  /** Tailwind gradient for overview cards */
  accent: string;
}

export const guidesTools: GuidesTool[] = [
  {
    id: "task",
    title: "Guide Tasks",
    shortTitle: "Tasks",
    description: "Get mentor feedback and a set of actionable tasks that push you toward your goal.",
    href: "/learning/guides/task",
    icon: ListChecks,
    accent: "from-cyan-500/15 to-sky-500/15 text-cyan-500",
  },
  {
    id: "daily-plan",
    title: "Daily Study Plan",
    shortTitle: "Daily Plan",
    description: "Generate a detailed daily study plan with a structured roadmap and gap analysis.",
    href: "/learning/guides/daily-plan",
    icon: CalendarDays,
    accent: "from-amber-500/15 to-yellow-500/15 text-amber-500",
  },
  {
    id: "project-blueprint",
    title: "Project Blueprint",
    shortTitle: "Blueprint",
    description: "Generate a unique, industry-specific project blueprint with requirements and validation.",
    href: "/learning/guides/project-blueprint",
    icon: DraftingCompass,
    accent: "from-indigo-500/15 to-blue-500/15 text-indigo-500",
  },
  {
    id: "suggest-topics",
    title: "Topic Suggestions",
    shortTitle: "Topics",
    description: "Get next-topic recommendations that build on your knowledge without repeating past suggestions.",
    href: "/learning/guides/suggest-topics",
    icon: Lightbulb,
    accent: "from-emerald-500/15 to-green-500/15 text-emerald-500",
  },
  {
    id: "suggest-projects",
    title: "Project Suggestions",
    shortTitle: "Projects",
    description: "Generate strategic project use cases for a technology and industry pairing.",
    href: "/learning/guides/suggest-projects",
    icon: FolderGit2,
    accent: "from-rose-500/15 to-red-500/15 text-rose-500",
  },
];
