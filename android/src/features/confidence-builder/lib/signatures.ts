// src/features/confidence-builder/lib/signatures.ts
/** Ax signature for the Confidence Builder. Instructions and field descriptions live in signature-descriptions.ts. */
import { f } from "@ax-llm/ax";
import { CONFIDENCE_BUILDER_DESCRIPTIONS } from "./signature-descriptions";

const builder = CONFIDENCE_BUILDER_DESCRIPTIONS;
const item = builder.item;

export const confidenceTaskSignature = f()
  .description(builder.instruction)
  .input("focusArea", f.string(builder.inputs.focusArea))
  .input("situation", f.string(builder.inputs.situation))
  .input("comfortLevel", f.string(builder.inputs.comfortLevel))
  .input("customInstructions", f.string(builder.inputs.customInstructions))
  .output(
    "tasks",
    f
      .object(
        {
          title: f.string(item.title),
          why: f.string(item.why),
          steps: f.string(item.steps).array(),
          successSign: f.string(item.successSign),
        },
        builder.outputs.tasks,
      )
      .array(),
  )
  .output("coachNote", f.string(builder.outputs.coachNote))
  .build();
