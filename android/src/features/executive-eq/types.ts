// src/features/executive-eq/types.ts
/** Form values, model results, and the saved simulation session for the Executive EQ Trainer. */

export interface ScenarioFormValues {
  userRole: string;
  narrativeArc: string;
  learningFocus: string;
  difficultyLevel: string;
  industryContext: string;
}

export interface NpcProfile {
  name: string;
  title: string;
  personality: string;
  hiddenMotive: string;
  tell: string;
}

export interface ScenarioResult {
  scenarioTitle: string;
  settingDescription: string;
  npcProfile: NpcProfile;
  initialStakes: string;
  openingHook: string;
}

export interface TurnResult {
  rationale: string;
  meetingScenario: string;
  npcDialogue: string;
  eqCoachMessage: string;
  suggestedStrategies: string[];
}

export interface EvaluationResult {
  subtextAccuracy: string;
  statusImpact: string;
  strategicGrade: string;
  strengths: string[];
  criticalFlaws: string[];
  theRewrittenProMove: string;
  coachingTip: string;
}

/** One line of dialogue in the model's history. The NPC is "npc"; the user is "user". */
export interface DialogueTurn {
  role: "user" | "npc";
  content: string;
}

/** One entry in the on-screen transcript. */
export interface SimulationMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ExecutiveEqSession {
  scenario: ScenarioResult;
  learningFocus: string;
  narrativeArc: string;
  chatHistory: DialogueTurn[];
  log: SimulationMessage[];
  grades: EvaluationResult[];
  lastBriefing: TurnResult | null;
  scenarioContext: string;
  npcLastStatement: string;
}

export interface RespondInput {
  session: ExecutiveEqSession;
  response: string;
}

export interface RespondResult {
  evaluation: EvaluationResult;
  nextMove: TurnResult;
}
