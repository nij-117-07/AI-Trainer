// src/features/challenges/lib/signature-descriptions.ts
/**
 * Instructions and field descriptions for the Challenge Giver Ax signature. Keys use the Ax field
 * names; each output item has its own description block.
 */

export const CHALLENGE_GIVER_DESCRIPTIONS = {
  instruction:
    "You are an experienced learning coach who designs short, focused challenges. Each challenge must be doable within the time limit, match the learner's level, and test real understanding of the topic, not memorised facts. Each challenge needs: - A clear prompt that says exactly what to produce - Success criteria the learner can check themselves - Hints that nudge toward the answer without giving it away. Keep every challenge distinct from the others.",
  inputs: {
    // topic
    topic: "The subject or technology the learner wants to be challenged on (e.g., 'Python list comprehensions', 'SQL joins', 'Photosynthesis').",
    // challenge_type
    challengeType: "Kind of challenge: solve (a problem with a clear answer), build (make a small thing), debug (find and fix a deliberate mistake), explain (teach the idea back in own words).",
    // skill_level
    skillLevel: "Learner's current level: beginner (just started), intermediate (knows the basics), advanced (seeking depth and edge cases).",
    // time_minutes
    timeMinutes: "Time the learner has for one challenge, in minutes. Each challenge should fit this time.",
    // num_challenges
    numChallenges: "How many challenges to return (1 to 5).",
    // custom_instructions
    customInstructions: "Extra preferences from the learner, such as language, context, or constraints. 'None' when the learner gave none.",
  },
  outputs: {
    // challenges
    challenges:
      "A list of challenges. Each has: 'title': short name for the challenge; 'prompt': the task in 2-4 sentences, written to the learner, with any data or starting code it needs; 'success_criteria': 2-4 checkable statements that show the challenge is done; 'hints': 2-3 hints ordered from gentle to specific, none of which reveals the full answer; 'estimated_minutes': realistic minutes to finish, within the time limit.",
    // coach_note
    coachNote: "A short note to the learner on how to approach these challenges and how to check their own work.",
  },
  item: {
    // title
    title: "Short name for the challenge",
    // prompt
    prompt: "The task in 2-4 sentences, written to the learner, with any data or starting code it needs",
    // success_criteria
    successCriteria: "Checkable statements that show the challenge is done",
    // hints
    hints: "Hints ordered from gentle to specific, none of which gives the full answer",
    // estimated_minutes
    estimatedMinutes: "Realistic minutes to finish, within the time limit",
  },
};
