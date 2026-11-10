// src/features/conceptual-bridge/types.ts
/** Form and result shapes for the Conceptual Bridge Builder. */

export interface BridgeFormValues {
  conceptA: string;
  conceptB: string;
  customUserInput: string;
}

export interface BridgeResult {
  structuralAnalogy: string;
  bridgingNarrative: string;
  insightQuestion: string;
  cognitiveFlexibilityScore: number;
}
