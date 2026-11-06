// src/features/tools/web-search/lib/web-search-tools.ts
/**
 * Tool registry for the Web Search tool (keyless DuckDuckGo search page).
 * Consumed by the Tools Hub card grid and the Tools sidebar.
 */
import type { LearningTool } from "@/features/learning/lib/learning-tools";
import { Globe } from "lucide-react";

export const webSearchTools: LearningTool[] = [
  {
    id: "web-search",
    title: "Web Search",
    shortTitle: "Web Search",
    description:
      "Search the web with DuckDuckGo — no API key needed — and get clean page links, titles, and snippets.",
    href: "/tools/web-search",
    icon: Globe,
    accent: "from-blue-500/15 to-sky-600/15 text-blue-500",
  },
];
