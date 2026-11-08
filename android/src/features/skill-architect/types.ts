// src/features/skill-architect/types.ts

export interface SkillArchitectFormValues {
  domainOrSkill: string;
  currentProficiency: string;
  targetMasteryLevel: string;
  learningConstraints: string;
}

export interface SkillArchitectRequest {
  domainOrSkill: string;
  currentProficiency: string;
  targetMasteryLevel: string;
  learningConstraints?: string;
}

export interface SkillLevel {
  levelName: string;
  rootSkills: string[];
  howItWorks: string;
  proofOfMastery: string;
  unlockCondition: string;
}

export interface SkillArchitectResponse {
  corePhilosophy: string;
  skillTreeLevels: SkillLevel[];
  criticalBottleneck: string;
  strategicNavigation: string;
}

/** A generated skill tree saved on the device. */
export interface SkillArchitectTree {
  id: string;
  topic: string;
  createdAt: string;
  updatedAt: string;
  response: SkillArchitectResponse;
}

export interface SkillTreeStats {
  levelCount: number;
  rootSkillCount: number;
}
