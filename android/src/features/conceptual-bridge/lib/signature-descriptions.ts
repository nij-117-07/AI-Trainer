// src/features/conceptual-bridge/lib/signature-descriptions.ts
/**
 * Instructions and field descriptions for the Conceptual Bridge signature. The text is copied
 * from ConceptualBridgeBuilder in Backend/practice/conceptual_bridge/services.py, so both stacks
 * give the model the same guidance. The DSPy field name is noted beside each key.
 */

export const CONCEPTUAL_BRIDGE_DESCRIPTIONS = {
  instruction:
    "Forces connections between unrelated domains to enhance cognitive flexibility. Targets: Creativity, analogical thinking, and knowledge transfer.",
  inputs: {
    // concept_a
    conceptA: "First concept (e.g., 'Photosynthesis').",
    // concept_b
    conceptB: "Second seemingly unrelated concept (e.g., 'Blockchain').",
    // seed
    seed: "Seed for variation in creative connections.",
  },
  outputs: {
    // structural_analogy
    structuralAnalogy: "Deep structural similarity between the concepts.",
    // bridging_narrative
    bridgingNarrative: "A story that connects A to B in 2-3 sentences.",
    // insight_question
    insightQuestion: "A question that forces the user to find a missing link.",
    // cognitive_flexibility_score
    cognitiveFlexibilityScore: "Estimated IQ points impact: 1-5 (5 being high transfer learning potential).",
  },
};
