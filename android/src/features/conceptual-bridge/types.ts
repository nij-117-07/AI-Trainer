// src/features/conceptual-bridge/types.ts
/** Form and result shapes for the Conceptual Bridge Builder. */

export const ABSTRACTION_DEPTHS = ["surface", "structural", "systemic"] as const;
export type AbstractionDepth = (typeof ABSTRACTION_DEPTHS)[number];

export interface BridgeFormValues {
  conceptA: string;
  conceptB: string;
  abstractionDepth: AbstractionDepth;
}

export interface BridgeResult {
  structuralAnalogy: string;
  bridgingNarrative: string;
  insightQuestion: string;
  cognitiveFlexibilityScore: number;
}
