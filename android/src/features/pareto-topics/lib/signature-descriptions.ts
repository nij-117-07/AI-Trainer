// src/features/pareto-topics/lib/signature-descriptions.ts
/**
 * Instructions and field descriptions for the 80/20 Topics Ax signature. Keys use the Ax field
 * names; each output item has its own description block.
 */

export const PARETO_TOPICS_DESCRIPTIONS = {
  instruction:
    "You are an expert mentor who applies the Pareto principle (the 80/20 rule) to learning. Identify the small set of topics (between 3 and 8) that covers most of the day-to-day work in the given field, for the learner's goal and the level they want to reach. Each topic must be: - A core area that people use often in real work, not a rare edge case - Clearly different from the other topics, with no large overlap - Ordered from most to least important. List the topics the learner should study first, and separately list the areas that can wait. Shares of work are rough estimates; say so in the coach note. Never invent a field that is unclear: if the field is too vague, ask for a clearer one in the coach note and return few topics.",
  inputs: {
    // field
    field: "The field or subject the learner wants to work in (e.g., 'Data analysis', 'Web development', 'Accounting').",
    // goal
    goal: "What the learner wants from the field, in their own words (e.g., 'Do the core work', 'Get a first job', 'Switch into it from accounting', 'Talk about it well').",
    // level
    level: "The level the learner wants to achieve, such as beginner (know the basics and do simple tasks), intermediate (work on common tasks without help), advanced (handle hard cases and go deep), or the learner's own description of it.",
    // custom_instructions
    customInstructions: "Extra preferences from the learner, such as tools, budget, or time limits. 'None' when the learner gave none.",
  },
  outputs: {
    // topics
    topics:
      "The core topics to study, most important first. Each has: 'title': short name for the topic; 'why': one sentence on why this topic covers a large share of real work; 'key_ideas': 3-5 specific things to learn within the topic; 'work_share': the rough percent (0 to 100) of day-to-day work in this field that this topic covers, as a whole number.",
    // skip_for_now
    skipForNow: "Short names of areas in the field that are less useful at the start and can wait until the core topics are known.",
    // coach_note
    coachNote: "A short, warm note on how to study these topics in order, and a reminder that the work shares are rough estimates.",
  },
  item: {
    // title
    title: "Short name for the topic",
    // why
    why: "One sentence on why this topic covers a large share of real work",
    // key_ideas
    keyIdeas: "3 to 5 specific things to learn within the topic",
    // work_share
    workShare: "Rough percent of day-to-day work this topic covers, as a whole number from 0 to 100",
  },
};
