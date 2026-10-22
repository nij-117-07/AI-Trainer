from typing import Any, Dict, List, Literal, Optional

from pydantic import BaseModel, Field

InterviewQuestionType = Literal[
    "technical", "behavioral", "system_design", "coding", "hr", "leadership", "domain"
]
InterviewDifficulty = Literal["easy", "medium", "hard", "expert"]
SessionNextAction = Literal["new_question", "follow_up", "switch_topic", "end_session"]
ReviewerRecommendation = Literal["move_on", "follow_up", "switch_topic"]
PerformanceTrend = Literal["improving", "stable", "declining"]


class SessionDecideRequest(BaseModel):
    """Request model for the SessionManager strategic decision endpoint."""

    candidate_profile: Dict[str, Any] = Field(
        default_factory=dict,
        description="Candidate's background, experience, skills",
    )
    position_details: Dict[str, Any] = Field(
        default_factory=dict,
        description="Target role, company, required skills, job description",
    )
    interview_context: Dict[str, Any] = Field(
        default_factory=dict,
        description="Interviewer role, interview type, round, format, time budget",
    )
    session_history: List[Dict[str, Any]] = Field(
        default_factory=list,
        description="All Q&A so far with scores and reviews",
    )
    progress_state: Dict[str, Any] = Field(
        default_factory=dict,
        description="Current scores, weak/strong areas, topic coverage",
    )
    questions_asked: int = Field(0, ge=0, description="How many questions asked so far")
    max_questions: int = Field(10, ge=1, description="Total questions planned")
    time_remaining_minutes: int = Field(30, ge=0, description="Minutes left in the session")


class SessionDecideResponse(BaseModel):
    """Response model containing the next strategic directive for the question generator."""

    next_action: SessionNextAction = Field(..., description="High-level action to take next")
    action_reasoning: str = Field("", description="Why this action was chosen")
    directive: Dict[str, Any] = Field(
        default_factory=dict,
        description="Instruction for the question generator (action, topic, difficulty, focus)",
    )
    status: str = "success"


class QuestionGenerateRequest(BaseModel):
    """Request model for the QuestionGenerator endpoint."""

    directive: Dict[str, Any] = Field(
        default_factory=dict,
        description="Strategic directive from /session/decide (or a hand-built equivalent)",
    )
    candidate_profile: Dict[str, Any] = Field(
        default_factory=dict,
        description="Candidate's background",
    )
    position_details: Dict[str, Any] = Field(
        default_factory=dict,
        description="Target position info",
    )
    interview_context: Dict[str, Any] = Field(
        default_factory=dict,
        description="Interviewer role, type, format, round",
    )
    previous_question: Optional[str] = Field(
        None, description="Last question asked (needed for follow-ups)"
    )
    previous_answer: Optional[str] = Field(
        None, description="Candidate's last answer (needed for follow-ups)"
    )
    previous_review: Optional[Dict[str, Any]] = Field(
        None, description="Review of the last answer (for follow-up context)"
    )
    all_questions_asked: List[str] = Field(
        default_factory=list,
        description="All questions asked so far — the generator never repeats these",
    )


class QuestionGenerateResponse(BaseModel):
    """Response model containing a crafted interview question and its calibration data."""

    question: str = Field("", description="The crafted question")
    topic: str = Field("", description="Specific topic being tested")
    difficulty: InterviewDifficulty = Field("medium", description="Difficulty of the question")
    expected_keywords: List[str] = Field(
        default_factory=list, description="Key concepts a strong answer should include"
    )
    evaluation_criteria: str = Field(
        "", description="What differentiates a great answer from a poor one"
    )
    red_flags: List[str] = Field(
        default_factory=list, description="Concerning patterns in the answer"
    )
    sample_strong_answer: str = Field("", description="What a 9/10 answer looks like")
    sample_weak_answer: str = Field("", description="What a 3/10 answer looks like")
    status: str = "success"


class AnswerReviewRequest(BaseModel):
    """Request model for the AnswerReviewer endpoint."""

    question: str = Field(..., description="The question that was asked")
    candidate_answer: str = Field(..., description="The candidate's complete answer")
    position_level: str = Field("mid-level", description="Seniority level for calibration")
    question_type: str = Field("technical", description="Category of the question")
    difficulty: str = Field("medium", description="Expected difficulty")
    expected_keywords: List[str] = Field(
        default_factory=list, description="Key concepts expected (from /question/generate)"
    )
    evaluation_criteria: str = Field(
        "", description="What makes this answer great vs poor (from /question/generate)"
    )
    red_flags: List[str] = Field(
        default_factory=list, description="Concerning patterns to watch for"
    )
    sample_strong_answer: str = Field("", description="What a 9/10 answer looks like")
    sample_weak_answer: str = Field("", description="What a 3/10 answer looks like")


class AnswerReviewResponse(BaseModel):
    """Response model containing the scored review of a candidate answer."""

    overall_score: float = Field(0.0, ge=0.0, le=10.0, description="Overall score (0.0-10.0)")
    technical_accuracy: float = Field(0.0, ge=0.0, le=10.0, description="Technical accuracy (0.0-10.0)")
    completeness: float = Field(0.0, ge=0.0, le=10.0, description="Completeness (0.0-10.0)")
    clarity_score: float = Field(0.0, ge=0.0, le=10.0, description="Clarity (0.0-10.0)")
    depth_score: float = Field(0.0, ge=0.0, le=10.0, description="Depth (0.0-10.0)")
    strengths: List[str] = Field(default_factory=list, description="What the candidate did well")
    weaknesses: List[str] = Field(
        default_factory=list, description="What needs improvement"
    )
    missed_keywords: List[str] = Field(
        default_factory=list, description="Expected concepts not covered"
    )
    red_flags_detected: List[str] = Field(
        default_factory=list, description="Which red flags appeared"
    )
    improved_answer: str = Field("", description="How an ideal answer would look")
    weak_topics_identified: List[str] = Field(
        default_factory=list, description="Topics to study more"
    )
    recommendation: ReviewerRecommendation = Field(
        "move_on", description="What the session manager should consider doing next"
    )
    follow_up_suggestion: str = Field(
        "", description="Suggested follow-up direction, when applicable"
    )
    status: str = "success"


class ProgressTrackRequest(BaseModel):
    """Request model for the ProgressTracker endpoint."""

    current_profile: Dict[str, Any] = Field(
        default_factory=dict, description="Current performance profile (empty on first call)"
    )
    latest_review: Dict[str, Any] = Field(
        default_factory=dict, description="Review produced by /answer/review"
    )
    question_topic: str = Field("", description="Topic of the last question")
    question_type: str = Field("technical", description="Type of the last question")


class ProgressTrackResponse(BaseModel):
    """Response model containing the updated candidate performance profile."""

    updated_profile: Dict[str, Any] = Field(
        default_factory=dict, description="Merged performance profile — persist this"
    )
    performance_trend: PerformanceTrend = Field(
        "stable", description="Whether performance is improving, stable, or declining"
    )
    status: str = "success"
