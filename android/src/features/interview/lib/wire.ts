// src/features/interview/lib/wire.ts
/**
 * Converts app state into the JSON the model reads. The keys follow the backend dictionaries, so
 * the prompts see the same structure the DSPy service sends.
 */
import type { AnswerReview, Directive, InterviewSetup, ProgressProfile, SessionHistoryEntry } from "../types";

export function splitList(value: string): string[] {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function contextBlocks(setup: InterviewSetup): {
  candidateProfile: string;
  positionDetails: string;
  interviewContext: string;
} {
  return {
    candidateProfile: JSON.stringify({
      name: setup.candidateName,
      experience: setup.candidateExperience,
      skills: splitList(setup.candidateSkills),
    }),
    positionDetails: JSON.stringify({
      role: setup.positionRole,
      company: setup.positionCompany || undefined,
      required_skills: splitList(setup.positionSkills),
      level: setup.positionLevel,
    }),
    interviewContext: JSON.stringify({
      interviewer_role: setup.interviewerRole,
      type: setup.interviewType,
      round: setup.interviewRound,
      format: setup.interviewFormat,
      duration_minutes: setup.durationMinutes,
    }),
  };
}

export function directiveJson(directive: Directive): string {
  return JSON.stringify({
    action: directive.action,
    question_type: directive.questionType,
    topic: directive.topic,
    difficulty: directive.difficulty,
    focus_area: directive.focusArea,
    should_reference_last_answer: directive.shouldReferenceLastAnswer,
    tone_guidance: directive.toneGuidance,
    constraints: directive.constraints,
  });
}

export function reviewJson(review: AnswerReview): string {
  return JSON.stringify({
    overall_score: review.overallScore,
    technical_accuracy: review.technicalAccuracy,
    completeness: review.completeness,
    clarity_score: review.clarityScore,
    depth_score: review.depthScore,
    strengths: review.strengths,
    weaknesses: review.weaknesses,
    missed_keywords: review.missedKeywords,
    red_flags_detected: review.redFlagsDetected,
    improved_answer: review.improvedAnswer,
    weak_topics_identified: review.weakTopicsIdentified,
    recommendation: review.recommendation,
    follow_up_suggestion: review.followUpSuggestion,
  });
}

export function profileJson(profile: ProgressProfile): string {
  return JSON.stringify({
    overall_score: profile.overallScore,
    questions_answered: profile.questionsAnswered,
    weak_areas: profile.weakAreas,
    strong_areas: profile.strongAreas,
    topics_covered: profile.topicsCovered,
    topic_scores: profile.topicScores,
    type_scores: profile.typeScores,
    recommended_next_topics: profile.recommendedNextTopics,
    confidence_level: profile.confidenceLevel,
  });
}

/** One JSON line per past question, matching the backend's session history entries. */
export function historyLines(entries: SessionHistoryEntry[]): string[] {
  return entries.map((entry) =>
    JSON.stringify({
      question: entry.question,
      answer: entry.answer,
      topic: entry.topic,
      question_type: entry.questionType,
      difficulty: entry.difficulty,
      review: JSON.parse(reviewJson(entry.review)),
    }),
  );
}
