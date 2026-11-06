// src/features/learning/lib/learning-tools.ts
/**
 * Shared shape for every Learning tool registry (Explainer, Guides, Memory,
 * Motivation, Projects). New registries reuse this interface so components
 * like ToolsCardGrid and the sidebar stay generic.
 */
import type { LucideIcon } from "lucide-react";

export interface LearningTool {
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
