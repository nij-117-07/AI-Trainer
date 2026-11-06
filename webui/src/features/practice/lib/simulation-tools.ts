// src/features/practice/lib/simulation-tools.ts
/**
 * Simulations tool registry for the Practice sidebar and hub.
 */
import type { LearningTool } from "@/features/learning/lib/learning-tools";
import { battlegroundTools } from "./battleground-tools";
import { foresightTrainerTools } from "./foresight-trainer-tools";
import { guessGameTools } from "./guess-game-tools";
import { interviewTools } from "./interview-tools";
import { observationTrainerTools } from "./observation-trainer-tools";

export const simulationTools: LearningTool[] = [
  ...battlegroundTools,
  ...foresightTrainerTools,
  ...guessGameTools,
  ...interviewTools,
  ...observationTrainerTools,
];
