// src/features/socratic/types.ts

export const FOCUS_VALUES = ["challenge", "both-sides", "assumptions"] as const;

export type SocraticFocus = (typeof FOCUS_VALUES)[number];

export interface SocraticChallenge {
  logicalFallacyCheck: string | null;
  hiddenAssumption: string;
  strongestCounterargument: string;
  bothSidesView: string;
  probingQuestion: string;
}

export interface SocraticSynthesis {
  strongestCaseForUserView: string;
  strongestCaseAgainstUserView: string;
  sharedGround: string;
  unresolvedQuestions: string[];
  refinedPosition: string;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  /** "summary" marks the wrap-up that closes a discussion. */
  kind?: "turn" | "summary";
  /** Set on a reply that was stopped before it finished. */
  stopped?: boolean;
}

export interface SocraticChallengeValues {
  statement: string;
  history: string[];
  confidence: string;
  focus: SocraticFocus;
}

export interface SocraticSynthesisValues {
  history: string[];
  confidence: string;
}
