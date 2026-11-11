// src/features/challenges/lib/signatures.ts
/**
 * Ax signature for the Challenge Giver. Instructions and field descriptions live in
 * signature-descriptions.ts.
 */
import { f } from "@ax-llm/ax";
import { CHALLENGE_GIVER_DESCRIPTIONS } from "./signature-descriptions";

const giver = CHALLENGE_GIVER_DESCRIPTIONS;
const item = giver.item;

export const challengeGiverSignature = f()
  .description(giver.instruction)
  .input("topic", f.string(giver.inputs.topic))
  .input("challengeType", f.string(giver.inputs.challengeType))
  .input("skillLevel", f.string(giver.inputs.skillLevel))
  .input("timeMinutes", f.number(giver.inputs.timeMinutes))
  .input("numChallenges", f.number(giver.inputs.numChallenges))
  .input("customInstructions", f.string(giver.inputs.customInstructions))
  .output(
    "challenges",
    f
      .object(
        {
          title: f.string(item.title),
          prompt: f.string(item.prompt),
          successCriteria: f.string(item.successCriteria).array(),
          hints: f.string(item.hints).array(),
          estimatedMinutes: f.number(item.estimatedMinutes),
        },
        giver.outputs.challenges,
      )
      .array(),
  )
  .output("coachNote", f.string(giver.outputs.coachNote))
  .build();
