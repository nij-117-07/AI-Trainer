// src/features/lesson/lib/signatures.ts
/**
 * Ax signature for the Language Lesson. Instructions and field descriptions live in
 * signature-descriptions.ts, which is copied from Backend/linguistic/lesson/services.py.
 */
import { f } from "@ax-llm/ax";
import { LESSON_DESCRIPTIONS } from "./signature-descriptions";

const d = LESSON_DESCRIPTIONS;

export const languageLessonSignature = f()
  .description(d.instruction)
  .input("nativeLanguage", f.string(d.inputs.nativeLanguage))
  .input("targetLanguage", f.string(d.inputs.targetLanguage))
  .input("currentLevel", f.string(`${d.inputs.currentLevel} One of: A1, A2, B1, B2, C1, C2.`))
  .input("lastLessonSummary", f.string(d.inputs.lastLessonSummary).optional())
  .input(
    "learningFocus",
    f.string(`${d.inputs.learningFocus} One of: Grammar, Vocabulary, Conversation, Culture, Pronunciation.`),
  )
  .input("complexityWeight", f.string(`${d.inputs.complexityWeight} One of: Low, Medium, High.`))
  .input("seed", f.string(d.inputs.seed))
  .input("userCustomInstruction", f.string(d.inputs.userCustomInstruction).optional())
  .output("lessonHeader", f.string(d.outputs.lessonHeader))
  .output("comparativeAnalysis", f.string(d.outputs.comparativeAnalysis))
  .output("conceptDeepDive", f.string(d.outputs.conceptDeepDive))
  .output(
    "thematicVocabulary",
    f
      .object(
        {
          word: f.string(d.vocabulary.word),
          ipa: f.string(d.vocabulary.ipa),
          translation: f.string(d.vocabulary.translation),
          example: f.string(d.vocabulary.example),
        },
        d.outputs.thematicVocabulary,
      )
      .array(),
  )
  .output("practiceSuite", f.string(d.outputs.practiceSuite).array())
  .output("culturalNuance", f.string(d.outputs.culturalNuance))
  .output("homeworkMission", f.string(d.outputs.homeworkMission))
  .build();
