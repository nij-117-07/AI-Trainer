// src/features/clarity-trainer/types.ts
/** Types and enum values for the Clarity Trainer. Enum values match the backend Literal types. */

export const DIFFICULTY_VALUES = ["easy", "medium", "hard", "advanced"] as const;
export const CATEGORY_VALUES = [
  "team update",
  "giving feedback",
  "difficult conversation",
  "pitch or ask",
  "status report",
  "conflict resolution",
  "presentation opening",
  "email",
  "negotiation",
  "apology",
] as const;
export const VERBOSITY_VALUES = ["concise", "moderate", "verbose", "redundant"] as const;
export const CLARITY_VALUES = ["excellent", "good", "fair", "poor"] as const;

export type Difficulty = (typeof DIFFICULTY_VALUES)[number];
export type Verbosity = (typeof VERBOSITY_VALUES)[number];
export type ClarityScore = (typeof CLARITY_VALUES)[number];

export interface ScenarioFormValues {
  difficulty: string;
  category: string;
  userContext: string;
}

export interface CommunicationScenario {
  title: string;
  situation: string;
  characters: string[];
  goal: string;
  constraints: string[];
  promptToUser: string;
  idealLengthSeconds: number;
  difficulty: Difficulty;
}

export interface ResponseAnalysis {
  verbosity: Verbosity;
  wordCount: number;
  fillerWords: string[];
  redundantPhrases: string[];
  clarity: ClarityScore;
  goalAchievement: number;
  toneFit: number;
  coreMessage: string;
  scenarioFitNote: string;
}

export interface CoachFeedback {
  score: number;
  whatWorked: string[];
  whatToCut: string[];
  whatToAdd: string[];
  rewriteSuggestion: string;
  onePrinciple: string;
  coachMessage: string;
}

export interface BetterVersion {
  rewritten: string;
  originalWords: number;
  newWords: number;
  percentReduced: number;
  whyBetter: string[];
}

export interface GoldStandard {
  opening: string;
  fullResponse: string;
  whyIdeal: string[];
  wordCount: number;
  seconds: number;
}

export interface ClarityEvaluation {
  userResponse: string;
  analysis: ResponseAnalysis;
  feedback: CoachFeedback;
  betterVersion: BetterVersion;
  goldStandard: GoldStandard;
}

/** One practice round kept on the device: the scenario, the user's reply, and the review. */
export interface ClarityRound {
  scenario: CommunicationScenario;
  response: string;
  evaluation: ClarityEvaluation | null;
}
