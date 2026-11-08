// src/features/tutor/lib/signatures.ts
/**
 * Ax signature for the adaptive tutor. Instructions and field descriptions live in
 * signature-descriptions.ts, which is copied from Backend/learning/tutor/services.py.
 */
import { f } from "@ax-llm/ax";
import { ADAPTIVE_TUTOR_DESCRIPTIONS } from "./signature-descriptions";

const tutor = ADAPTIVE_TUTOR_DESCRIPTIONS;

export const adaptiveTutorSignature = f()
  .description(tutor.instruction)
  .input("systemPrompt", f.string(tutor.inputs.systemPrompt))
  .input("userQuery", f.string(tutor.inputs.userQuery))
  .input("studentLevel", f.string(tutor.inputs.studentLevel))
  .input("learningStyle", f.string(tutor.inputs.learningStyle))
  .input("currentScenario", f.string(tutor.inputs.currentScenario))
  .input(
    "chatHistory",
    f
      .object(
        {
          role: f.string("The speaker: user, assistant, or system."),
          content: f.string("The message body."),
        },
        tutor.inputs.chatHistory,
      )
      .array(),
  )
  .input("lastTopicTaught", f.string(tutor.inputs.lastTopicTaught).optional())
  .output("adaptedExplanation", f.string(tutor.outputs.adaptedExplanation))
  .output("conceptAnalogy", f.string(tutor.outputs.conceptAnalogy).optional())
  .output("tutorFeedback", f.string(tutor.outputs.tutorFeedback))
  .build();
