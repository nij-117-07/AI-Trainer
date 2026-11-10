// src/features/skill-architect/lib/signatures.ts
/**
 * Ax signatures for the Skill Architect. Instructions and field descriptions live in
 * signature-descriptions.ts. The root-skill signature is copied from Backend/learning/skill_architect/services.py.
 */
import { f } from "@ax-llm/ax";
import { PROGRESS_UPDATE_DESCRIPTIONS, ROOT_SKILL_DESCRIPTIONS } from "./signature-descriptions";

const root = ROOT_SKILL_DESCRIPTIONS;
const levelFields = root.levelFields;

function levelList(description: string) {
  return f
    .object(
      {
        levelName: f.string(levelFields.levelName),
        rootSkills: f.string(levelFields.rootSkills).array(),
        howItWorks: f.string(levelFields.howItWorks),
        proofOfMastery: f.string(levelFields.proofOfMastery),
        unlockCondition: f.string(levelFields.unlockCondition),
      },
      description,
    )
    .array();
}

export const rootSkillSignature = f()
  .description(root.instruction)
  .input("domainOrSkill", f.string(root.inputs.domainOrSkill))
  .input("currentProficiency", f.string(root.inputs.currentProficiency))
  .input("targetMasteryLevel", f.string(root.inputs.targetMasteryLevel))
  .input("learningConstraints", f.string(root.inputs.learningConstraints).optional())
  .output("corePhilosophy", f.string(root.outputs.corePhilosophy))
  .output("skillTreeLevels", levelList(root.outputs.skillTreeLevels))
  .output("criticalBottleneck", f.string(root.outputs.criticalBottleneck))
  .output("strategicNavigation", f.string(root.outputs.strategicNavigation))
  .build();

const progress = PROGRESS_UPDATE_DESCRIPTIONS;

export const progressUpdateSignature = f()
  .description(progress.instruction)
  .input("topic", f.string(progress.inputs.topic))
  .input("currentTree", f.string(progress.inputs.currentTree))
  .input("progressNote", f.string(progress.inputs.progressNote))
  .output("summary", f.string(progress.outputs.summary))
  .output("skillTreeLevels", levelList(progress.outputs.skillTreeLevels))
  .output("completedSkills", f.string(progress.outputs.completedSkills).array())
  .output("nextSteps", f.string(progress.outputs.nextSteps))
  .build();
