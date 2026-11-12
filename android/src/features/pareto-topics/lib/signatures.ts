// src/features/pareto-topics/lib/signatures.ts
/**
 * Ax signature for the 80/20 Topics. Instructions and field descriptions live in
 * signature-descriptions.ts.
 */
import { f } from "@ax-llm/ax";
import { PARETO_TOPICS_DESCRIPTIONS } from "./signature-descriptions";

const pareto = PARETO_TOPICS_DESCRIPTIONS;
const item = pareto.item;

export const paretoTopicsSignature = f()
  .description(pareto.instruction)
  .input("field", f.string(pareto.inputs.field))
  .input("goal", f.string(pareto.inputs.goal))
  .input("level", f.string(pareto.inputs.level))
  .input("customInstructions", f.string(pareto.inputs.customInstructions))
  .output(
    "topics",
    f
      .object(
        {
          title: f.string(item.title),
          why: f.string(item.why),
          keyIdeas: f.string(item.keyIdeas).array(),
          workShare: f.number(item.workShare),
        },
        pareto.outputs.topics,
      )
      .array(),
  )
  .output("skipForNow", f.string(pareto.outputs.skipForNow).array())
  .output("coachNote", f.string(pareto.outputs.coachNote))
  .build();
