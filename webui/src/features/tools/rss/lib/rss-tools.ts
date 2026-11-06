// src/features/tools/rss/lib/rss-tools.ts
/**
 * Tool registry for the RSS Feed tool (manager + viewer pages).
 * Consumed by the Tools Hub card grid and the Tools sidebar.
 */
import type { LearningTool } from "@/features/learning/lib/learning-tools";
import { Rss } from "lucide-react";

export const rssTools: LearningTool[] = [
  {
    id: "rss",
    title: "RSS Feed",
    shortTitle: "RSS Feed",
    description:
      "Subscribe to and configure RSS/Atom providers, then browse, search, and filter the latest articles.",
    href: "/tools/rss",
    icon: Rss,
    accent: "from-orange-500/15 to-amber-500/15 text-orange-500",
  },
];
