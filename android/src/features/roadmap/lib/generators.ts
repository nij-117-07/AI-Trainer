// src/features/roadmap/lib/generators.ts
/**
 * Roadmap generators. generateRoadmapPlan writes the expert persona and then the main points,
 * as the backend does. generateSubtopics expands one main point. Inputs are validated first, and
 * model output is checked field by field before it reaches the screens.
 */
import { ax } from "@ax-llm/ax";
import type { AiSettings } from "@/features/ai-settings/types";
import { createLlm } from "@/features/ai-settings/lib/llm";
import type { ExpansionRequest, RoadmapExpansion, RoadmapFormValues, RoadmapPlan } from "../types";
import { listOf, textOf } from "./normalize";
import { mainTopicSignature, personaSignature, subtopicSignature } from "./signatures";
import { normalizeMode, optionalText, requireText, ROADMAP_LIMITS } from "./validation";

const TEMPERATURE = 0.7;

function nonEmptyLines(values: unknown): string[] {
  return listOf(values)
    .map((value) => textOf(value).trim())
    .filter((value) => value !== "");
}

export async function generateRoadmapPlan(settings: AiSettings, values: RoadmapFormValues): Promise<RoadmapPlan> {
  const subject = requireText(values.subject, "Subject", ROADMAP_LIMITS.subject);
  const startLevel = requireText(values.startLevel, "Start level", ROADMAP_LIMITS.level);
  const targetLevel = requireText(values.targetLevel, "Target level", ROADMAP_LIMITS.level);
  const mode = normalizeMode(values.mode);
  const personaStyle = requireText(values.personaStyle, "Persona style", ROADMAP_LIMITS.personaStyle);
  const userInstructions = optionalText(values.userInstructions, ROADMAP_LIMITS.instructions);

  const llm = createLlm(settings);
  const options = { modelConfig: { temperature: TEMPERATURE } };

  const personaResult = await ax(personaSignature).forward(
    llm,
    { learningTopic: subject, targetLevel, personaRequirements: personaStyle },
    options,
  );
  const persona = textOf(personaResult.generatedPersonaPrompt).trim();
  if (!persona) throw new Error("The model did not return a persona. Please try again.");

  const topicResult = await ax(mainTopicSignature).forward(
    llm,
    {
      persona,
      learningTopic: subject,
      currentLevel: startLevel,
      targetLevel,
      roadmapType: mode,
      userInstructions,
    },
    options,
  );

  return { persona, mainTopics: nonEmptyLines(topicResult.mainTopics) };
}

export async function generateSubtopics(settings: AiSettings, request: ExpansionRequest): Promise<RoadmapExpansion> {
  const persona = requireText(request.persona, "Persona", ROADMAP_LIMITS.persona);
  const subject = requireText(request.subject, "Subject", ROADMAP_LIMITS.subject);
  const targetLevel = requireText(request.targetLevel, "Target level", ROADMAP_LIMITS.level);
  const currentModule = requireText(request.currentModule, "Main point", ROADMAP_LIMITS.title);

  const llm = createLlm(settings);
  const result = await ax(subtopicSignature).forward(
    llm,
    {
      persona,
      learningTopic: subject,
      userTargetLevel: targetLevel,
      fullTopicList: request.fullTopicList.join("\n"),
      currentModule,
      roadmapType: normalizeMode(request.mode),
    },
    { modelConfig: { temperature: TEMPERATURE } },
  );

  return {
    subtopics: nonEmptyLines(result.subtopics),
    milestone: textOf(result.milestone).trim(),
  };
}
