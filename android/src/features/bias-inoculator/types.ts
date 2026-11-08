// src/features/bias-inoculator/types.ts
/** Form and result types for the Cognitive Bias Inoculator. */

export const TARGET_BIASES = ["anchoring", "availability", "confirmation", "sunk_cost", "framing"] as const;
export type TargetBias = (typeof TARGET_BIASES)[number];

/** The form offers "random" as well, which picks a bias before the request is sent. */
export interface BiasFormValues {
  userInterest: string;
  targetBias: string;
}

export interface BiasScenario {
  targetBias: TargetBias;
  scenarioSetup: string;
  intuitiveTrap: string;
  rationalAnalysis: string;
  realWorldApplication: string;
}
