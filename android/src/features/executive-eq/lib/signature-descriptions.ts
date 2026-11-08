// src/features/executive-eq/lib/signature-descriptions.ts
/**
 * Instructions and field descriptions for the Executive EQ Ax signatures. The text is copied from
 * the DSPy signatures in Backend/practice/executive_eq/services.py. Keys use the Ax field names;
 * the matching DSPy field is noted beside each key.
 */

export const SCENARIO_GENERATOR_DESCRIPTIONS = {
  instruction:
    "You are an Elite Corporate Strategist and Simulation Architect. Your role is to design the foundational context, stakes, and NPC profiles for high-stakes executive training simulations. You create the 'board' before the 'game' begins.",
  inputs: {
    // user_role
    userRole: "The professional role the user is playing (e.g., 'VP of Sales', 'CEO').",
    // narrative_arc
    narrativeArc: "The overarching strategic goal (e.g., 'Deflecting a hostile takeover').",
    // learning_focus
    learningFocus:
      "The core EQ skill to be tested (diplomatic_refusal, assertive_silence, implied_authority, strategic_ambiguity).",
    // difficulty_level
    difficultyLevel:
      "The intensity and hostility level of the simulation (Rising Star, Seasoned Exec, Ruthless Board, Crisis Mode).",
    // industry_context
    industryContext: "Specific industry (e.g., 'Biotech', 'FinTech'). Defaults to general corporate.",
  },
  outputs: {
    // scenario_title
    scenarioTitle: "A dramatic, classified-style name for the simulation.",
    // setting_description
    settingDescription: "A vivid, sensory description of the physical environment and atmospheric tension.",
    // npc_profile
    npcProfile:
      "Structured profile of the primary counterpart. Must include: - 'name': Full name - 'title': Corporate title - 'personality': Core behavioral traits - 'hidden_motive': What they actually want vs. what they say - 'tell': A subtle non-verbal habit when lying or stressed",
    // initial_stakes
    initialStakes: "The concrete consequences of failure in this specific scenario.",
    // opening_hook
    openingHook: "The exact inciting incident or first line of dialogue that starts the simulation.",
  },
};

export const EQ_TRAINER_DESCRIPTIONS = {
  instruction:
    "You are a Strategic Communication Coach for Fortune 500 Executives. Your goal is to train the user in 'High EQ Diplomacy'--where they must communicate power, skepticism, or agreement through subtext rather than blunt words. You create a 'Social Chess' environment where the user learns to 'say it without saying it.'",
  inputs: {
    // previous_scenario
    previousScenario: "The context of the last lesson or meeting.",
    // narrative_arc
    narrativeArc: "The overall goal (e.g., 'Gaining leverage in a merger', 'Deflecting blame').",
    // chat_history
    chatHistory: "The record of the dialogue so far.",
    // learning_focus
    learningFocus: "The specific EQ skill being practiced in this turn.",
    // seed
    seed: "A seed to vary the political tension and personality of the NPCs (usually the NPC's hidden motive).",
    // user_customization
    userCustomization: "Optional user constraints, e.g., 'Make my boss extremely aggressive'.",
  },
  outputs: {
    // rationale
    rationale: "The psychological breakdown of why this move is being made by the NPC.",
    // meeting_scenario
    meetingScenario:
      "A vivid description of the high-profile setting, the 'vibe', and the NPC's non-verbal cues.",
    // npc_dialogue
    npcDialogue: "What the high-profile counterparty actually says to the user.",
    // eq_coach_message
    eqCoachMessage:
      "Advice for the user on how to read the subtext and what to 'signal' in their next response.",
    // suggested_strategies
    suggestedStrategies: "3 ways to reply: 1. The Direct approach, 2. The Subtle Pivot, 3. The Power Move.",
  },
};

export const EQ_EVALUATOR_DESCRIPTIONS = {
  instruction:
    "You are a Senior Behavioral Analyst. Your job is to analyze the user's response in a high-stakes meeting. You evaluate the 'Subtext', 'Status Management', and 'Strategic Alignment'. You tell the user if they 'lost face', 'held ground', or 'gained leverage'.",
  inputs: {
    // scenario_context
    scenarioContext: "The immediate situation/setting the user responded to.",
    // npc_last_statement
    npcLastStatement: "What the high-profile NPC said or did.",
    // user_response
    userResponse: "The actual words or actions the user just took.",
    // learning_focus
    learningFocus: "The skill being practiced (e.g., 'Strategic Ambiguity').",
  },
  outputs: {
    // subtext_accuracy
    subtextAccuracy: "Did the user correctly 'read' the NPC's hidden intent?",
    // status_impact
    statusImpact:
      "How the user's social/professional status changed (Increased, Maintained, Diminished, Completely Lost).",
    // strategic_grade
    strategicGrade:
      "How well the response aligns with the meeting's long-term goal (A, B, C, D, F).",
    // strengths
    strengths: "What the user did well in this specific turn.",
    // critical_flaws
    criticalFlaws: "Technical or EQ mistakes (e.g., 'Too defensive', 'Gave away too much info').",
    // the_rewritten_pro_move
    theRewrittenProMove:
      "How a Master Negotiator would have said the exact same thing to get a better result.",
    // coaching_tip
    coachingTip: "A psychological tip for the next turn.",
  },
};
