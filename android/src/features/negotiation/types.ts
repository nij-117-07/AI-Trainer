// src/features/negotiation/types.ts

export interface ScenarioFormValues {
  difficulty: string;
  domain: string;
}

export interface NegotiationScenario {
  title: string;
  context: string;
  yourRole: string;
  yourGoal: string;
  yourConstraints: string;
  opponentRole: string;
  opponentGoal: string;
  opponentConstraints: string;
  keyIssues: string[];
  startingStanceOpponent: string;
}

/** One transcript line sent to the model. */
export interface ChatTurn {
  role: "user" | "opponent";
  message: string;
}

/** One line shown in the session: a chat message or a coach tip. */
export interface SessionEntry {
  role: "user" | "opponent" | "coach";
  text: string;
}

export interface InternalPosition {
  satisfaction: number;
  willingnessToConcede: string;
  concessionsMade: string[];
  keyDemands: string[];
}

export interface MessageAnalysis {
  tacticsUsed: string[];
  effectivenessRating: number;
  feedbackSnippet: string;
}

export interface TurnResult {
  opponentReply: string;
  internalPosition: InternalPosition;
  analysis: MessageAnalysis;
}

export interface CategoryScores {
  preparation: number;
  communication: number;
  strategy: number;
  listening: number;
  problemSolving: number;
  flexibility: number;
}

export interface SessionReport {
  overallScore: number;
  scoresByCategory: CategoryScores;
  strengths: string[];
  areasForImprovement: string[];
  keyTakeaways: string[];
  suggestedResources: string[];
}

/** The persisted state of one negotiation. */
export interface NegotiationSession {
  id: string;
  scenario: NegotiationScenario;
  log: SessionEntry[];
  complete: boolean;
  finalOutcome: string;
  report: SessionReport | null;
}
