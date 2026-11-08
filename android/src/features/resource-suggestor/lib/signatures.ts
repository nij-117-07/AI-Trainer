// src/features/resource-suggestor/lib/signatures.ts
/**
 * Ax signature for the Resource Suggestor. Instructions and field descriptions live in
 * signature-descriptions.ts, which is copied from Backend/learning/resource_suggestor/services.py.
 */
import { f } from "@ax-llm/ax";
import { RESOURCE_SUGGESTOR_DESCRIPTIONS } from "./signature-descriptions";

const suggestor = RESOURCE_SUGGESTOR_DESCRIPTIONS;
const item = suggestor.item;

export const resourceSuggestorSignature = f()
  .description(suggestor.instruction)
  .input("backgroundSubject", f.string(suggestor.inputs.backgroundSubject))
  .input("targetTopic", f.string(suggestor.inputs.targetTopic))
  .input("additionalPreferences", f.string(suggestor.inputs.additionalPreferences))
  .output("learningPathSummary", f.string(suggestor.outputs.learningPathSummary))
  .output(
    "recommendedResources",
    f
      .object(
        {
          title: f.string(item.title),
          type: f.string(item.type),
          authorOrCreator: f.string(item.authorOrCreator),
          description: f.string(item.description),
          difficultyLevel: f.string(item.difficultyLevel),
          estimatedTime: f.string(item.estimatedTime),
          whyRecommended: f.string(item.whyRecommended),
          prerequisiteKnowledge: f.string(item.prerequisiteKnowledge),
          accessInfo: f.string(item.accessInfo),
        },
        suggestor.outputs.recommendedResources,
      )
      .array(),
  )
  .output("nextSteps", f.string(suggestor.outputs.nextSteps))
  .build();
