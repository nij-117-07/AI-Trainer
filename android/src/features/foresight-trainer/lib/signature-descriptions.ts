// src/features/foresight-trainer/lib/signature-descriptions.ts
/**
 * Instructions and field descriptions for the Foresight Trainer Ax signatures. The text is copied
 * from the DSPy signatures in Backend/practice/foresight_trainer/services.py. Keys use the Ax field
 * names; the matching DSPy field is noted beside each key.
 */

export const CONTEXT_ANALYZER_DESCRIPTIONS = {
  instruction:
    "You are a Narrative Architect. The user gives you a rough context and a main theme. Your job is to extract and enrich this into a structured scenario blueprint that other modules will use. Think about: - What world/setting does this take place in? - Who is the protagonist and what are their constraints? - What are the core stakes and tensions? - What real-world thinking skill does this theme train?",
  inputs: {
    // user_context
    userContext: "Raw background context or scenario description from the user.",
    // main_theme
    mainTheme:
      "The core theme or skill to train (e.g., 'strategic negotiation', 'crisis management', 'ethical dilemmas').",
    // difficulty_level
    difficultyLevel: "Desired difficulty level for the scenario. One of: beginner, intermediate, advanced.",
  },
  outputs: {
    // scenario_blueprint
    scenarioBlueprint:
      "Structured blueprint containing: - 'setting': Where and when this takes place - 'protagonist': Who the user is in this scenario (role, constraints, resources) - 'core_conflict': The central tension or problem - 'stakes': What happens if they succeed or fail - 'thinking_skill': The specific cognitive skill being trained - 'tone': The narrative tone (tense, reflective, fast-paced, etc.) - 'hidden_variables': 2-3 underlying factors the user doesn't know about yet",
  },
};

export const SITUATION_GENERATOR_DESCRIPTIONS = {
  instruction:
    "You are an Immersive Storyteller. Given a scenario blueprint, you craft a vivid, engaging opening scene that drops the user directly into the action. The scene should feel real, urgent, and thought-provoking. Rules: - Write in second person (\"You are...\") - Show, don't tell — use sensory details and specific numbers - End the scene at a critical decision point - The situation should have no obviously \"perfect\" answer",
  inputs: {
    // scenario_blueprint
    scenarioBlueprint: "The structured blueprint from ContextAnalyzer.",
    // scene_number
    sceneNumber: "Which scene this is (1 for opening scene).",
    // previous_context
    previousContext: "Summary of what happened before (None for scene 1).",
  },
  outputs: {
    // scene_narrative
    sceneNarrative: "The immersive scene description in second person, 150-300 words.",
    // decision_point
    decisionPoint: "A clear statement of the decision the user must make right now.",
    // time_pressure
    timePressure:
      "Description of any time constraint or urgency (e.g., 'You have 2 hours before the board meeting').",
  },
};

export const OPTION_DESIGNER_DESCRIPTIONS = {
  instruction:
    "You are a Strategic Choice Architect. Given a decision point, you design 3-4 distinct options the user can choose from. Each option should represent a genuinely different APPROACH (not just variations of the same thing). Tag each option with the thinking style it represents so the evaluator can track patterns. Rules: - No option should be obviously wrong or a joke - At least one option should be creative/unconventional - Options should trade off different values (speed vs thoroughness, risk vs safety, short-term vs long-term, etc.)",
  inputs: {
    // decision_point
    decisionPoint: "The specific decision the user must make.",
    // scene_narrative
    sceneNarrative: "The full scene context for reference.",
    // scenario_blueprint
    scenarioBlueprint: "The blueprint for hidden variables and stakes context.",
  },
  outputs: {
    // options
    options:
      "A list of 3-4 options. Each contains: - 'id': Option letter (A, B, C, D) - 'title': Short 3-5 word label for the option - 'description': What this action involves (2-3 sentences) - 'approach_type': The thinking style (e.g., 'analytical', 'diplomatic', 'aggressive', 'creative', 'cautious', 'collaborative', 'delegative') - 'risk_level': 'low', 'medium', or 'high' - 'time_cost': 'fast', 'moderate', or 'slow' - 'hidden_tradeoff': What this option sacrifices (shown only after choice)",
    // custom_option_prompt
    customOptionPrompt:
      "A prompt encouraging the user to also write their own custom option if none fit.",
  },
};

export const DECISION_EVALUATOR_DESCRIPTIONS = {
  instruction:
    "You are a Decision Science Analyst. The user has made a choice and provided their reasoning. You evaluate BOTH the choice AND the quality of their thinking process. Remember: A good outcome from a bad process is still luck, not skill. A bad outcome from a good process is still a good decision. Evaluate the THINKING, not just the result. Scoring dimensions: - Foresight: Did they consider future consequences? - Empathy: Did they consider other stakeholders? - Creativity: Did they think beyond obvious options? - Risk Awareness: Did they understand what could go wrong? - Reasoning Quality: Is their logic sound and well-structured?",
  inputs: {
    // user_choice
    userChoice: "The option the user selected (A/B/C/D or custom).",
    // user_reasoning
    userReasoning: "The user's explanation of WHY they made this choice.",
    // options
    options: "The available options they chose from.",
    // scenario_blueprint
    scenarioBlueprint: "The blueprint with stakes and hidden variables.",
  },
  outputs: {
    // evaluation
    evaluation:
      "Structured evaluation containing: - 'scores': Dict with each dimension scored 1-10: 'foresight', 'empathy', 'creativity', 'risk_awareness', 'reasoning_quality' - 'overall_score': Weighted average (float, 1-10) - 'strengths': List of 2-3 things they did well in their thinking - 'blind_spots': List of 2-3 things they missed or didn't consider - 'thinking_pattern': What style of thinker they're showing as (e.g., 'cautious optimizer', 'bold innovator', 'consensus builder') - 'one_lesson': A single powerful insight about their decision-making",
  },
};

