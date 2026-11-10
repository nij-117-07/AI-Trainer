// src/features/explainer/lib/signatures.ts
/**
 * Ax signatures for the Explainer tools. Instructions and field descriptions live in
 * signature-descriptions.ts, which is copied from Backend/learning/explainer/services.py.
 */
import { f } from "@ax-llm/ax";
import {
  FEYNMAN_DESCRIPTIONS,
  GENERAL_EXPLAINER_DESCRIPTIONS,
  SOCRATIC_DESCRIPTIONS,
  TUTORIAL_DESCRIPTIONS,
} from "./signature-descriptions";

const general = GENERAL_EXPLAINER_DESCRIPTIONS;
const tutorial = TUTORIAL_DESCRIPTIONS;
const feynman = FEYNMAN_DESCRIPTIONS;
const socratic = SOCRATIC_DESCRIPTIONS;

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

export const feynmanSignature = f()
  .description(feynman.instruction)
  .input("complexTopic", f.string(feynman.inputs.complexTopic))
  .input("targetAge", f.number(feynman.inputs.targetAge))
  .output("explanation", f.string(feynman.outputs.explanation))
  .output("keyMetaphors", f.string(feynman.outputs.keyMetaphors).array())
  .output("funAnalogy", f.string(feynman.outputs.funAnalogy))
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
