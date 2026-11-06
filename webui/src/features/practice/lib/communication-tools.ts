// src/features/practice/lib/communication-tools.ts
/**
 * Communication & EQ tool registry for the Practice sidebar and hub.
 */
import type { LearningTool } from "@/features/learning/lib/learning-tools";
import { clarityTrainerTools } from "./clarity-trainer-tools";
import { executiveEqTools } from "./executive-eq-tools";
import { jokeCoachTools } from "./joke-coach-tools";
import { negotiationTools } from "./negotiation-tools";

export const communicationTools: LearningTool[] = [
  ...clarityTrainerTools,
  ...executiveEqTools,
  ...jokeCoachTools,
  ...negotiationTools,
];
