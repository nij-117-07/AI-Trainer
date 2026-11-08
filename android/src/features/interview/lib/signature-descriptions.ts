// src/features/interview/lib/signature-descriptions.ts
/**
 * Instructions and field descriptions for the Interview Simulator Ax signatures. The text is copied
 * from the DSPy signatures in Backend/practice/interview/services.py, so both stacks give the model
 * the same guidance. The DSPy field name is noted beside each key.
 */

export const SESSION_MANAGER_DESCRIPTIONS = {
  instruction: `You are the Interview Session Orchestrator — the BRAIN of the interview.
You have the complete picture: candidate profile, position, interviewer role, time remaining, all past Q&A, and performance trends.
Based on ALL of this, you make the NEXT strategic decision and issue a clear DIRECTIVE to the Question Generator. The Question Generator will execute your directive — it does NOT make its own strategic choices.
DECISION FRAMEWORK:
1. If last answer was weak (score < 5) → consider "follow_up" to probe deeper OR "new_question" on a different topic if you've already probed enough
2. If last answer was strong (score >= 7) → "new_question" at higher difficulty
3. If a topic is under-tested → "new_question" on that topic
4. If time is running low → wrap up with a high-impact question
5. If max questions reached or all key areas covered → "end_session"
6. Balance question types across the session (don't ask 5 technical in a row)`,
  inputs: {
    // candidate_profile
    candidateProfile: "Candidate's background, experience, skills",
    // position_details
    positionDetails: "Target role, company, required skills, JD",
    // interview_context
    interviewContext: "Interviewer role, interview type, round, format, time",
    // session_history
    sessionHistory: "All Q&A so far with scores and reviews",
    // progress_state
    progressState: "Current scores, weak/strong areas, topic coverage",
    // questions_asked
    questionsAsked: "How many questions asked so far",
    // max_questions
    maxQuestions: "Total questions planned",
    // time_remaining_minutes
    timeRemainingMinutes: "Minutes left in session",
  },
  outputs: {
    // next_action
    nextAction: "The high-level action to take next",
    // action_reasoning
    actionReasoning: "Why this action was chosen (brief, 1-2 sentences)",
    // directive
    directive: `A clear instruction for the Question Generator. Structure:
{
    "action": "new_question" | "follow_up",
    "question_type": "technical" | "behavioral" | "system_design" | "coding" | "hr" | "leadership" | "domain",
    "topic": str,                          # Specific topic to cover
    "difficulty": "easy" | "medium" | "hard" | "expert",
    "focus_area": str,                     # What specifically to probe
    "should_reference_last_answer": bool,  # For follow-ups
    "tone_guidance": str,                  # How the question should feel
    "constraints": str                     # Any special instructions
}`,
  },
};

export const QUESTION_GENERATOR_DESCRIPTIONS = {
  instruction: `You are an expert Interviewer executing a directive from the Session Manager.
You receive a clear directive about WHAT to ask (type, topic, difficulty, focus). Your job is to craft the BEST possible question that:
- Sounds natural for the interviewer's role (Tech Lead asks differently than HR)
- Matches the interview format (phone screen = concise, onsite = detailed)
- Fits the company culture and team domain
- Is appropriately worded for the difficulty level
- If it's a follow-up, naturally builds on the previous conversation
You do NOT decide strategy — you execute the directive with expertise.`,
  inputs: {
    // directive
    directive: `The strategic directive from Session Manager:
{
    "action": "new_question" | "follow_up",
    "question_type": str,
    "topic": str,
    "difficulty": str,
    "focus_area": str,
    "should_reference_last_answer": bool,
    "tone_guidance": str,
    "constraints": str
}`,
    // candidate_profile
    candidateProfile: "Candidate's background",
    // position_details
    positionDetails: "Target position info",
    // interview_context
    interviewContext: "Interviewer role, type, format, round",
    // previous_question
    previousQuestion: "The last question asked (needed if directive is a follow-up)",
    // previous_answer
    previousAnswer: "The candidate's last answer (needed if directive is a follow-up)",
    // previous_review
    previousReview: "Review of the last answer (for follow-up context)",
    // all_questions_asked
    allQuestionsAsked: "All questions asked so far — never repeat",
  },
  outputs: {
    // question
    question:
      "The crafted question — natural, role-appropriate, and precisely targeting the directive",
    // topic
    topic: "Specific topic being tested",
    // difficulty
    difficulty: "Actual difficulty of the question",
    // expected_keywords
    expectedKeywords: "Key concepts a strong answer should include",
    // evaluation_criteria
    evaluationCriteria: "What differentiates a great answer from a poor one",
    // red_flags
    redFlags: "Concerning patterns in the answer",
    // sample_strong_answer
    sampleStrongAnswer: "What a 9/10 answer would look like (for reviewer calibration)",
    // sample_weak_answer
    sampleWeakAnswer: "What a 3/10 answer would look like (for reviewer calibration)",
  },
};

