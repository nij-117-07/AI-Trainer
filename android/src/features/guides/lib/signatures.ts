// src/features/guides/lib/signatures.ts
/**
 * Ax signatures for the Learning Guides tools. Instructions and field descriptions live in
 * signature-descriptions.ts, which is copied from Backend/learning/guides/services.py.
 */
import { f } from "@ax-llm/ax";
import { TASK_GUIDE_DESCRIPTIONS, WHAT_TO_LEARN_DESCRIPTIONS } from "./signature-descriptions";

const task = TASK_GUIDE_DESCRIPTIONS;
const topics = WHAT_TO_LEARN_DESCRIPTIONS;

export const taskGuideSignature = f()
  .description(task.instruction)
  .input("randomSeed", f.string(task.inputs.randomSeed))
  .input("learningSubject", f.string(task.inputs.learningSubject))
  .input("targetGoal", f.string(task.inputs.targetGoal))
  .input("currentLevel", f.string(task.inputs.currentLevel))
  .input("numTasks", f.number(task.inputs.numTasks))
  .input("previousTasks", f.string(task.inputs.previousTasks).optional())
  .input("customInstructions", f.string(task.inputs.customInstructions).optional())
  .output("mentorFeedback", f.string(task.outputs.mentorFeedback))
  .output(
    "taskList",
    f
      .object(
        {
          title: f.string("Name of the project/task."),
          description: f.string("Detailed explanation of what to build."),
          difficulty: f.string("Easy, Medium, or Hard relative to current level."),
          learningOutcomes: f.string("Key concepts this task reinforces.").array(),
          estimatedHours: f.number("Estimated time to complete, in whole hours."),
        },
        task.outputs.taskList,
      )
      .array(),
  )
  .build();

export const whatToLearnSignature = f()
  .description(topics.instruction)
  .input("broaderTopic", f.string(topics.inputs.broaderTopic))
  .input("specificInterest", f.string(topics.inputs.specificInterest))
  .input("learnedBefore", f.string(topics.inputs.learnedBefore))
  .input("previousSuggestions", f.string(topics.inputs.previousSuggestions).optional())
  .input("customUserInput", f.string(topics.inputs.customUserInput).optional())
  .input("topicLevel", f.string(topics.inputs.topicLevel))
  .input("seedUuid", f.string(topics.inputs.seedUuid))
  .output(
    "recommendations",
    f
      .object(
        {
          topicName: f.string("The specific subject name."),
          reason: f.string("Why this is a good next step."),
        },
        topics.outputs.recommendations,
      )
      .array(),
  )
  .build();
