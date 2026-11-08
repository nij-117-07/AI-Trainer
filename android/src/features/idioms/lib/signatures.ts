// src/features/idioms/lib/signatures.ts
/**
 * Ax signature for the Idioms lesson. Instructions and field descriptions live in
 * signature-descriptions.ts, which is copied from Backend/linguistic/idioms/services.py.
 */
import { f } from "@ax-llm/ax";
import { IDIOM_LESSON_DESCRIPTIONS } from "./signature-descriptions";

const lesson = IDIOM_LESSON_DESCRIPTIONS;

export const idiomLessonSignature = f()
  .description(lesson.instruction)
  .input("targetLanguage", f.string(lesson.inputs.targetLanguage))
  .input(
    "userProficiency",
    f.string(`${lesson.inputs.userProficiency} One of: beginner, intermediate, advanced, native-aspirant.`),
  )
  .input("themeOrKeyword", f.string(lesson.inputs.themeOrKeyword))
  .input("nativeLanguage", f.string(lesson.inputs.nativeLanguage))
  .input("rotationSeed", f.string(lesson.inputs.seed))
  .input("customUserRequest", f.string(lesson.inputs.customUserRequest).optional())
  .output("rationale", f.string(lesson.outputs.rationale))
  .output("idiomInTargetLanguage", f.string(lesson.outputs.idiomInTargetLanguage))
  .output("phoneticPronunciation", f.string(lesson.outputs.phoneticPronunciation))
  .output("figurativeMeaning", f.string(lesson.outputs.figurativeMeaning))
  .output("culturalContext", f.string(lesson.outputs.culturalContext))
  .output("equivalentInNativeLanguage", f.string(lesson.outputs.equivalentInNativeLanguage))
  .output("dialogueScenario", f.string(lesson.outputs.dialogueScenario))
  .output("practicePrompt", f.string(lesson.outputs.practicePrompt))
  .build();
