// src/features/tutor-chat/lib/signatures.ts
/**
 * Ax signature for one tutor chat turn. Instructions and field descriptions live in
 * signature-descriptions.ts, which is copied from Backend/learning/tutor_chat/services.py.
 */
import { f } from "@ax-llm/ax";
import { TUTOR_CHAT_DESCRIPTIONS } from "./signature-descriptions";

const tutor = TUTOR_CHAT_DESCRIPTIONS;

export const tutorTurnSignature = f()
  .description(tutor.instruction)
  .input("masterTopic", f.string(tutor.inputs.masterTopic))
  .input("additionalContext", f.string(tutor.inputs.additionalContext).optional())
  .input("chatHistory", f.string(tutor.inputs.chatHistory))
  .input("userInput", f.string(tutor.inputs.userInput))
  .output("tutorResponse", f.string(tutor.outputs.tutorResponse))
  .output(
    "educationalBreakdown",
    f
      .object(
        {
          title: f.string(tutor.breakdownFields.title),
          description: f.string(tutor.breakdownFields.description),
        },
        tutor.outputs.educationalBreakdown,
      )
      .array(),
  )
  .build();