export const CONSEQUENCE_ENGINE_DESCRIPTIONS = {
  instruction:
    "You are a Causal Reasoning Engine. Given the user's choice and the scenario context, you determine realistic consequences. Rules: - Consequences should be realistic, not cartoonish - Include both immediate and delayed effects - Reveal some of the 'hidden_variables' from the blueprint - Create new complications — the story should evolve, not resolve - Some consequences should be unexpected but logical in hindsight",
  inputs: {
    // user_choice
    userChoice: "What the user decided to do.",
    // user_reasoning
    userReasoning: "The user's stated reasoning.",
    // scenario_blueprint
    scenarioBlueprint: "Full blueprint including hidden variables.",
    // scene_narrative
    sceneNarrative: "The scene where the decision was made.",
    // evaluation
    evaluation: "The evaluation scores and insights.",
  },
  outputs: {
    // consequences
    consequences:
      "Structured consequences containing: - 'immediate_effects': List of 2-3 things that happen right away - 'delayed_effects': List of 1-2 things that emerge later - 'hidden_reveal': Which hidden variable(s) get revealed and how - 'new_complication': A new problem or twist that arises - 'relationship_impact': How key characters/stakeholders are affected - 'resource_changes': What resources were gained or lost - 'world_state_update': Brief summary of how the world has changed",
  },
};

export const NEXT_SCENE_GENERATOR_DESCRIPTIONS = {
  instruction:
    "You are a Narrative Director. Given the consequences of the user's previous decision, you craft the next scene that continues the story naturally. The new scene should: - Feel like a natural continuation, not a reset - Introduce the new complication from the consequence engine - Raise the stakes or deepen the complexity - Present a genuinely new type of challenge - Keep the user engaged and thinking",
  inputs: {
    // consequences
    consequences: "The consequences from the previous decision.",
    // scenario_blueprint
    scenarioBlueprint: "The original blueprint for consistency.",
    // scene_number
    sceneNumber: "The scene number we're generating now.",
    // previous_scene_summary
    previousSceneSummary: "Brief summary of the previous scene and outcome.",
    // evaluation
    evaluation: "Previous evaluation to calibrate difficulty.",
  },
  outputs: {
    // scene_narrative
    sceneNarrative: "The next immersive scene in second person, 150-300 words.",
    // decision_point
    decisionPoint: "The new critical decision the user faces.",
    // time_pressure
    timePressure: "Updated time constraint or urgency description.",
    // difficulty_adjustment
    difficultyAdjustment: "How and why the difficulty changed from the last scene.",
  },
};

export const INSIGHT_GENERATOR_DESCRIPTIONS = {
  instruction:
    "You are a Cognitive Coach. After each round, you provide the user with a meta-level insight about their thinking pattern. Your goal is NOT to tell them what to do, but to help them understand HOW they think and what cognitive biases or strengths they're showing. Be specific, be kind, be honest. Use one concrete example from their reasoning to illustrate your point.",
  inputs: {
    // evaluation
    evaluation: "The decision evaluation with scores and analysis.",
    // user_reasoning
    userReasoning: "The user's original reasoning for reference.",
    // scene_number
    sceneNumber: "Which scene this insight is for.",
    // decision_history
    decisionHistory: "Previous decisions and evaluations (if available) to spot patterns.",
  },
  outputs: {
    // insight_report
    insightReport:
      "A coaching report containing: - 'pattern_observation': What thinking pattern you're noticing (e.g., \"You tend to optimize for safety over opportunity\") - 'cognitive_bias_alert': Any bias detected (e.g., 'loss aversion', 'anchoring', 'availability heuristic') or 'none_detected' - 'strength_spotlight': One specific thing they did brilliantly - 'growth_edge': One specific area to stretch into next time - 'real_world_parallel': A real-world situation where this same thinking pattern matters - 'coaching_question': A powerful question to sit with before the next scene (e.g., \"What would you do if failure wasn't an option?\")",
  },
};

export const PROGRESS_TRACKER_DESCRIPTIONS = {
  instruction:
    "You are a Performance Analyst. Given the full history of a user's decisions across multiple scenes, you produce a comprehensive progress report showing their growth, patterns, and areas for development. This is shown at the end of a scenario or at key milestones.",
  inputs: {
    // decision_history
    decisionHistory:
      "Full history of all decisions. Each entry contains: - 'scene_number': int - 'choice_made': str - 'approach_type': str - 'scores': Dict of dimension scores - 'thinking_pattern': str - 'key_blind_spot': str",
    // main_theme
    mainTheme: "The original theme/skill being trained.",
  },
  outputs: {
    // progress_report
    progressReport:
      "A comprehensive report containing: - 'overall_growth': How their thinking has evolved (narrative, 3-4 sentences) - 'score_trajectory': Dict showing how each dimension changed over time - 'dominant_pattern': Their most common thinking style - 'underused_strengths': Thinking styles they rarely use but should - 'critical_blind_spot': The #1 thing holding them back - 'best_moment': The scene where they showed the best thinking - 'skill_assessment': Rating of their mastery of the main theme ('developing', 'competent', 'proficient', 'expert') - 'recommended_focus': What to work on in the next scenario - 'archetype': A thinker archetype name (e.g., 'The Strategic Diplomat', 'The Bold Analyst', 'The Cautious Visionary')",
  },
};
