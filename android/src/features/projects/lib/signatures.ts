// src/features/projects/lib/signatures.ts
/**
 * Ax signature for the Project Recommender. Instructions and field descriptions live in
 * signature-descriptions.ts, which is copied from Backend/learning/projects/services.py.
 */
import { f } from "@ax-llm/ax";
import { PROJECT_RECOMMENDER_DESCRIPTIONS } from "./signature-descriptions";

const recommender = PROJECT_RECOMMENDER_DESCRIPTIONS;
const item = recommender.item;

export const projectRecommenderSignature = f()
  .description(recommender.instruction)
  .input("topic", f.string(recommender.inputs.topic))
  .input("projectSize", f.string(recommender.inputs.projectSize))
  .input("difficultyLevel", f.string(recommender.inputs.difficultyLevel))
  .input("numRecommendations", f.number(recommender.inputs.numRecommendations))
  .output(
    "projects",
    f
      .object(
        {
          title: f.string(item.title),
          description: f.string(item.description),
          keyConcepts: f.string(item.keyConcepts).array(),
          estimatedHours: f.number(item.estimatedHours),
          prerequisites: f.string(item.prerequisites).array(),
          deliverables: f.string(item.deliverables).array(),
          stretchGoals: f.string(item.stretchGoals).array(),
        },
        recommender.outputs.projects,
      )
      .array(),
  )
  .output("advice", f.string(recommender.outputs.advice))
  .build();
