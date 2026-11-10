import { SAMPLE_SETUP_FORM } from "./test-fixtures";
import type { AnswerReview, SessionHistoryEntry } from "../types";
import { validateSetup } from "./validate";
import { contextBlocks, historyLines, reviewJson, splitList } from "./wire";

const review: AnswerReview = {
  overallScore: 6,
  technicalAccuracy: 6,
  completeness: 5,
  clarityScore: 7,
  depthScore: 4,
  strengths: ["Clear"],
  weaknesses: [],
  missedKeywords: ["retry"],
  redFlagsDetected: [],
  improvedAnswer: "",
  weakTopicsIdentified: [],
  recommendation: "follow_up",
  followUpSuggestion: "Ask about retries",
};

describe("splitList", () => {
  it("splits comma-separated skills and drops blanks", () => {
    expect(splitList("Python, AWS,, Kafka ")).toEqual(["Python", "AWS", "Kafka"]);
  });
});

describe("contextBlocks", () => {
  it("uses the backend's snake_case keys and omits an empty company", () => {
    const blocks = contextBlocks(validateSetup(SAMPLE_SETUP_FORM));
    const candidate = JSON.parse(blocks.candidateProfile);
    const position = JSON.parse(blocks.positionDetails);
    const context = JSON.parse(blocks.interviewContext);
    expect(candidate.skills).toEqual(["Python", "FastAPI", "PostgreSQL", "AWS"]);
    expect(position).not.toHaveProperty("company");
    expect(position.required_skills).toEqual(["Python", "AWS", "Distributed systems"]);
    expect(context).toEqual({
      interviewer_role: "Tech Lead",
      type: "technical",
      round: "technical round",
      format: "60 min live",
      duration_minutes: 60,
    });
  });
});

describe("reviewJson and historyLines", () => {
  it("writes the review with backend keys", () => {
    expect(JSON.parse(reviewJson(review))).toMatchObject({ overall_score: 6, missed_keywords: ["retry"] });
  });

  it("writes one JSON line per past question", () => {
    const entry: SessionHistoryEntry = {
      question: "What is a cache stampede?",
      answer: "Many requests miss at once.",
      topic: "Caching",
      questionType: "technical",
      difficulty: "medium",
      review,
    };
    const lines = historyLines([entry, entry]);
    expect(lines).toHaveLength(2);
    expect(lines.every((line) => !line.includes("\n"))).toBe(true);
    expect(JSON.parse(lines[0])).toMatchObject({ question_type: "technical", review: { overall_score: 6 } });
  });
});
