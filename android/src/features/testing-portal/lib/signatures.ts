// src/features/testing-portal/lib/signatures.ts
/**
 * Ax signatures for the Testing Portal. Instructions and field guidance are taken from
 * Backend/practice/testing_portal/services.py so the generated content matches the webui.
 */
import { f } from "@ax-llm/ax";

const variationSeed = () => f.string("A unique seed so repeated runs produce different questions");

export const mcqSignature = f()
  .description(
    "You are an expert Question Designer. Generate Multiple Choice Questions (MCQs) based on the provided topic, context data, and constraints. Ensure distractors (wrong options) are plausible and challenging.",
  )
  .input("variationSeed", variationSeed())
  .input("topic", f.string("The subject or specific topic for the questions"))
  .input(
    "questionType",
    f.string(
      "Style of the questions: academic (theory and textbook definitions), practical (real-world application and hands-on skills), scenario-based (situational 'what would you do' questions), conceptual (deep understanding of underlying principles), recall (facts and definitions)",
    ),
  )
  .input("numQuestions", f.number("The number of MCQs to generate"))
  .input("difficultyLevel", f.string("The complexity level of the questions"))
  .input("contextSetting", f.string("The scenario, e.g. Job Interview, University Exam, Certification"))
  .input("pastQuestions", f.string("Previously generated questions to avoid repetition, one per line").optional())
  .input("customInstructions", f.string("Specific user requirements, e.g. focus on technical implementation").optional())
  .output(
    "questions",
    f
      .object(
        {
          questionText: f.string("The actual question string"),
          options: f.object(
            {
              A: f.string("Option A text"),
              B: f.string("Option B text"),
              C: f.string("Option C text"),
              D: f.string("Option D text"),
            },
            "The four answer options",
          ),
          correctAnswer: f.class(["A", "B", "C", "D"], "The key (A, B, C, or D) of the correct option"),
        },
        "One multiple choice question",
      )
      .array(),
  )
  .build();

export const theoreticalSignature = f()
  .description(
    "You are a Senior Academic Examiner and Technical Interviewer. Generate open-ended, theoretical, or scenario-based questions that evaluate deep conceptual understanding and critical thinking based on specific source data.",
  )
  .input("variationSeed", variationSeed())
  .input("topic", f.string("The subject or specific domain for the questions"))
  .input(
    "questionType",
    f.string(
      "Style of the question: academic (foundational principles and formal theories), practical (solving real-world problems), case-study (analysis of a hypothetical or real scenario), philosophical (exploration of why and ethics), architectural (high-level system design and trade-offs)",
    ),
  )
  .input("sourceContext", f.string("Source text or data to base the questions on. If empty, use your knowledge").optional())
  .input("pastQuestions", f.string("Previously generated questions to ensure variety, one per line").optional())
  .input("numQuestions", f.number("The number of questions to generate"))
  .input("difficultyLevel", f.string("The depth and complexity of the questions"))
  .input("contextSetting", f.string("The scenario, e.g. Coding Interview, Research Paper, University Exam"))
  .input("customInstructions", f.string("Specific constraints, e.g. focus on trade-offs, security, or history").optional())
  .output(
    "questions",
    f
      .object(
        {
          questionText: f.string("The descriptive open-ended question"),
          focusArea: f.string("A brief tag, e.g. Scalability, Ethics, Performance"),
          evaluationCriteria: f.string("A brief summary of what a high-quality answer should include"),
        },
        "One theoretical question",
      )
      .array(),
  )
  .build();

export const answerSignature = f()
  .description(
    "You are a Subject Matter Expert. Provide comprehensive, accurate, and contextually appropriate answers to theoretical or technical questions. Tailor the answer to the specific context, e.g. teaching a student vs. evaluating a senior professional.",
  )
  .input("question", f.string("The theoretical or descriptive question to answer"))
  .input("context", f.string("The setting, e.g. Job Interview, Academic Exam, Internal Training"))
  .input("difficultyLevel", f.string("The complexity level of the expected answer"))
  .input(
    "responseFormat",
    f.string("The structural style of the response: bullet_points, paragraph, step_by_step, or technical_whitepaper"),
  )
  .input("customInstructions", f.string("Additional specific constraints or information").optional())
  .output("answerText", f.string("The generated response or answer"))
  .output("keyConceptsCovered", f.string("A core concept or keyword included in the answer").array())
  .build();

export const solverSignature = f()
  .description(
    "You are an expert educator. Analyze a Multiple Choice Question and identify the correct option. Give a clear, concise explanation of why that option is correct and why the others are not.",
  )
  .input("question", f.string("The text of the question"))
  .input("optionA", f.string("Option A text"))
  .input("optionB", f.string("Option B text"))
  .input("optionC", f.string("Option C text"))
  .input("optionD", f.string("Option D text"))
  .input("context", f.string("The scenario for the question, e.g. University Exam").optional())
  .output("correctOption", f.class(["A", "B", "C", "D"], "The letter of the correct option"))
  .output("reasoning", f.string("A brief explanation of the correct answer and the logic"))
  .build();
