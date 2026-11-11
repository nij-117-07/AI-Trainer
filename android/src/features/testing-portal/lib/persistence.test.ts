// src/features/testing-portal/lib/persistence.test.ts
import {
  sanitizeAnswerResult,
  sanitizeGraderResult,
  sanitizeMcqAnswers,
  sanitizeMcqResult,
  sanitizeSolverResult,
  sanitizeTheoreticalAnswers,
  sanitizeTheoreticalResult,
} from "./persistence";

jest.mock("@/lib/document-store", () => ({
  loadDocument: jest.fn(),
  saveDocument: jest.fn(),
}));

const validOptions = { A: "one", B: "two", C: "three", D: "four" };

describe("sanitizeMcqResult", () => {
  it("drops damaged questions and keeps valid ones", () => {
    const result = sanitizeMcqResult({
      questions: [
        { questionText: " Q1 ", options: validOptions, correctAnswer: "B" },
        { questionText: "Q2", options: { ...validOptions, C: "" }, correctAnswer: "A" },
        { questionText: "Q3", options: validOptions, correctAnswer: "E" },
      ],
      history: ["Q1"],
      contextSetting: "Interview",
    });
    expect(result.questions).toEqual([{ questionText: "Q1", options: validOptions, correctAnswer: "B" }]);
    expect(result.history).toEqual(["Q1"]);
    expect(result.contextSetting).toBe("Interview");
  });

  it("returns an empty result for unreadable data", () => {
    expect(sanitizeMcqResult("oops")).toEqual({ questions: [], history: [], contextSetting: "" });
  });
});

describe("sanitizeAnswerResult", () => {
  it("keeps a saved answer and drops empty concepts", () => {
    expect(
      sanitizeAnswerResult({
        question: " What is CAP? ",
        answerText: "Consistency, availability, partition tolerance.",
        keyConceptsCovered: ["CAP", "  ", 3],
      }),
    ).toEqual({
      question: "What is CAP?",
      answerText: "Consistency, availability, partition tolerance.",
      keyConceptsCovered: ["CAP"],
    });
  });

  it("returns null when there is no answer text", () => {
    expect(sanitizeAnswerResult({ question: "Q", answerText: " " })).toBeNull();
    expect(sanitizeAnswerResult(null)).toBeNull();
  });
});

describe("sanitizeSolverResult", () => {
  it("keeps a saved solve and rejects an unknown option letter", () => {
    expect(
      sanitizeSolverResult({
        question: " Q? ",
        context: "",
        options: { A: "one", B: " two ", C: "three", D: "four" },
        correctOption: "B",
        reasoning: "Because.",
      }),
    ).toEqual({
      question: "Q?",
      context: "",
      options: { A: "one", B: "two", C: "three", D: "four" },
      correctOption: "B",
      reasoning: "Because.",
    });
    expect(sanitizeSolverResult({ options: validOptions, correctOption: "E" })).toBeNull();
  });
});

describe("sanitizeGraderResult", () => {
  it("keeps a saved grade and fills missing fields with defaults", () => {
    const result = sanitizeGraderResult({
      questionAsked: " How would you respond? ",
      userAnswerText: "",
      hadImage: true,
      grade: { score: "7.5", strengths: ["Calm tone", 4], isTargetMet: "yes" },
    });
    expect(result).toEqual({
      questionAsked: "How would you respond?",
      targetObjective: "",
      userAnswerText: "",
      hadImage: true,
      grade: {
        combinedAnalysis: "",
        score: 7.5,
        strengths: ["Calm tone"],
        weaknesses: [],
        detailedFeedback: "",
        isTargetMet: false,
      },
    });
  });

  it("keeps the graded objective", () => {
    expect(
      sanitizeGraderResult({ questionAsked: "Q", targetObjective: " Calm the customer ", grade: { score: 5 } })?.targetObjective,
    ).toBe("Calm the customer");
  });

  it("returns null when there is no grade", () => {
    expect(sanitizeGraderResult({ questionAsked: "Q" })).toBeNull();
  });
});

describe("sanitizeMcqAnswers", () => {
  it("keeps valid selections and drops damaged ones", () => {
    expect(
      sanitizeMcqAnswers({
        0: { selected: "B", checked: true },
        1: { selected: "E", checked: true },
        x: { selected: "A", checked: true },
        2: "A",
      }),
    ).toEqual({ 0: { selected: "B", checked: true } });
  });

  it("returns no answers for unreadable data", () => {
    expect(sanitizeMcqAnswers(null)).toEqual({});
  });
});

describe("sanitizeTheoreticalAnswers", () => {
  it("keeps the typed answer, grade, and model answer, and drops the rest", () => {
    expect(
      sanitizeTheoreticalAnswers({
        0: {
          answer: "My answer",
          gradedText: "My answer",
          grade: { score: 6, strengths: ["Clear"], isTargetMet: true },
          expert: { answerText: " Model ", keyConceptsCovered: ["CAP", ""] },
        },
        1: { answer: "Draft", gradedText: null, grade: null, expert: { answerText: " " } },
        bad: { answer: "Ignored" },
      }),
    ).toEqual({
      0: {
        answer: "My answer",
        gradedText: "My answer",
        grade: {
          combinedAnalysis: "",
          score: 6,
          strengths: ["Clear"],
          weaknesses: [],
          detailedFeedback: "",
          isTargetMet: true,
        },
        expert: { answerText: "Model", keyConceptsCovered: ["CAP"] },
      },
      1: { answer: "Draft", gradedText: null, grade: null, expert: null },
    });
  });
});

describe("sanitizeTheoreticalResult", () => {
  it("keeps questions with text and drops the rest", () => {
    const result = sanitizeTheoreticalResult({
      questions: [
        { questionText: "Explain CAP", focusArea: "Distributed", evaluationCriteria: "Trade-offs" },
        { focusArea: "No text" },
      ],
      history: [],
      contextSetting: "Staff interview",
      difficultyLevel: "advanced",
    });
    expect(result.questions).toEqual([
      { questionText: "Explain CAP", focusArea: "Distributed", evaluationCriteria: "Trade-offs" },
    ]);
    expect(result.contextSetting).toBe("Staff interview");
    expect(result.difficultyLevel).toBe("advanced");
  });

  it("returns an empty result for unreadable data", () => {
    expect(sanitizeTheoreticalResult(null)).toEqual({
      questions: [],
      history: [],
      contextSetting: "",
      difficultyLevel: "",
    });
  });
});