export const ANSWER_REVIEWER_DESCRIPTIONS = {
  instruction: `You are a meticulous Interview Answer Evaluator.
Be fair but strict. Great answers are specific, structured, and show real understanding — not textbook definitions. Penalize vague answers, reward concrete examples and trade-off discussions.
Grade relative to the position level — a Junior's answer is evaluated differently from a Senior's.`,
  inputs: {
    // question
    question: "The question that was asked",
    // candidate_answer
    candidateAnswer: "The candidate's complete answer",
    // expected_keywords
    expectedKeywords: "Key concepts expected",
    // evaluation_criteria
    evaluationCriteria: "What makes this answer great vs poor",
    // red_flags
    redFlags: "Concerning patterns to watch for",
    // sample_strong_answer
    sampleStrongAnswer: "What a 9/10 answer looks like",
    // sample_weak_answer
    sampleWeakAnswer: "What a 3/10 answer looks like",
    // position_level
    positionLevel: "Seniority level — calibrate expectations",
    // question_type
    questionType: "Category of question",
    // difficulty
    difficulty: "Expected difficulty",
  },
  outputs: {
    // overall_score
    overallScore: "0.0 to 10.0",
    // technical_accuracy
    technicalAccuracy: "0.0 to 10.0",
    // completeness
    completeness: "0.0 to 10.0",
    // clarity_score
    clarityScore: "0.0 to 10.0",
    // depth_score
    depthScore: "0.0 to 10.0",
    // strengths
    strengths: "What the candidate did well",
    // weaknesses
    weaknesses: "What needs improvement",
    // missed_keywords
    missedKeywords: "Expected concepts not covered",
    // red_flags_detected
    redFlagsDetected: "Which red flags appeared",
    // improved_answer
    improvedAnswer: "How an ideal answer would look",
    // weak_topics_identified
    weakTopicsIdentified: "Topics to study more",
    // recommendation
    recommendation: "What Session Manager should consider doing next based on this answer",
    // follow_up_suggestion
    followUpSuggestion: "If follow-up recommended, suggest the direction",
  },
};

export const PROGRESS_TRACKER_DESCRIPTIONS = {
  instruction: "Maintain the candidate's performance profile across the session.",
  inputs: {
    // current_profile
    currentProfile: "Current state",
    // latest_review
    latestReview: "Review from most recent answer",
    // question_topic
    questionTopic: "Topic of last question",
    // question_type
    questionType: "Type of last question",
  },
  outputs: {
    // updated_profile
    updatedProfile: `{
    "overall_score": float,
    "questions_answered": int,
    "weak_areas": List[str],
    "strong_areas": List[str],
    "topics_covered": List[str],
    "topic_scores": Dict[str, float],
    "type_scores": Dict[str, float],
    "recommended_next_topics": List[str],
    "confidence_level": str
}`,
    // performance_trend
    performanceTrend: "Direction of the candidate's performance across recent answers",
  },
};
