// src/features/simulator/types.ts
/** Shared types for the Simulator run, chat, and prompts pages. */

export interface SimulationFormValues {
  persona: string;
  scenario: string;
  userInput: string;
  additionalContext: string;
}

export interface SimulationResult {
  simulationId: string;
  thoughtProcess: string;
  chosenAction: string;
  responseDialogue: string;
  emotionalState: string;
}

export interface SimulatorRunState {
  form: SimulationFormValues;
  result: SimulationResult | null;
}

export interface SimulatorChatMessage {
  role: "user" | "assistant";
  content: string;
  thought: string;
}

export interface SimulatorChatState {
  persona: string;
  scenario: string;
  draft: string;
  history: SimulatorChatMessage[];
}

export interface ChatTurnValues {
  persona: string;
  scenario: string;
  history: SimulatorChatMessage[];
  userInput: string;
}

export interface ChatTurnResult {
  thought: string;
  dialogue: string;
}

export interface PromptFormValues {
  name: string;
  content: string;
}

export interface PromptTemplate {
  name: string;
  content: string;
  builtIn: boolean;
}
