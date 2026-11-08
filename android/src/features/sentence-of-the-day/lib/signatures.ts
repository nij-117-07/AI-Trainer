// src/features/sentence-of-the-day/lib/signatures.ts
/**
 * Ax signature for the Sentence of the Day. Instructions and field descriptions live in
 * signature-descriptions.ts, which is copied from Backend/linguistic/sentence_of_the_day/services.py.
 */
import { f } from "@ax-llm/ax";
import { SENTENCE_DESCRIPTIONS } from "./signature-descriptions";

const d = SENTENCE_DESCRIPTIONS;

export const sentenceOfTheDaySignature = f()
  .description(d.instruction)
  .input("sentenceDate", f.string(d.inputs.sentenceDate))
  .input("targetLanguage", f.string(d.inputs.targetLanguage))
  .input("nativeLanguage", f.string(d.inputs.nativeLanguage))
  .input(
    "contextSetting",
    f.string(`${d.inputs.contextSetting} One of: business, casual, literary, romantic, travel.`),
  )
  .input(
    "complexityLevel",
    f.string(`${d.inputs.complexityLevel} One of: beginner, intermediate, advanced, native-level.`),
  )
  .input("seed", f.string(d.inputs.seed))
  .output("targetSentence", f.string(d.outputs.targetSentence))
  .output("literalTranslation", f.string(d.outputs.literalTranslation))
  .output("naturalTranslation", f.string(d.outputs.naturalTranslation))
  .output("grammaticalHighlight", f.string(d.outputs.grammaticalHighlight))
  .output("culturalContext", f.string(d.outputs.culturalContext))
  .output("substitutionOptions", f.string(d.outputs.substitutionOptions).array())
  .build();
