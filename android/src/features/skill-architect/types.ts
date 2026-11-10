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

/** The AI's answer to a progress update, kept with the tree so the user can see it later. */
export interface TreeUpdate {
  progressNote: string;
  summary: string;
  nextSteps: string;
  createdAt: string;
}

/** A generated skill tree saved on the device, with the learner's progress. */
export interface SkillArchitectTree {
  id: string;
  topic: string;
  createdAt: string;
  updatedAt: string;
  response: SkillArchitectResponse;
  /** Root skills the learner has finished. Each entry matches a rootSkills value exactly. */
  completedSkills: string[];
  lastUpdate: TreeUpdate | null;
}

export interface ProgressUpdateResult {
  summary: string;
  skillTreeLevels: SkillLevel[];
  completedSkills: string[];
  nextSteps: string;
}

export interface SkillTreeStats {
  levelCount: number;
  rootSkillCount: number;
}
