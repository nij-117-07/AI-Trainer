// src/features/creative-assets/lib/signatures.ts
/**
 * Ax signature for the Creative Assets generator. Instructions and field descriptions live in
 * signature-descriptions.ts, which is copied from Backend/tools/creative_assets/services.py.
 */
import { f } from "@ax-llm/ax";
import { CREATIVE_ASSET_DESCRIPTIONS, CREATIVE_MORE_DESCRIPTIONS } from "./signature-descriptions";
import { TASK_TYPES } from "../options";

const creative = CREATIVE_ASSET_DESCRIPTIONS;
const more = CREATIVE_MORE_DESCRIPTIONS;

export const creativeAssetMoreSignature = f()
  .description(more.instruction)
  .input("taskType", f.string(`${creative.inputs.taskType} Common types: ${TASK_TYPES.join(", ")}. Any other asset type is also accepted.`))
  .input("userQuery", f.string(creative.inputs.userQuery))
  .input("context", f.string(creative.inputs.context).optional())
  .input("likedSuggestions", f.string(more.inputs.likedSuggestions))
  .input("userInstructions", f.string(more.inputs.userInstructions).optional())
  .input("numberOfSuggestions", f.number(creative.inputs.numberOfSuggestions))
  .output(
    "suggestions",
    f
      .object(
        {
          suggestion: f.string("The generated name, title, or tag."),
          explanation: f.string("Why this aligns with the user's preference and is effective for the target audience."),
        },
        creative.outputs.suggestions,
      )
      .array(),
  )
  .build();

export const creativeAssetSignature = f()
  .description(creative.instruction)
  .input("taskType", f.string(`${creative.inputs.taskType} Common types: ${TASK_TYPES.join(", ")}. Any other asset type is also accepted.`))
  .input("userQuery", f.string(creative.inputs.userQuery))
  .input("context", f.string(creative.inputs.context).optional())
  .input("referenceExamples", f.string(creative.inputs.referenceExamples).optional())
  .input("numberOfSuggestions", f.number(creative.inputs.numberOfSuggestions))
  .output(
    "suggestions",
    f
      .object(
        {
          suggestion: f.string("The generated name, title, or tag."),
          explanation: f.string("Why this aligns with the user's preference and is effective for the target audience."),
        },
        creative.outputs.suggestions,
      )
      .array(),
  )
  .build();
