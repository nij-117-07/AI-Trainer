// src/features/tools/lib/social-posts-tools.ts
/**
 * Tool registry for Social Media Post Generator.
 */
import type { LearningTool } from "@/features/learning/lib/learning-tools";
import { Megaphone } from "lucide-react";

export const socialPostsTools: LearningTool[] = [
  {
    id: "social-posts",
    title: "Social Media Post Generator",
    shortTitle: "Social Posts",
    description: "Generate platform-specific social posts with designer notes, matched to your brand voice.",
    href: "/tools/social-posts",
    icon: Megaphone,
    accent: "from-sky-500/15 to-blue-500/15 text-sky-500",
  },
];
