// src/features/language-tester/lib/normalize.test.ts
import {
  normalizeAssessment,
  normalizeChallenge,
  normalizeEvaluation,
  normalizeFeedback,
  normalizeFibQuestions,
  normalizeRoleplayReply,
} from "./normalize";

const goodQuestion = {
  id: "1",
  questionText: "Which word means 'hello'?",
  options: { A: "Hola", B: "Adiós", C: "Gracias", D: "Por favor" },
  correctAnswer: "A",
  explanation: "Hola is the standard greeting.",
};

describe("normalizeAssessment", () => {
  it("keeps complete questions and reads the title and rationale", () => {
    const result = normalizeAssessment({
      assessmentTitle: " Hotel Check-in ",
      levelRationale: "Simple present tense.",
      questions: [goodQuestion],
    });
    expect(result.assessmentTitle).toBe("Hotel Check-in");
    expect(result.questions).toHaveLength(1);
    expect(result.questions[0].correctAnswer).toBe("A");
  });

  it("drops questions with no text, no options, or an invalid correct letter", () => {
    const result = normalizeAssessment({
      questions: [
        { ...goodQuestion, questionText: "" },
        { ...goodQuestion, correctAnswer: "E" },
        { ...goodQuestion, correctAnswer: "C", options: { A: "x", B: "y", C: "", D: "z" } },
        "not a question",
        goodQuestion,
      ],
    });
    expect(result.questions).toHaveLength(1);
  });

  it("reads the correct letter from answers like 'b. Adiós'", () => {
    const result = normalizeAssessment({ questions: [{ ...goodQuestion, correctAnswer: "b. Adiós" }] });
    expect(result.questions[0].correctAnswer).toBe("B");
  });

  it("returns empty values when the model output is missing", () => {
    expect(normalizeAssessment(undefined)).toEqual({ assessmentTitle: "", levelRationale: "", questions: [] });
  });
});

describe("normalizeFibQuestions", () => {
  it("keeps sentences that have a missing word", () => {
    const result = normalizeFibQuestions({
      questions: [
        { sentence: "Ich ____ nach Hause.", correctWord: "gehe", hint: "Verb", contextClue: "I go home." },
        { sentence: "", correctWord: "x" },
        { sentence: "Missing answer", correctWord: "" },
      ],
    });
    expect(result.questions).toEqual([
      { sentence: "Ich ____ nach Hause.", correctWord: "gehe", hint: "Verb", contextClue: "I go home." },
    ]);
  });

  it("returns no questions for a bad payload", () => {
    expect(normalizeFibQuestions({ questions: "oops" }).questions).toEqual([]);
  });
});

describe("normalizeEvaluation", () => {
  it("uses the model status when it is valid", () => {
    expect(normalizeEvaluation({ isCorrect: false, status: "typo", feedback: "Close." })).toMatchObject({
      isCorrect: false,
      status: "typo",
      feedback: "Close.",
    });
  });

  it("derives the status from isCorrect when the status is unknown", () => {
    expect(normalizeEvaluation({ isCorrect: true, status: "great" }).status).toBe("correct");
    expect(normalizeEvaluation({ isCorrect: false }).status).toBe("incorrect");
  });
});

describe("normalizeChallenge", () => {
  it("keeps the seeded test type and guards the lists", () => {
    const result = normalizeChallenge(
      { challengeInstruction: "Translate this.", vocabularyHighlights: ["café", 3, " "], culturalTip: null },
      "translate_to_target",
    );
    expect(result.testType).toBe("translate_to_target");
    expect(result.vocabularyHighlights).toEqual(["café"]);
    expect(result.culturalTip).toBe("");
    expect(result.sourceText).toBe("");
  });
});

describe("normalizeFeedback and normalizeRoleplayReply", () => {
  it("clamps the fluency score to 1-10 and keeps null when absent", () => {
    expect(normalizeFeedback({ fluencyScore: 14 }).fluencyScore).toBe(10);
    expect(normalizeFeedback({ fluencyScore: 0 }).fluencyScore).toBe(1);
    expect(normalizeFeedback({}).fluencyScore).toBeNull();
  });

  it("reads the in-character reply with its feedback", () => {
    const reply = normalizeRoleplayReply({
      aiCharacterResponse: "Bonjour, qu'est-ce que vous voulez ?",
      linguisticCritique: "Good.",
      fluencyScore: 7,
      suggestedStrategies: ["Use 'je voudrais'."],
      isGoalAchieved: "true",
    });
    expect(reply).toEqual({
      aiCharacterResponse: "Bonjour, qu'est-ce que vous voulez ?",
      linguisticCritique: "Good.",
      fluencyScore: 7,
      suggestedStrategies: ["Use 'je voudrais'."],
      isGoalAchieved: true,
    });
  });
});
