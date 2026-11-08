// src/features/testing-portal/lib/signature-descriptions.ts
/**
 * Instructions and field descriptions for the Ax signatures. The text is copied from the
 * DSPy signatures in Backend/practice/testing_portal/services.py, so both stacks give the
 * model the same guidance. Keys use the Ax field names. The matching DSPy field name is
 * noted beside each key.
 */

export const MCQ_GENERATOR_DESCRIPTIONS = {
  instruction:
    "You are an expert Question Designer. Your task is to generate Multiple Choice Questions (MCQs) based on the provided topic, context data, and constraints. Ensure distractors (wrong options) are plausible and challenging.",
  inputs: {
    // random_seed
    variationSeed: "A unique UUID or seed to ensure randomness in the generation process.",
    // topic
    topic: "The subject or specific topic for the questions.",
    // question_type
    questionType:
      "The style of questions:\n- academic: Focus on theory and textbook definitions.\n- practical: Focus on real-world application and hands-on skills.\n- scenario-based: Situational 'what would you do' questions.\n- conceptual: Tests deep understanding of underlying principles.",
    // num_questions
    numQuestions: "The number of MCQs to generate.",
    // difficulty_level
    difficultyLevel: "The complexity level of the questions.",
    // context_setting
    contextSetting: "The scenario (e.g., Job Interview, University Exam, Certification).",
    // past_questions
    pastQuestions: "Previously generated questions to avoid repetition.",
    // custom_instructions
    customInstructions: "Specific user requirements, like 'focus on technical implementation'.",
  },
  outputs: {
    // questions
    questions:
      "A list of MCQ objects. Each object must contain:\n- 'question_text': The actual question string.\n- 'options': A dictionary with keys 'A', 'B', 'C', 'D'.\n- 'correct_answer': The key (A, B, C, or D) corresponding to the right option.",
    questionText: "The actual question string.",
    options: "A dictionary with keys 'A', 'B', 'C', 'D'.",
    correctAnswer: "The key (A, B, C, or D) corresponding to the right option.",
  },
};

export const THEORETICAL_GENERATOR_DESCRIPTIONS = {
  instruction:
    "You are a Senior Academic Examiner and Technical Interviewer. Generate open-ended, theoretical, or scenario-based questions that evaluate deep conceptual understanding and critical thinking based on specific source data.",
  inputs: {
    // random_seed
    variationSeed: "A unique UUID or seed to ensure randomness in the generation process.",
    // topic
    topic: "The subject or specific domain for the questions.",
    // question_type
    questionType:
      "The style of the theoretical question:\n- academic: Focus on foundational principles and formal theories.\n- practical: Focus on solving real-world problems and implementation theory.\n- case-study: Analysis of a specific hypothetical or real scenario.\n- philosophical: Exploration of 'why' and ethics within the domain.\n- architectural: High-level system design and structural trade-offs.",
    // source_context
    sourceContext: "The source text or data to use as the basis for analysis. If empty, use your knowledge.",
    // past_questions
    pastQuestions: "Previously generated questions to ensure variety.",
    // num_questions
    numQuestions: "The number of questions to generate.",
    // difficulty_level
    difficultyLevel: "The depth and complexity of the questions.",
    // context_setting
    contextSetting: "The scenario (e.g., Coding Interview, Research Paper, University Exam).",
    // custom_instructions
    customInstructions: "Specific constraints (e.g., focus on trade-offs, security, or history).",
  },
  outputs: {
    // questions
    questions:
      "A list of theoretical questions. Each object must contain:\n- 'question_text': The descriptive open-ended question.\n- 'focus_area': A brief tag (e.g., 'Scalability', 'Ethics', 'Performance').\n- 'evaluation_criteria': A brief summary of what a high-quality answer should include.",
    questionText: "The descriptive open-ended question.",
    focusArea: "A brief tag (e.g., 'Scalability', 'Ethics', 'Performance').",
    evaluationCriteria: "A brief summary of what a high-quality answer should include.",
  },
};

export const ANSWER_GENERATOR_DESCRIPTIONS = {
  instruction:
    "You are a Subject Matter Expert. Your task is to provide comprehensive, accurate, and contextually appropriate answers to theoretical or technical questions. The answer should be tailored to the specific context (e.g., teaching a student vs. evaluating a senior professional).",
  inputs: {
    // question
    question: "The theoretical/descriptive question to answer.",
    // context
    context: "The setting (e.g., 'Job Interview', 'Academic Exam', 'Internal Training').",
    // difficulty_level
    difficultyLevel: "The complexity level of the expected answer.",
    // response_format (allowed values added so the app's option keys match)
    responseFormat:
      "The structural style of the response. One of: bullet_points, paragraph, step_by_step, technical_whitepaper.",
    // custom_instructions
    customInstructions: "Additional specific constraints or information.",
  },
  outputs: {
    // answer_text
    answerText: "The generated response/answer.",
    // key_concepts_covered
    keyConceptsCovered: "A list of core concepts or keywords included in the answer.",
  },
};

export const SOLVER_DESCRIPTIONS = {
  instruction:
    "You are an expert educator. Your task is to analyze a Multiple Choice Question and identify the correct option. You must also provide a clear, concise explanation justifying why that option is correct and why others are not.",
  inputs: {
    // question_text
    question: "The text of the question.",
    // options (split into one input per option; the DSPy dictionary is shown as an example)
    optionA: "Option A text, from the options dictionary (e.g., {'A': 'text', 'B': 'text'}).",
    optionB: "Option B text, from the options dictionary (e.g., {'A': 'text', 'B': 'text'}).",
    optionC: "Option C text, from the options dictionary (e.g., {'A': 'text', 'B': 'text'}).",
    optionD: "Option D text, from the options dictionary (e.g., {'A': 'text', 'B': 'text'}).",
    // context_setting
    context: "The scenario for the question (e.g., University Exam).",
  },
  outputs: {
    // correct_option
    correctOption: "The letter of the correct option.",
    // reasoning
    reasoning: "A brief explanation of the correct answer and logic.",
  },
};
