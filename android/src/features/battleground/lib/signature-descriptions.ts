// src/features/battleground/lib/signature-descriptions.ts
/**
 * Instructions and field descriptions for the Ax signatures. The text is copied from the DSPy
 * signatures in Backend/practice/battleground/services.py, so both stacks give the model the same
 * guidance. Keys use the Ax field names; the matching DSPy field is noted beside each key.
 */

export const USER_PROFILE_DESCRIPTIONS = {
  instruction:
    "You are a military intelligence analyst. Process the user's provided details into a structured combat profile. Assess their strengths, weaknesses, and determine their starting loadout based on their expertise and the battleground domain.",
  inputs: {
    // user_name
    userName: "User's callsign or preferred name.",
    // user_expertise
    userExpertise: "User's stated area of expertise or skills.",
    // user_preferred_style
    userPreferredStyle: "User's preferred combat/strategy style.",
    // user_background
    userBackground: "User's background story or experience.",
    // battleground_topic
    battlegroundTopic: "The battleground domain/topic.",
  },
  outputs: {
    // user_profile
    userProfile: `Structured combat profile:
- 'callsign': Official military-style callsign
- 'rank': Starting rank/title appropriate to background
- 'specializations': List of 2-4 skill areas
- 'strengths': List of 2-3 combat strengths
- 'weaknesses': List of 1-2 exploitable vulnerabilities
- 'available_loadout': List of 3-5 starting equipment/abilities
- 'combat_doctrine': Formalized combat philosophy (1 sentence)`,
    profile: {
      callsign: "Official military-style callsign",
      rank: "Starting rank/title appropriate to background",
      specializations: "List of 2-4 skill areas",
      strengths: "List of 2-3 combat strengths",
      weaknesses: "List of 1-2 exploitable vulnerabilities",
      availableLoadout: "List of 3-5 starting equipment/abilities",
      combatDoctrine: "Formalized combat philosophy (1 sentence)",
    },
  },
};

export const OPPONENT_DESCRIPTIONS = {
  instruction:
    "You are a strategic adversary designer. Create a formidable opponent that is specifically tailored to challenge the given user profile. The opponent should exploit the user's weaknesses while respecting the difficulty level. The opponent must feel like a real, adaptive threat — not a generic enemy.",
  inputs: {
    // battleground_topic
    battlegroundTopic: "The battleground domain/topic.",
    // difficulty
    difficulty: "Difficulty: easy, medium, or hard.",
    // user_profile
    userProfile: "The user's combat profile — opponent must counter their strengths.",
    // battleground_theme
    battlegroundTheme: "Overall theme/tone of the battleground scenario.",
  },
  outputs: {
    // opponent_profile
    opponentProfile: `Complete adversary profile:
- 'name': Opponent name/callsign (intimidating and memorable)
- 'title': Role/rank/designation
- 'capabilities': Dict mapping capability areas to levels (1-10)
- 'motives': Strategic objectives (what they want to achieve)
- 'personality': 2-3 behavioral traits that define their decision-making
- 'adaptability_style': How they learn and counter the user
- 'signature_tactics': List of 3 preferred tactical approaches
- 'weaknesses': 1-2 exploitable vulnerabilities (fewer on hard difficulty)
- 'available_resources': List of assets/forces at their disposal`,
    profile: {
      name: "Opponent name/callsign (intimidating and memorable)",
      title: "Role/rank/designation",
      capabilities: "Dict mapping capability areas to levels (1-10), as a JSON object string",
      motives: "Strategic objectives (what they want to achieve)",
      personality: "2-3 behavioral traits that define their decision-making",
      adaptabilityStyle: "How they learn and counter the user",
      signatureTactics: "List of 3 preferred tactical approaches",
      weaknesses: "1-2 exploitable vulnerabilities (fewer on hard difficulty)",
      availableResources: "List of assets/forces at their disposal",
    },
    // opponent_strategy
    opponentStrategy: "Overall strategic approach this opponent will use against this specific user.",
    // first_impression
    firstImpression: "How the opponent perceives the user after initial reconnaissance.",
  },
};

