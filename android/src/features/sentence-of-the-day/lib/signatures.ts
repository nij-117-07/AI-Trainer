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
    f.string(`${d.inputs.contextSetting} Preset options: business, casual, literary, romantic, travel. Any other setting is also accepted.`),
  )
  .input(
    "complexityLevel",
    f.string(`${d.inputs.complexityLevel} Preset options: beginner, intermediate, advanced, native-level. Any other level is also accepted.`),
  )
  .input("seed", f.string(d.inputs.seed))
  .input("userCustomInstructions", f.string(d.inputs.userCustomInstructions).optional())
  .output("targetSentence", f.string(d.outputs.targetSentence))
  .output("literalTranslation", f.string(d.outputs.literalTranslation))
  .output("naturalTranslation", f.string(d.outputs.naturalTranslation))
  .output("grammaticalHighlight", f.string(d.outputs.grammaticalHighlight))
  .output("culturalContext", f.string(d.outputs.culturalContext))
  .output("substitutionOptions", f.string(d.outputs.substitutionOptions).array())
  .build();
