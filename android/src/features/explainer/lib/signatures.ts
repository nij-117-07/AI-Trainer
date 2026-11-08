// src/features/explainer/lib/signatures.ts
/**
 * Ax signatures for the Explainer tools. Instructions and field descriptions live in
 * signature-descriptions.ts, which is copied from Backend/learning/explainer/services.py.
 */
import { f } from "@ax-llm/ax";
import {
  ATOZ_ROADMAP_DESCRIPTIONS,
  CURRICULUM_DESCRIPTIONS,
  FEYNMAN_DESCRIPTIONS,
  GENERAL_EXPLAINER_DESCRIPTIONS,
  JOURNEY_CHAPTER_DESCRIPTIONS,
  JOURNEY_PLAN_DESCRIPTIONS,
  SOCRATIC_DESCRIPTIONS,
  TUTORIAL_DESCRIPTIONS,
} from "./signature-descriptions";

const general = GENERAL_EXPLAINER_DESCRIPTIONS;
const tutorial = TUTORIAL_DESCRIPTIONS;
const roadmap = ATOZ_ROADMAP_DESCRIPTIONS;
const feynman = FEYNMAN_DESCRIPTIONS;
const journeyPlan = JOURNEY_PLAN_DESCRIPTIONS;
const journeyChapter = JOURNEY_CHAPTER_DESCRIPTIONS;
const socratic = SOCRATIC_DESCRIPTIONS;
const curriculum = CURRICULUM_DESCRIPTIONS;

export const explainSignature = f()
  .description(general.instruction)
  .input("topic", f.string(general.inputs.topic))
  .input("expertiseLevel", f.string(general.inputs.expertiseLevel))
  .input("context", f.string(general.inputs.context).optional())
  .output("explanation", f.string(general.outputs.explanation))
  .output("keyTakeaway", f.string(general.outputs.keyTakeaway))
  .build();

export const tutorialSignature = f()
  .description(tutorial.instruction)
  .input("topic", f.string(tutorial.inputs.topic))
  .input("expertiseLevel", f.string(tutorial.inputs.expertiseLevel))
  .input("explanationStyle", f.string(tutorial.inputs.explanationStyle))
  .output("fullExplanation", f.string(tutorial.outputs.fullExplanation))
  .build();

export const atozRoadmapSignature = f()
  .description(roadmap.instruction)
  .input("topic", f.string(roadmap.inputs.topic))
  .input("expertiseLevel", f.string(roadmap.inputs.expertiseLevel))
  .input("explanationStyle", f.string(roadmap.inputs.explanationStyle))
  .output("summary", f.string(roadmap.outputs.summary))
  .output(
    "knowledgeRoadmap",
    f
      .object(
        {
          concept: f.string("The name of the principle or step."),
          explanation: f.string("A detailed description based on the style and level."),
        },
        roadmap.outputs.knowledgeRoadmap,
      )
      .array(),
  )
  .output("practicalTakeaway", f.string(roadmap.outputs.practicalTakeaway))
  .build();

export const feynmanSignature = f()
  .description(feynman.instruction)
  .input("complexTopic", f.string(feynman.inputs.complexTopic))
  .input("targetAge", f.number(feynman.inputs.targetAge))
  .output("explanation", f.string(feynman.outputs.explanation))
  .output("keyMetaphors", f.string(feynman.outputs.keyMetaphors).array())
  .output("funAnalogy", f.string(feynman.outputs.funAnalogy))
  .build();

export const journeyPlanSignature = f()
  .description(journeyPlan.instruction)
  .input("topic", f.string(journeyPlan.inputs.topic))
  .input("depthLevel", f.string(journeyPlan.inputs.depthLevel))
  .output("chapterTitles", f.string(journeyPlan.outputs.chapterTitles).array())
  .output("corePrerequisites", f.string(journeyPlan.outputs.corePrerequisites).array())
  .build();

export const journeyChapterSignature = f()
  .description(journeyChapter.instruction)
  .input("fullTopic", f.string(journeyChapter.inputs.fullTopic))
  .input("currentChapter", f.string(journeyChapter.inputs.currentChapter))
  .input("otherChapters", f.string(journeyChapter.inputs.otherChapters))
  .output("technicalExplanation", f.string(journeyChapter.outputs.technicalExplanation))
  .output("keyTerms", f.string(journeyChapter.outputs.keyTerms).array())
  .output("mentalModelAnalogy", f.string(journeyChapter.outputs.mentalModelAnalogy))
  .build();

export const socraticSignature = f()
  .description(socratic.instruction)
  .input("topic", f.string(socratic.inputs.topic))
  .input("context", f.string(socratic.inputs.context))
  .input("userInstructions", f.string(socratic.inputs.userInstructions).optional())
  .input("level", f.string(socratic.inputs.level))
  .input("questionCategory", f.string(socratic.inputs.questionCategory))
  .input("numQuestions", f.number(socratic.inputs.numQuestions))
  .output("pedagogicalGoal", f.string(socratic.outputs.pedagogicalGoal))
  .output(
    "questionsForDiscovery",
    f
      .object(
        {
          questionText: f.string("The Socratic inquiry."),
          cognitiveChallenge: f.string("What part of the learner's thinking this tickles."),
          guidingHint: f.string("A nudge or thought experiment, with no answers."),
        },
        socratic.outputs.questionsForDiscovery,
      )
      .array(),
  )
  .build();

export const curriculumSignature = f()
  .description(curriculum.instruction)
  .input("topic", f.string(curriculum.inputs.topic))
  .input("context", f.string(curriculum.inputs.context))
  .input("pastLearning", f.string(curriculum.inputs.pastLearning))
  .input("userLevel", f.string(curriculum.inputs.userLevel))
  .input("userHopes", f.string(curriculum.inputs.userHopes))
  .input("variationSeed", f.string(curriculum.inputs.variationSeed))
  .input("additionalInstructions", f.string(curriculum.inputs.additionalInstructions).optional())
  .output("rationale", f.string(curriculum.outputs.rationale))
  .output("theCrux", f.string(curriculum.outputs.theCrux))
  .output(
    "learningRoadmap",
    f
      .object(
        {
          phase: f.string("e.g. Bridge, Deep Dive, Challenge."),
          description: f.string("What will be covered in this phase."),
          learningObjective: f.string("The goal of this phase."),
        },
        curriculum.outputs.learningRoadmap,
      )
      .array(),
  )
  .output("suggestedFocus", f.string(curriculum.outputs.suggestedFocus))
  .build();
