// src/features/guides/lib/signatures.ts
/**
 * Ax signatures for the Learning Guides tools. Instructions and field descriptions live in
 * signature-descriptions.ts, which is copied from Backend/learning/guides/services.py.
 */
import { f } from "@ax-llm/ax";
import {
  DAILY_PLANNER_DESCRIPTIONS,
  PROJECT_ARCHITECT_DESCRIPTIONS,
  PROJECT_SUGGESTOR_DESCRIPTIONS,
  TASK_GUIDE_DESCRIPTIONS,
  WHAT_TO_LEARN_DESCRIPTIONS,
} from "./signature-descriptions";

const task = TASK_GUIDE_DESCRIPTIONS;
const daily = DAILY_PLANNER_DESCRIPTIONS;
const architect = PROJECT_ARCHITECT_DESCRIPTIONS;
const topics = WHAT_TO_LEARN_DESCRIPTIONS;
const projects = PROJECT_SUGGESTOR_DESCRIPTIONS;

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

export const dailyPlannerSignature = f()
  .description(daily.instruction)
  .input("randomSeed", f.string(daily.inputs.randomSeed))
  .input("masterTopic", f.string(daily.inputs.masterTopic))
  .input("subtopicPreference", f.string(daily.inputs.subtopicPreference).optional())
  .input(
    "userLevel",
    f.string(`${daily.inputs.userLevel} One of: beginner, intermediate, advanced.`),
  )
  .input(
    "targetMastery",
    f.string(
      `${daily.inputs.targetMastery} One of: familiarity, competency, expert-level troubleshooting, architectural-design.`,
    ),
  )
  .input("existingKnowledge", f.string(daily.inputs.existingKnowledge))
  .input(
    "learningFocus",
    f.string(`${daily.inputs.learningFocus} One of: practical, debugging, theoretical, project-based.`),
  )
  .input("previouslyLearnedTopics", f.string(daily.inputs.previouslyLearnedTopics).optional())
  .output("learningObjective", f.string(daily.outputs.learningObjective))
  .output("masteryGapAnalysis", f.string(daily.outputs.masteryGapAnalysis))
  .output("structuredRoadmap", f.string(daily.outputs.structuredRoadmap).array())
  .output("recommendedExercise", f.string(daily.outputs.recommendedExercise))
  .output("resourceSuggestions", f.string(daily.outputs.resourceSuggestions))
  .build();

export const projectArchitectSignature = f()
  .description(architect.instruction)
  .input("randomSeed", f.string(architect.inputs.randomSeed))
  .input("masterTopic", f.string(architect.inputs.masterTopic))
  .input("subtopicFocus", f.string(architect.inputs.subtopicFocus))
  .input("targetMastery", f.string(architect.inputs.targetMastery))
  .input("preferredIndustry", f.string(architect.inputs.preferredIndustry).optional())
  .output("projectName", f.string(architect.outputs.projectName))
  .output("industryContext", f.string(architect.outputs.industryContext))
  .output("problemStatement", f.string(architect.outputs.problemStatement))
  .output("technicalRequirements", f.string(architect.outputs.technicalRequirements).array())
  .output("stretchGoals", f.string(architect.outputs.stretchGoals).array())
  .output("validationCriteria", f.string(architect.outputs.validationCriteria))
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

export const projectSuggestorSignature = f()
  .description(projects.instruction)
  .input("topic", f.string(projects.inputs.topic))
  .input("industry", f.string(projects.inputs.industry))
  .input("numUseCases", f.number(projects.inputs.numUseCases))
  .input("existingSuggestions", f.string(projects.inputs.existingSuggestions).optional())
  .input("userInstructions", f.string(projects.inputs.userInstructions).optional())
  .input("randomSeed", f.string(projects.inputs.randomSeed))
  .output("briefStrategy", f.string(projects.outputs.briefStrategy))
  .output(
    "projects",
    f
      .object(
        {
          title: f.string("A professional project name."),
          problem: f.string("The specific industry pain point."),
          keyFeatures: f.string("Summary of the 3 most important features."),
        },
        projects.outputs.projects,
      )
      .array(),
  )
  .build();
