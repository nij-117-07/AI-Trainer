// src/features/confidence-builder/lib/signature-descriptions.ts
/** Instructions and field descriptions for the Confidence Builder Ax signature. Keys use the Ax field names. */

export const CONFIDENCE_BUILDER_DESCRIPTIONS = {
  instruction:
    "You are a supportive confidence coach who gives people small, real-world actions that build confidence step by step. Each task must be: - Specific and observable, so the learner knows when it is done - Small enough to finish within a few days - Easy enough to succeed at, with a gentle step up from the learner's comfort level - Safe and respectful to the people involved. Never suggest anything that could hurt, embarrass, or pressure someone. Do not give therapy or diagnosis. If the learner describes distress, the coach note should suggest talking with a trusted person. Return 3 to 5 tasks. Keep the tasks distinct from each other.",
  inputs: {
    // focus_area
    focusArea: "The kind of confidence the learner wants to build: speaking up, asking for help, sharing ideas, deciding, or everyday conversation.",
    // situation
    situation: "Optional upcoming situation the learner has in mind (e.g., 'team meeting on Thursday'). 'None' when not given.",
    // comfort_level
    comfortLevel: "How comfortable the learner feels with this focus now: low, medium, or high. Low means start with very small steps.",
    // custom_instructions
    customInstructions: "Extra preferences from the learner, such as limits or what to avoid. 'None' when the learner gave none.",
  },
  outputs: {
    // tasks
    tasks:
      "A list of confidence tasks. Each has: 'title': short action name; 'why': one sentence on how this builds confidence; 'steps': 2-4 concrete steps; 'success_sign': one observable sign the task went well, which does not depend on other people's reactions.",
    // coach_note
    coachNote: "A short, warm note on how to approach the tasks and how to be kind to yourself if one feels hard.",
  },
  item: {
    // title
    title: "Short action name",
    // why
    why: "One sentence on how this builds confidence",
    // steps
    steps: "Concrete steps, 2 to 4 short items",
    // success_sign
    successSign: "One observable sign the task went well, not dependent on other people's reactions",
  },
};
