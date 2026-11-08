// src/features/socratic/types.ts

export interface SocraticChallenge {
  logicalFallacyCheck: string | null;
  falsificationQuestion: string;
  edgeCaseScenario: string;
  refinedPerspective: string;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface SocraticRequestValues {
  statement: string;
  history: string[];
  confidence: string;
}
