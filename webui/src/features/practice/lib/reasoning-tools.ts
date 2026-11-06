// src/features/practice/lib/reasoning-tools.ts
/**
 * Reasoning & Logic tool registry for the Practice sidebar and hub.
 */
import type { LearningTool } from "@/features/learning/lib/learning-tools";
import { biasInoculatorTools } from "./bias-inoculator-tools";
import { debateTools } from "./debate-tools";
import { puzzleTools } from "./puzzle-tools";
import { riddleTools } from "./riddle-tools";
import { socraticTools } from "./socratic-tools";

export const reasoningTools: LearningTool[] = [
  ...biasInoculatorTools,
  ...puzzleTools,
  ...riddleTools,
  ...socraticTools,
  ...debateTools,
];
