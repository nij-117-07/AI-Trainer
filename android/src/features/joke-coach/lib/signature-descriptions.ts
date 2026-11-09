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

export const JOKE_CLASSIFIER_DESCRIPTIONS = {
  instruction:
    "You are a Joke Classifier. Analyze a joke and categorize it by style, structure, humor mechanism, and difficulty. This helps organize jokes for practice sessions.",
  inputs: {
    // joke
    jokeText: "The joke text to classify.",
  },
  outputs: {
    // style
    style:
      "Primary joke style: pun, one-liner, story-joke, observational, self-deprecating, dad-joke, dark-humor, or anti-joke.",
    // humor_mechanism
    humorMechanism:
      "How the humor works: wordplay, misdirection, exaggeration, irony, rule-of-three, callback, or subversion.",
    // structure
    structure: "Structural breakdown (setup -> turn -> punchline).",
    // tags
    tags: "Relevant tags for categorization.",
    // practice_category
    practiceCategory: "Suggested practice level based on complexity: beginner, intermediate, or advanced.",
    // similar_joke_styles
    similarJokeStyles: "Other styles this joke resembles.",
  },
};

export const PRACTICE_COACH_DESCRIPTIONS = {
  instruction:
    "You are a Comedy Practice Coach. Guide users through a structured joke practice session. Provide exercises, feedback prompts, and help them improve their delivery and joke-writing skills.",
  inputs: {
    // current_skill_level
    currentSkillLevel: "User's current comedy skill level: beginner, intermediate, or advanced.",
    // practice_focus
    practiceFocus: "Area to focus on: writing, delivery, timing, crowd-work, stage-presence, or all.",
    // user_joke
    userJoke: "User's joke to practice with.",
    // session_goal
    sessionGoal: "What the user wants to achieve in this practice session.",
  },
  outputs: {
    // exercise_type
    exerciseType: "Recommended exercise type.",
    // exercise_instructions
    exerciseInstructions: "Step-by-step instructions for the exercise.",
    // practice_joke
    practiceJoke: "A joke to practice with (if user didn't provide one).",
    // drill_prompt
    drillPrompt: "Specific drill or prompt for immediate practice.",
    // success_criteria
    successCriteria: "How to know if the practice was successful.",
    // next_steps
    nextSteps: "Recommended next practice steps.",
  },
};

export const CROWD_RESPONSE_DESCRIPTIONS = {
  instruction:
    "You are a Crowd Response Simulator. Predict how different audiences might react to a given joke. This helps comedians understand potential reception before performing.",
  inputs: {
    // joke
    jokeText: "The joke to simulate responses for.",
    // venue_type
    venueType: "Type of venue: comedy-club, open-mic, corporate-event, family-gathering, or college-show.",
    // audience_demographic
    audienceDemographic: "Description of the expected audience.",
  },
  outputs: {
    // predicted_response
    predictedResponse:
      "Expected crowd reaction level: huge-laugh, solid-laugh, chuckles, polite-smile, silence, or groan.",
    // laugh_probability
    laughProbability: "Probability of getting laughs (0.0-1.0).",
    // best_delivery_style
    bestDeliveryStyle: "Recommended delivery approach.",
    // potential_risks
    potentialRisks: "What could go wrong with this joke.",
    // alternative_punchline
    alternativePunchline: "Backup punchline if the main one fails.",
    // crowd_work_opportunity
    crowdWorkOpportunity: "How to engage the crowd around this joke.",
  },
};
