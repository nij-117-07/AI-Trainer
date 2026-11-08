// src/features/rewriter/lib/signatures.ts
/**
 * Ax signature for the Rewriter. Instructions and field descriptions live in
 * signature-descriptions.ts, which is copied from Backend/linguistic/rewriter/services.py.
 */
import { f } from "@ax-llm/ax";
import { TEXT_REWRITER_DESCRIPTIONS } from "./signature-descriptions";

const rewriter = TEXT_REWRITER_DESCRIPTIONS;

export const textRewriterSignature = f()
  .description(rewriter.instruction)
  .input("originalText", f.string(rewriter.inputs.originalText))
  .input("targetTone", f.string(rewriter.inputs.targetTone))
  .input("audience", f.string(rewriter.inputs.audience))
  .input("transformationGoal", f.string(rewriter.inputs.transformationGoal))
  .input("customInstructions", f.string(rewriter.inputs.customInstructions))
  .output("rationale", f.string(rewriter.outputs.rationale))
  .output("rewrittenText", f.string(rewriter.outputs.rewrittenText))
  .output(
    "improvementsMade",
    f.string(rewriter.outputs.improvementsMade).array(),
  )
  .build();
