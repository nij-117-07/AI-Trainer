// src/features/practice/lib/negotiation-tools.ts
/**
 * Tool registry for the Negotiation Practice app.
 */
import type { LearningTool } from "@/features/learning/lib/learning-tools";
import { Handshake } from "lucide-react";

export const negotiationTools: LearningTool[] = [
  {
    id: "negotiation",
    title: "Negotiation Practice",
    shortTitle: "Negotiation",
    description: "Bargain with an AI opponent that tracks its internal position, and get tactic-by-tactic feedback.",
    href: "/practice/negotiation",
    icon: Handshake,
    accent: "from-green-500/15 to-emerald-500/15 text-green-500",
  },
];
