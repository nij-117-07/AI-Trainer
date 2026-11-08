// src/features/foresight-trainer/types.ts
/** Form values, model results, and the saved scenario session for the Foresight Trainer. */

export interface StartFormValues {
  userContext: string;
  mainTheme: string;
  difficulty: string;
  maxScenes: number;
}

export interface ScenarioBlueprint {
  setting: string;
  protagonist: string;
  coreConflict: string;
  stakes: string;
  thinkingSkill: string;
  tone: string;
  hiddenVariables: string[];
}

export interface Scene {
  sceneNarrative: string;
  decisionPoint: string;
  timePressure: string;
  difficultyAdjustment: string | null;
}

export interface ChoiceOption {
  id: string;
  title: string;
  description: string;
  approachType: string;
  riskLevel: string;
  timeCost: string;
  hiddenTradeoff: string;
}

export interface StartResult {
  scene: Scene;
  options: ChoiceOption[];
  customOptionPrompt: string;
  blueprint: ScenarioBlueprint;
  maxScenes: number;
}

export interface DecisionEvaluation {
  scores: Record<string, number>;
  overallScore: number;
  strengths: string[];
  blindSpots: string[];
  thinkingPattern: string;
  oneLesson: string;
}

export interface Consequences {
  immediateEffects: string[];
  delayedEffects: string[];
  hiddenReveal: string;
  newComplication: string;
  relationshipImpact: string;
  resourceChanges: string;
  worldStateUpdate: string;
}

export interface InsightReport {
  patternObservation: string;
  cognitiveBiasAlert: string;
  strengthSpotlight: string;
  growthEdge: string;
  realWorldParallel: string;
  coachingQuestion: string;
}

export interface DecisionRecord {
  sceneNumber: number;
  choiceMade: string;
  approachType: string;
  scores: Record<string, number>;
  thinkingPattern: string;
  keyBlindSpot: string;
}

export interface ProgressReport {
  overallGrowth: string;
  scoreTrajectory: Record<string, unknown>;
  dominantPattern: string;
  underusedStrengths: string[];
  criticalBlindSpot: string;
  bestMoment: string;
  skillAssessment: string;
  recommendedFocus: string;
  archetype: string;
}

export interface DecisionOutcome {
  evaluation: DecisionEvaluation;
  consequences: Consequences;
  insight: InsightReport;
  scenarioComplete: boolean;
  decisionHistory: DecisionRecord[];
  progressReport: ProgressReport | null;
  nextScene: Scene | null;
  nextOptions: ChoiceOption[];
  customOptionPrompt: string | null;
}

/** One entry in the on-screen transcript. */
export interface ScenarioMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ForesightSession {
  theme: string;
  blueprint: ScenarioBlueprint;
  maxScenes: number;
  sceneNumber: number;
  currentScene: Scene;
  options: ChoiceOption[];
  customOptionPrompt: string;
  decisionHistory: DecisionRecord[];
  scenarioComplete: boolean;
  progressReport: ProgressReport | null;
  log: ScenarioMessage[];
}

export interface DecisionInput {
  session: ForesightSession;
  choice: string;
  reasoning: string;
}
