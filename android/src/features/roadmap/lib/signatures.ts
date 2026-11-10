// src/features/roadmap/lib/signatures.ts
/**
 * Ax signatures for the Roadmap Planner. Instructions and field descriptions live in
 * signature-descriptions.ts, which is copied from Backend/learning/roadmap/services.py.
 */
import { f } from "@ax-llm/ax";
import {
  MAIN_TOPIC_DESCRIPTIONS,
  PERSONA_DESCRIPTIONS,
  SUBTOPIC_DESCRIPTIONS,
} from "./signature-descriptions";

const persona = PERSONA_DESCRIPTIONS;
const mainTopic = MAIN_TOPIC_DESCRIPTIONS;
const subtopic = SUBTOPIC_DESCRIPTIONS;

export const personaSignature = f()
  .description(persona.instruction)
  .input("learningTopic", f.string(persona.inputs.learningTopic))
  .input("targetLevel", f.string(persona.inputs.targetLevel))
  .input("personaRequirements", f.string(persona.inputs.personaRequirements).optional())
  .output("generatedPersonaPrompt", f.string(persona.outputs.generatedPersonaPrompt))
  .build();

export const mainTopicSignature = f()
  .description(mainTopic.instruction)
  .input("persona", f.string(mainTopic.inputs.persona))
  .input("learningTopic", f.string(mainTopic.inputs.learningTopic))
  .input("currentLevel", f.string(mainTopic.inputs.currentLevel))
  .input("targetLevel", f.string(mainTopic.inputs.targetLevel))
  .input("roadmapType", f.string(mainTopic.inputs.roadmapType))
  .input("userInstructions", f.string(mainTopic.inputs.userInstructions).optional())
  .output("mainTopics", f.string(mainTopic.outputs.mainTopics).array())
  .build();

export const subtopicSignature = f()
  .description(subtopic.instruction)
  .input("persona", f.string(subtopic.inputs.persona))
  .input("learningTopic", f.string(subtopic.inputs.learningTopic))
  .input("userTargetLevel", f.string(subtopic.inputs.userTargetLevel))
  .input("fullTopicList", f.string(subtopic.inputs.fullTopicList))
  .input("currentModule", f.string(subtopic.inputs.currentModule))
  .input("roadmapType", f.string(subtopic.inputs.roadmapType))
  .input("userInstructions", f.string(subtopic.inputs.userInstructions).optional())
  .input("existingSubtopics", f.string(subtopic.inputs.existingSubtopics).optional())
  .output("subtopics", f.string(subtopic.outputs.subtopics).array())
  .output("milestone", f.string(subtopic.outputs.milestone))
  .build();
