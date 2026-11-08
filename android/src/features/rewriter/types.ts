// src/features/rewriter/types.ts

export interface RewriteFormValues {
  originalText: string;
  targetTone: string;
  audience: string;
  transformationGoal: string;
  customInstructions: string;
}

export interface RewriteResult {
  rationale: string;
  rewrittenText: string;
  improvementsMade: string[];
}
