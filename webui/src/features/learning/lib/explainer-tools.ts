// src/features/learning/lib/explainer-tools.ts
/**
 * Registry of all Explainer tools. Single source of truth used by the
 * Learning sidebar, the overview cards, and page metadata.
 * Edit this file to add, reorder, or rename tools.
 */

import {
  Sparkles,
  BookOpenText,
  Map,
  Baby,
  PlayCircle,
  HelpCircle,
  Compass,
  type LucideIcon,
} from "lucide-react";

export interface ExplainerTool {
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

export const explainerTools: ExplainerTool[] = [
  {
    id: "explain",
    title: "Quick Explain",
    shortTitle: "Explain",
    description: "Get a structured, easy-to-digest explanation of any topic with a key takeaway.",
    href: "/learning/explainer?tool=explain",
    icon: Sparkles,
    accent: "from-sky-500/15 to-indigo-500/15 text-sky-500",
  },
  {
    id: "atoz",
    title: "A-to-Z Tutorial",
    shortTitle: "A-to-Z",
    description: "Generate a high-depth, markdown-formatted tutorial covering a topic from A to Z.",
    href: "/learning/explainer?tool=atoz",
    icon: BookOpenText,
    accent: "from-violet-500/15 to-purple-500/15 text-violet-500",
  },
  {
    id: "atozpointer",
    title: "Knowledge Roadmap",
    shortTitle: "Roadmap",
    description: "Build a structured A-to-Z roadmap with concept pointers for guided learning.",
    href: "/learning/explainer?tool=atozpointer",
    icon: Map,
    accent: "from-emerald-500/15 to-teal-500/15 text-emerald-500",
  },
  {
    id: "feynman",
    title: "Feynman Explainer",
    shortTitle: "Feynman",
    description: "Simplify jargon-heavy concepts with child-friendly metaphors and analogies.",
    href: "/learning/explainer?tool=feynman",
    icon: Baby,
    accent: "from-amber-500/15 to-orange-500/15 text-amber-500",
  },
  {
    id: "orchestrate",
    title: "Orchestrated Journey",
    shortTitle: "Journey",
    description: "Stream a live chapter-by-chapter deep dive with a plan, chapters, and analogies.",
    href: "/learning/explainer?tool=orchestrate",
    icon: PlayCircle,
    accent: "from-rose-500/15 to-pink-500/15 text-rose-500",
  },
  {
    id: "socratic",
    title: "Socratic Mentor",
    shortTitle: "Socratic",
    description: "Challenge your understanding through guided discovery questions, not answers.",
    href: "/learning/explainer?tool=socratic",
    icon: HelpCircle,
    accent: "from-blue-500/15 to-cyan-500/15 text-blue-500",
  },
  {
    id: "curriculum",
    title: "Curriculum Path",
    shortTitle: "Curriculum",
    description: "Initialize a personalized learning roadmap that finds the crux of mastery.",
    href: "/learning/explainer?tool=curriculum",
    icon: Compass,
    accent: "from-fuchsia-500/15 to-pink-500/15 text-fuchsia-500",
  },
];
