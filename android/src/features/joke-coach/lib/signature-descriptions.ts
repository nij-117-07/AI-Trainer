// src/features/joke-coach/lib/signature-descriptions.ts
/**
 * Instructions and field descriptions for the Joke Coach Ax signatures. The text is copied from
 * the DSPy signatures in Backend/practice/joke_coach/services.py. Keys use the Ax field names;
 * the matching DSPy field is noted beside each key. Multi-line DSPy descriptions are joined onto
 * one line, with the wording unchanged. The language inputs and the scenario signature are Android
 * additions; the Backend has no language option.
 */

const LANGUAGE_INPUT =
  "Language for all written output (e.g., 'English', 'Spanish'). Write in this language, and use wordplay and cultural references that work in it.";

export const JOKE_SCENARIO_DESCRIPTIONS = {
  instruction:
    "You are a Joke Scenario Writer. Invent one realistic, specific everyday situation that someone can write a joke about. Give it a short title, a vivid situation of two to four sentences, and the audience it would suit. Keep it open enough that many different jokes are possible, and avoid real people, brands, and anything offensive.",
  inputs: {
    language: LANGUAGE_INPUT,
    // theme
    theme: "Optional theme the scenario should touch on (e.g., 'office life', 'travel'). Empty means any theme.",
  },
  outputs: {
    title: "A short title for the scenario, under eight words.",
    situation: "The scenario itself: who is where, what is happening, and what is about to go wrong.",
    audience: "The audience this scenario suits (e.g., 'office workers', 'families').",
  },
};

export const JOKE_GENERATOR_DESCRIPTIONS = {
  instruction:
    "You are a Joke Generator. Your role is to create original, entertaining jokes based on the given topic, style preferences, and target audience.",
  inputs: {
    // topic
    jokeTopic: "The subject or theme for the joke (e.g., 'programming', 'cats', 'coffee').",
    // joke_style
    jokeStyle: "Preferred joke format or style (pun, one-liner, story, observational, dad-joke).",
    // audience
    audience: "Target audience (e.g., 'kids', 'adults', 'professionals').",
    language: LANGUAGE_INPUT,
  },
  outputs: {
    // joke
    joke: "The generated joke text.",
    // setup
    setup: "The setup/premise of the joke (if applicable).",
    // punchline
    punchline: "The punchline or payoff of the joke.",
    // humor_type
    humorType: "Type of humor used (wordplay, irony, exaggeration, etc.).",
    // difficulty_rating
    difficultyRating: "Delivery difficulty on scale 1-5 (1=easy, 5=advanced timing needed).",
  },
};

export const JOKE_EVALUATOR_DESCRIPTIONS = {
  instruction:
    "You are a Joke Evaluator. Analyze the provided joke and give structured feedback on quality, timing, appropriateness, and suggest improvements.",
  inputs: {
    // joke
    jokeText: "The complete joke text to evaluate.",
    // intended_audience
    intendedAudience: "Who this joke was meant for.",
    // context
    evaluationContext:
      "Additional context (e.g., 'open mic night', 'family dinner', 'comedy club').",
    language: LANGUAGE_INPUT,
  },
  outputs: {
    // overall_score
    overallScore: "Overall quality score from 0.0 to 10.0.",
    // humor_score
    humorScore: "How funny it is (0.0-10.0).",
    // originality_score
    originalityScore: "How original/creative it is (0.0-10.0).",
    // delivery_score
    deliveryScore: "How easy it would be to deliver well (0.0-10.0).",
    // appropriateness
    appropriateness: "Content appropriateness level: all-ages, teen, mature, or nsfw.",
    // strengths
    strengths: "List of what works well in this joke.",
    // weaknesses
    weaknesses: "List of areas for improvement.",
    // feedback
    feedback: "Detailed constructive feedback paragraph.",
    // is_recommended
    isRecommended: "Whether this joke is ready to perform.",
  },
};

export const JOKE_REWRITER_DESCRIPTIONS = {
  instruction:
    "You are a Joke Rewriter. Take an existing joke and rewrite it to be funnier, sharper, or better suited for the specified context. Maintain the core premise while enhancing delivery, timing, and impact.",
  inputs: {
    // original_joke
    originalJoke: "The original joke text to improve.",
    // improvement_goal
    improvementGoal: "What aspect to improve (funnier, cleaner, shorter, more-clever, better-timing).",
    // target_audience
    targetAudience: "Who should find this funny.",
    language: LANGUAGE_INPUT,
  },
  outputs: {
    // rewritten_joke
    rewrittenJoke: "The improved version of the joke.",
    // setup
    setup: "New setup/premise.",
    // punchline
    punchline: "New punchline.",
    // changes_made
    changesMade: "List of specific improvements made.",
    // performance_notes
    performanceNotes: "Tips for delivering this joke effectively.",
  },
};
