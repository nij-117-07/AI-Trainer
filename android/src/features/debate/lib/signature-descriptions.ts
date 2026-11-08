// src/features/debate/lib/signature-descriptions.ts
/**
 * Instructions and field descriptions for the Ax signatures. The text is copied from the DSPy
 * signatures in Backend/practice/debate/services.py, so both stacks give the model the same
 * guidance. Keys use the Ax field names; the matching DSPy field is noted beside each key.
 */

export const PERSONA_ARCHITECT_DESCRIPTIONS = {
  instruction:
    "You are an expert Character Designer for AI Debaters. Transform character traits, intellectual influences, and debate context into a comprehensive System Prompt and strategic profile for a Debate AI.",
  inputs: {
    // character_archetype
    characterArchetype: "e.g., Cynical Academic, Aggressive Trial Lawyer, Zen Philosopher.",
    // speech_style
    speechStyle: "e.g., Sesquipedalian, punchy and short, metaphorical, data-driven.",
    // rhetorical_intensity
    rhetoricalIntensity: "Scale 1-10 (1: Passive/Meditative, 10: High-stakes confrontation).",
    // intellectual_influences
    intellectualInfluences: "List of thinkers or schools of thought (e.g., ['Sartre', 'Game Theory']).",
    // debate_topic
    debateTopic: "The primary topic this persona is being built to debate.",
    // side
    side: "Must be 'pro' (In favor) or 'con' (Against).",
    // custom_constraints
    customConstraints:
      "Any additional user quirks (e.g., 'Never uses emojis', 'Obsessed with maritime metaphors').",
  },
  outputs: {
    // persona_name
    personaName: "A creative name for this specific persona.",
    // system_prompt
    systemPrompt:
      "The complete, formatted System Prompt defining the persona's voice, rules, and behavior.",
    // overall_stance
    overallStance: "The overarching rhetorical stance this persona will default to.",
    // strategic_priorities
    strategicPriorities: "The core logic the persona follows to 'win' a debate.",
    // core_values
    coreValues: "The fundamental beliefs this persona will never compromise on.",
    // linguistic_quirks
    linguisticQuirks: "Specific ways of speaking (e.g., uses Latin phrases, extremely formal).",
  },
};

export const DEBATE_TURN_DESCRIPTIONS = {
  instruction:
    "You are an expert debater embodying a specific persona. Analyze the chat history, topic, and your assigned turn strategy to provide a logically sound, persuasive argument. You must strictly adhere to your persona's voice and strategic priorities.",
  inputs: {
    // system_prompt
    systemPrompt: "The persona definition and character rules.",
    // debate_topic
    debateTopic: "The core subject being debated.",
    // debate_context
    debateContext: "General theme or background information for the debate.",
    // chat_history
    chatHistory: "Previous exchanges in the debate.",
    // turn_strategy
    turnStrategy: "The specific tactical goal for this turn.",
    // external_evidence
    externalEvidence: "Supporting facts or raw data to be used in the argument.",
    // custom_instructions
    customInstructions: "Specific constraints like word count or emotional tone.",
  },
  outputs: {
    // opponent_analysis
    opponentAnalysis:
      "A brief, strategic analysis of the opponent's previous point and its weaknesses.",
    // core_claim
    coreClaim: "The core assertion or claim for this turn.",
    // reasoning_and_evidence
    reasoningAndEvidence: "The logical explanation and supporting evidence/data for the claim.",
    // spoken_argument
    spokenArgument:
      "The actual persuasive response, written entirely in the persona's voice and style.",
    // rhetorical_devices
    rhetoricalDevices:
      "List of techniques used in the spoken argument (e.g., Ethos, Pathos, Logos, Reductio ad absurdum).",
    // closing_question
    closingQuestion:
      "A piercing, strategic question aimed at the opponent to pivot or press the advantage.",
  },
};

export const DEBATE_JUDGE_DESCRIPTIONS = {
  instruction:
    "You are an impartial, highly analytical Debate Judge. Evaluate the quality of arguments from both sides based on logical strength, evidence, rhetorical effectiveness, and adherence to the debate topic.",
  inputs: {
    // debate_topic
    debateTopic: "The original debate topic.",
    // pro_transcript
    proTranscript: "The full transcript of the Pro side's spoken arguments.",
    // con_transcript
    conTranscript: "The full transcript of the Con side's spoken arguments.",
  },
  outputs: {
    // pro_score
    proScore: "Score from 0-10 for the Pro side.",
    // con_score
    conScore: "Score from 0-10 for the Con side.",
    // strongest_argument
    strongestArgument: "{'side': 'pro'/'con', 'claim': '...'} identifying the best point made.",
    // weakest_argument
    weakestArgument: "{'side': 'pro'/'con', 'claim': '...'} identifying the most flawed point.",
    // winner
    winner: "The final verdict.",
    // reasoning
    reasoning: "Clear, detailed explanation of the verdict.",
    // judge_comments
    judgeComments: "Constructive feedback and stylistic observations for both sides.",
  },
};