export const SCENARIO_DESCRIPTIONS = {
  instruction:
    "You are a battleground architect. Using the user profile and opponent profile, design a compelling battleground scenario with environment, objectives, and evaluation criteria. The scenario should create natural tension between the user's strengths and the opponent's strategy.",
  inputs: {
    // battleground_topic
    battlegroundTopic: "Domain/topic of the battleground.",
    // difficulty
    difficulty: "Difficulty level.",
    // user_profile
    userProfile: "User's structured combat profile.",
    // opponent_profile
    opponentProfile: "Opponent's structured profile.",
    // opponent_strategy
    opponentStrategy: "Opponent's strategic approach.",
  },
  outputs: {
    // scenario_context
    scenarioContext: "Rich narrative background (3-5 sentences) setting the stage.",
    // battlefield_environment
    battlefieldEnvironment: `Environment details:
- 'terrain': Physical/virtual terrain description
- 'weather_conditions': Environmental factors affecting operations
- 'time_of_day': Affects visibility and operations
- 'hazards': Environmental dangers present
- 'strategic_points': Key locations that provide advantages`,
    environment: {
      terrain: "Physical/virtual terrain description",
      weatherConditions: "Environmental factors affecting operations",
      timeOfDay: "Affects visibility and operations",
      hazards: "Environmental dangers present",
      strategicPoints: "Key locations that provide advantages",
    },
    // initial_user_health
    initialUserHealth: "Int (50-100). Higher if user has strong profile for the topic.",
    // initial_opponent_health
    initialOpponentHealth: "Int (60-100). Scales with difficulty: easy=60-70, medium=75-85, hard=90-100.",
    // evaluation_criteria
    evaluationCriteria: `Metrics for scoring each round. Dict of 3-4 criteria, as a JSON object string:
e.g., {'tactical_accuracy': 'How well the response addresses the threat',
       'resource_efficiency': 'Conservation of assets while achieving objectives',
       'adaptability': 'Ability to handle unexpected developments'}`,
    // mission_objective
    missionObjective: "The user's overall mission goal — what constitutes victory.",
    // rules_of_engagement
    rulesOfEngagement: "3-4 constraints/rules that govern the battleground.",
  },
};

export const TACTICS_DESCRIPTIONS = {
  instruction:
    "You are the opponent's tactical AI. Decide your next move based on the battlefield state, your profile, and what you've learned about the user. Think like a real adversary — exploit weaknesses, avoid their strengths, and adapt based on previous encounters.",
  inputs: {
    // opponent_profile
    opponentProfile: "Your capabilities and traits.",
    // battlefield_environment
    battlefieldEnvironment: "Current environment state.",
    // user_health
    userHealth: "User's current health.",
    // opponent_health
    opponentHealth: "Your current health.",
    // previous_user_action
    previousUserAction: "What the user did last round.",
    // previous_score
    previousScore: "How well the user performed (0.0-1.0).",
    // round_number
    roundNumber: "Current round number.",
    // opponent_learning_log
    opponentLearningLog: "Your accumulated observations about the user.",
    // user_profile
    userProfile: "User's known strengths and weaknesses.",
  },
  outputs: {
    // decision
    decision: `Your chosen tactical maneuver this round. One of: full_assault, flanking_manuever,
ambush, fortify_defense, electronic_warfare, psychological_ops, resource_denial,
deception, retreat_regroup, counter_intelligence.`,
    // reasoning
    reasoning: "Detailed tactical reasoning for this choice.",
    // target_weakness
    targetWeakness: "Which specific user weakness this tactic exploits.",
    // expected_user_response_type
    expectedUserResponseType: "What kind of response you anticipate from the user.",
    // updated_learning_log
    updatedLearningLog: "Updated observations about user patterns and tendencies.",
  },
};

