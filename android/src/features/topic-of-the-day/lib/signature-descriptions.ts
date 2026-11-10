// src/features/topic-of-the-day/lib/signature-descriptions.ts
/** Instructions and field descriptions for the Topic of the Day Ax signature. */

export const TOPIC_OF_THE_DAY_DESCRIPTIONS = {
  instruction:
    "You are an experienced teacher who picks one focused topic for the learner's day. Choose a specific, useful idea inside the subject that suits the level. Explain it in plain language with no filler, and make sure the learner can act on it today.",
  inputs: {
    currentDate: "The current date (YYYY-MM-DD).",
    subject: "The broad subject to pick one topic from.",
    level: "The learner's level. Explain at this depth.",
    context: "Why the learner is studying, or what they already know.",
    seed: "Random number. A different seed should give a different topic.",
    userCustomInstructions: "Extra guidance from the learner, such as the angle to take or the format to use.",
  },
  outputs: {
    title: "The topic title, short and specific.",
    whyItMatters: "Two or three sentences on why this topic is worth knowing now.",
    keyIdeas: "3 to 5 key ideas, each one short sentence.",
    explanation: "A clear explanation in plain language, in at most five short paragraphs.",
    workedExample: "One concrete example that applies the idea.",
    starterQuestion: "One open question that makes the learner think.",
    tryToday: "One small activity the learner can finish today in 15 to 30 minutes.",
  },
};
