// src/features/skill-architect/lib/signature-descriptions.ts
/**
 * Instructions and field descriptions for the Ax signature. The text is copied from the DSPy
 * RootSkillArchitect signature in Backend/learning/skill_architect/services.py, so both stacks
 * give the model the same guidance. Keys use the Ax field names; the matching DSPy field is
 * noted beside each key.
 */

export const ROOT_SKILL_DESCRIPTIONS = {
  instruction:
    "You are an expert Skill Architect and 'Root Skill Teller'.\n\nYour task is NOT to create a generic syllabus or roadmap. Instead, you must\ndeconstruct a domain into its fundamental 'root skills' and structure them\ninto a strict, level-wise progression tree.\n\nFor each level, you must define the core competencies, explain the underlying\nmechanics (how things actually work), and define the exact conditions required\nto unlock the next level of mastery.",
  inputs: {
    // domain_or_skill
    domainOrSkill: "The main subject, craft, or profession the user wants to master.",
    // current_proficiency
    currentProficiency: "The user's current level (e.g., absolute beginner, self-taught, intermediate).",
    // target_mastery_level
    targetMasteryLevel: "The desired end goal (e.g., Competent Professional, Industry Expert, Master).",
    // learning_constraints
    learningConstraints: "Specific constraints like time, resources, or preferred learning style.",
  },
  outputs: {
    // core_philosophy
    corePhilosophy:
      "The 'root' nature of this skill: the fundamental truth or mental model of this domain at its core.",
    // skill_tree_levels
    skillTreeLevels:
      "A structured, level-wise progression tree (e.g., Level 1: The Roots, Level 2: The Trunk,\nLevel 3: The Branches, Level 4: Mastery). Each level dictionary MUST contain exactly:\n- 'level_name': The stage name and its primary focus.\n- 'root_skills': List of absolute core, non-negotiable competencies required at this stage.\n- 'how_it_works': Deep explanation of the underlying mechanics, principles, or 'hidden rules'.\n- 'proof_of_mastery': A specific milestone, project, or test to prove mastery of this level.\n- 'unlock_condition': The exact prerequisite needed to transition to the next level.",
    // critical_bottleneck
    criticalBottleneck:
      "The single most important 'root skill' or concept most people fail to grasp, which causes plateaus.",
    // strategic_navigation
    strategicNavigation:
      "Actionable advice on how to practice effectively, avoid common learning traps, and accelerate.",
  },
  levelFields: {
    // level_name
    levelName: "The stage name and its primary focus.",
    // root_skills
    rootSkills: "List of absolute core, non-negotiable competencies required at this stage.",
    // how_it_works
    howItWorks: "Deep explanation of the underlying mechanics, principles, or 'hidden rules'.",
    // proof_of_mastery
    proofOfMastery: "A specific milestone, project, or test to prove mastery of this level.",
    // unlock_condition
    unlockCondition: "The exact prerequisite needed to transition to the next level.",
  },
};

/**
 * Android-only progress update. The learner has finished some skills and asks what to do next, so
 * the model returns the updated tree with the completed skills and the next steps.
 */
export const PROGRESS_UPDATE_DESCRIPTIONS = {
  instruction:
    "You are a Skill Architect coaching a learner through their skill tree. The learner reports what they have done and asks what comes next. Update the tree, keeping the same levels and skills wherever they still fit. Add or reword skills only when the learner's progress shows a real gap. Respect the learner's own edits in currentTree and do not drop unfinished skills unless they are clearly redundant. Be concrete and encouraging.",
  inputs: {
    topic: "The subject of the skill tree.",
    currentTree:
      "JSON of the current skill tree: skillTreeLevels and completedSkills. Keep the learner's wording where possible.",
    progressNote: "What the learner has done since the last update, and where they are stuck or what they want next.",
  },
  outputs: {
    summary: "A short read of the learner's progress, in two or three sentences.",
    skillTreeLevels:
      "The updated level-wise progression tree, in the same shape as currentTree. Each level must contain exactly level_name, root_skills, how_it_works, proof_of_mastery, and unlock_condition.",
    completedSkills:
      "Every root skill from skillTreeLevels that the learner has finished, copied exactly as written there.",
    nextSteps: "The next two or three concrete actions, and the proof of mastery to aim for.",
  },
};
