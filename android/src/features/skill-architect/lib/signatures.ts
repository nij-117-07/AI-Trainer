// src/features/skill-architect/lib/signatures.ts
/**
 * Ax signature for the Skill Architect. Instructions and field descriptions live in
 * signature-descriptions.ts, which is copied from Backend/learning/skill_architect/services.py.
 */
import { f } from "@ax-llm/ax";
import { ROOT_SKILL_DESCRIPTIONS } from "./signature-descriptions";

const root = ROOT_SKILL_DESCRIPTIONS;
const levelFields = root.levelFields;

export const rootSkillSignature = f()
  .description(root.instruction)
  .input("domainOrSkill", f.string(root.inputs.domainOrSkill))
  .input("currentProficiency", f.string(root.inputs.currentProficiency))
  .input("targetMasteryLevel", f.string(root.inputs.targetMasteryLevel))
  .input("learningConstraints", f.string(root.inputs.learningConstraints).optional())
  .output("corePhilosophy", f.string(root.outputs.corePhilosophy))
  .output(
    "skillTreeLevels",
    f
      .object(
        {
          levelName: f.string(levelFields.levelName),
          rootSkills: f.string(levelFields.rootSkills).array(),
          howItWorks: f.string(levelFields.howItWorks),
          proofOfMastery: f.string(levelFields.proofOfMastery),
          unlockCondition: f.string(levelFields.unlockCondition),
        },
        root.outputs.skillTreeLevels,
      )
      .array(),
  )
  .output("criticalBottleneck", f.string(root.outputs.criticalBottleneck))
  .output("strategicNavigation", f.string(root.outputs.strategicNavigation))
  .build();