export const CHALLENGE_DESCRIPTIONS = {
  instruction:
    "You are the battlefield scenario director. Create the next tactical challenge that the user must face. Include environmental context, reference intelligence, and clear objectives. The challenge should feel like a real military/cyber operation with fog of war elements.",
  inputs: {
    // scenario_context
    scenarioContext: "Overall battleground narrative.",
    // battlefield_environment
    battlefieldEnvironment: "Current environment state.",
    // user_profile
    userProfile: "User's combat profile.",
    // opponent_profile
    opponentProfile: "Opponent's profile.",
    // tactic_decision
    tacticDecision: "The opponent's chosen tactic.",
    // tactic_reasoning
    tacticReasoning: "Why the opponent chose this tactic.",
    // target_weakness
    targetWeakness: "What weakness is being targeted.",
    // current_state_summary
    currentStateSummary: "HP and round status.",
    // round_number
    roundNumber: "Current round.",
  },
  outputs: {
    // mission_briefing
    missionBriefing: "Narrative setup (2-3 sentences) for this encounter.",
    // tactical_situation
    tacticalSituation: "Description of the immediate tactical situation on the ground.",
    // specific_challenge
    specificChallenge: "What the user must accomplish this round.",
    // main_question
    mainQuestion: "The primary problem/decision the user must solve.",
    // constraints
    constraints: "2-3 operational limits (time, resources, rules).",
    // reference_material
    referenceMaterial: `Intelligence artifacts the user must analyze. Dict of {Title: Content}.
Vary these each round. Examples: satellite_imagery, intercepted_comms,
terrain_map, enemy_order_of_battle, system_logs, field_report.`,
    // environment_change
    environmentChange: "Any change to battlefield conditions this round, or 'No significant changes.'",
  },
};

export const EVALUATOR_DESCRIPTIONS = {
  instruction:
    "You are the battlefield adjudicator. Evaluate the user's tactical response against the challenge, considering the environment, opponent's tactic, and the user's capabilities. Be fair but realistic — reward clever thinking, punish carelessness. Determine health changes and narrative consequences.",
  inputs: {
    // scenario_context
    scenarioContext: "Overall battleground narrative.",
    // battlefield_environment
    battlefieldEnvironment: "Current environment.",
    // evaluation_criteria
    evaluationCriteria: "Scoring metrics.",
    // current_challenge
    currentChallenge: "What the user was asked to do.",
    // main_question
    mainQuestion: "The primary problem posed.",
    // reference_material
    referenceMaterial: "Intel provided to user.",
    // user_response
    userResponse: "The user's actual response/action.",
    // user_health
    userHealth: "User's current HP.",
    // opponent_health
    opponentHealth: "Opponent's current HP.",
    // user_profile
    userProfile: "User's capabilities.",
    // opponent_profile
    opponentProfile: "Opponent's capabilities.",
    // tactic_used
    tacticUsed: "What the opponent attempted.",
  },
  outputs: {
    // score
    score: "0.0 to 1.0 — overall tactical effectiveness.",
    // feedback
    feedback: "Detailed tactical critique (2-3 sentences).",
    // health_impact_user
    healthImpactUser: "Change in user health (-50 to +10). Negative = damage taken.",
    // health_impact_opponent
    healthImpactOpponent: "Change in opponent health (-30 to 0). Negative = damage dealt.",
    // is_terminated
    isTerminated: "Should simulation end? (catastrophic failure or critical success)",
    // termination_reason
    terminationReason: "Why it ended, or empty string if continuing.",
    // narrative_consequence
    narrativeConsequence: "Story result of this action (2-3 sentences).",
    // battlefield_shift
    battlefieldShift: "How the tactical situation changes after this round.",
    // resource_impact
    resourceImpact: `Changes to user's resources. Dict of {resource_name: change_amount}.
Empty dict {} if no resource changes this round.`,
  },
};
