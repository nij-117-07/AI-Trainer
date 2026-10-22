import logging
from typing import Any, Dict, List, Literal, Optional

import dspy

from core.dspy_utils import build_lm, run_predictor
from practice.interview.schemas import (
    AnswerReviewRequest,
    AnswerReviewResponse,
    ProgressTrackRequest,
    ProgressTrackResponse,
    QuestionGenerateRequest,
    QuestionGenerateResponse,
    SessionDecideRequest,
    SessionDecideResponse,
)

logger = logging.getLogger(__name__)


class InterviewError(Exception):
    """Base exception for all interview module failures."""


class GenerationError(InterviewError):
    """Raised when the underlying DSPy pipeline fails to produce content."""


class SessionManager(dspy.Signature):
    """You are the Interview Session Orchestrator — the BRAIN of the interview.

    You have the complete picture: candidate profile, position, interviewer role,
    time remaining, all past Q&A, and performance trends.

    Based on ALL of this, you make the NEXT strategic decision and issue a
    clear DIRECTIVE to the Question Generator. The Question Generator will
    execute your directive — it does NOT make its own strategic choices.

    DECISION FRAMEWORK:
    1. If last answer was weak (score < 5) → consider "follow_up" to probe deeper
       OR "new_question" on a different topic if you've already probed enough
    2. If last answer was strong (score >= 7) → "new_question" at higher difficulty
    3. If a topic is under-tested → "new_question" on that topic
    4. If time is running low → wrap up with a high-impact question
    5. If max questions reached or all key areas covered → "end_session"
    6. Balance question types across the session (don't ask 5 technical in a row)
    """

    # ─── Full Context Inputs ───
    candidate_profile: dict = dspy.InputField(description="Candidate's background, experience, skills")
    position_details: dict = dspy.InputField(description="Target role, company, required skills, JD")
    interview_context: dict = dspy.InputField(description="Interviewer role, interview type, round, format, time")

    session_history: List[Dict] = dspy.InputField(description="All Q&A so far with scores and reviews")
    progress_state: dict = dspy.InputField(description="Current scores, weak/strong areas, topic coverage")

    questions_asked: int = dspy.InputField(description="How many questions asked so far")
    max_questions: int = dspy.InputField(description="Total questions planned")
    time_remaining_minutes: int = dspy.InputField(description="Minutes left in session")

    # ═══════════════════════════════════════
    #         STRATEGIC DECISION
    # ═══════════════════════════════════════

    next_action: Literal["new_question", "follow_up", "switch_topic", "end_session"] = dspy.OutputField(
        description="The high-level action to take next"
    )
    action_reasoning: str = dspy.OutputField(
        description="Why this action was chosen (brief, 1-2 sentences)"
    )

    # ═══════════════════════════════════════
    #     DIRECTIVE TO QUESTION GENERATOR
    # ═══════════════════════════════════════

    directive: dict = dspy.OutputField(description="""
        A clear instruction for the Question Generator. Structure:
        {
            "action": "new_question" | "follow_up",
            "question_type": "technical" | "behavioral" | "system_design" | "coding" | "hr" | "leadership" | "domain",
            "topic": str,                          # Specific topic to cover
            "difficulty": "easy" | "medium" | "hard" | "expert",
            "focus_area": str,                     # What specifically to probe
            "should_reference_last_answer": bool,  # For follow-ups
            "tone_guidance": str,                  # How the question should feel
            "constraints": str                     # Any special instructions
        }
    """)


class QuestionGenerator(dspy.Signature):
    """You are an expert Interviewer executing a directive from the Session Manager.

    You receive a clear directive about WHAT to ask (type, topic, difficulty, focus).
    Your job is to craft the BEST possible question that:
    - Sounds natural for the interviewer's role (Tech Lead asks differently than HR)
    - Matches the interview format (phone screen = concise, onsite = detailed)
    - Fits the company culture and team domain
    - Is appropriately worded for the difficulty level
    - If it's a follow-up, naturally builds on the previous conversation

    You do NOT decide strategy — you execute the directive with expertise.
    """

    # ─── The Directive (from Session Manager) ───
    directive: dict = dspy.InputField(description="""
        The strategic directive from Session Manager:
        {
            "action": "new_question" | "follow_up",
            "question_type": str,
            "topic": str,
            "difficulty": str,
            "focus_area": str,
            "should_reference_last_answer": bool,
            "tone_guidance": str,
            "constraints": str
        }
    """)

    # ─── Context (needed to craft the question properly) ───
    candidate_profile: dict = dspy.InputField(description="Candidate's background")
    position_details: dict = dspy.InputField(description="Target position info")
    interview_context: dict = dspy.InputField(description="Interviewer role, type, format, round")

    # ─── For Follow-ups: Previous Context ───
    previous_question: Optional[str] = dspy.InputField(
        default=None,
        description="The last question asked (needed if directive is a follow-up)",
    )
    previous_answer: Optional[str] = dspy.InputField(
        default=None,
        description="The candidate's last answer (needed if directive is a follow-up)",
    )
    previous_review: Optional[dict] = dspy.InputField(
        default=None,
        description="Review of the last answer (for follow-up context)",
    )

    # ─── To Avoid Repetition ───
    all_questions_asked: List[str] = dspy.InputField(description="All questions asked so far — never repeat")

    # ═══════════════════════════════════════
    #              OUTPUTS
    # ═══════════════════════════════════════

    question: str = dspy.OutputField(
        description="The crafted question — natural, role-appropriate, and precisely targeting the directive"
    )
    topic: str = dspy.OutputField(description="Specific topic being tested")
    difficulty: Literal["easy", "medium", "hard", "expert"] = dspy.OutputField(
        description="Actual difficulty of the question"
    )

    expected_keywords: List[str] = dspy.OutputField(
        description="Key concepts a strong answer should include"
    )
    evaluation_criteria: str = dspy.OutputField(
        description="What differentiates a great answer from a poor one"
    )
    red_flags: List[str] = dspy.OutputField(
        description="Concerning patterns in the answer"
    )

    # For the reviewer to use later
    sample_strong_answer: str = dspy.OutputField(
        description="What a 9/10 answer would look like (for reviewer calibration)"
    )
    sample_weak_answer: str = dspy.OutputField(
        description="What a 3/10 answer would look like (for reviewer calibration)"
    )


class AnswerReviewer(dspy.Signature):
    """You are a meticulous Interview Answer Evaluator.

    Be fair but strict. Great answers are specific, structured, and show real
    understanding — not textbook definitions. Penalize vague answers, reward
    concrete examples and trade-off discussions.

    Grade relative to the position level — a Junior's answer is evaluated
    differently from a Senior's.
    """

    question: str = dspy.InputField(description="The question that was asked")
    candidate_answer: str = dspy.InputField(description="The candidate's complete answer")

    # Calibration from Question Generator
    expected_keywords: List[str] = dspy.InputField(description="Key concepts expected")
    evaluation_criteria: str = dspy.InputField(description="What makes this answer great vs poor")
    red_flags: List[str] = dspy.InputField(description="Concerning patterns to watch for")
    sample_strong_answer: str = dspy.InputField(description="What a 9/10 answer looks like")
    sample_weak_answer: str = dspy.InputField(description="What a 3/10 answer looks like")

    # Context for fair grading
    position_level: str = dspy.InputField(description="Seniority level — calibrate expectations")
    question_type: str = dspy.InputField(description="Category of question")
    difficulty: str = dspy.InputField(description="Expected difficulty")

    # ═══════════════════════════════════════
    #              OUTPUTS
    # ═══════════════════════════════════════

    overall_score: float = dspy.OutputField(description="0.0 to 10.0")
    technical_accuracy: float = dspy.OutputField(description="0.0 to 10.0")
    completeness: float = dspy.OutputField(description="0.0 to 10.0")
    clarity_score: float = dspy.OutputField(description="0.0 to 10.0")
    depth_score: float = dspy.OutputField(description="0.0 to 10.0")

    strengths: List[str] = dspy.OutputField(description="What the candidate did well")
    weaknesses: List[str] = dspy.OutputField(description="What needs improvement")
    missed_keywords: List[str] = dspy.OutputField(description="Expected concepts not covered")
    red_flags_detected: List[str] = dspy.OutputField(description="Which red flags appeared")

    improved_answer: str = dspy.OutputField(description="How an ideal answer would look")
    weak_topics_identified: List[str] = dspy.OutputField(description="Topics to study more")

    # Signal for Session Manager (NOT Question Generator directly)
    recommendation: Literal["move_on", "follow_up", "switch_topic"] = dspy.OutputField(
        description="What Session Manager should consider doing next based on this answer"
    )
    follow_up_suggestion: str = dspy.OutputField(
        description="If follow-up recommended, suggest the direction"
    )


class ProgressTracker(dspy.Signature):
    """Maintain the candidate's performance profile across the session."""

    current_profile: dict = dspy.InputField(description="Current state")
    latest_review: dict = dspy.InputField(description="Review from most recent answer")
    question_topic: str = dspy.InputField(description="Topic of last question")
    question_type: str = dspy.InputField(description="Type of last question")

    updated_profile: dict = dspy.OutputField(description="""
        {
            "overall_score": float,
            "questions_answered": int,
            "weak_areas": List[str],
            "strong_areas": List[str],
            "topics_covered": List[str],
            "topic_scores": Dict[str, float],
            "type_scores": Dict[str, float],
            "recommended_next_topics": List[str],
            "confidence_level": str
        }
    """)
    performance_trend: Literal["improving", "stable", "declining"] = dspy.OutputField(
        description="Direction of the candidate's performance across recent answers"
    )


class InterviewService:
    """Stateless business layer exposing one DSPy pipeline per interview endpoint."""

    def __init__(self) -> None:
        self.lm = build_lm(temperature=0.4, cache=False)

    @staticmethod
    def _as_dict(raw: object) -> Dict[str, Any]:
        """
        Coerces a raw LLM value into a dictionary.

        Args:
            raw (object): The raw LLM output.

        Returns:
            Dict[str, Any]: The dictionary value, or an empty dict.
        """
        return raw if isinstance(raw, dict) else {}

    @staticmethod
    def _coerce_list(value: object) -> List[Any]:
        """
        Coerces a raw value into a list of strings.

        Args:
            value (object): The raw LLM output.

        Returns:
            List[Any]: The list value.
        """
        if value is None:
            return []
        if isinstance(value, list):
            return [str(item) for item in value]
        return [str(value)]

    @staticmethod
    def _coerce_str(value: object, default: str = "") -> str:
        """
        Coerces a raw value into a string.

        Args:
            value (object): The raw LLM output.
            default (str): Fallback value.

        Returns:
            str: The coerced string.
        """
        if value is None:
            return default
        return str(value)

    @staticmethod
    def _coerce_float(value: object, default: float = 0.0, high: float = 10.0) -> float:
        """
        Coerces a raw value into a float clamped to [0, high].

        Args:
            value (object): The raw LLM output.
            default (float): Fallback value.
            high (float): Upper bound for clamping.

        Returns:
            float: A clamped float.
        """
        try:
            parsed = float(value)
        except (TypeError, ValueError):
            return default
        return max(0.0, min(high, parsed))

    async def decide_next(self, data: SessionDecideRequest) -> SessionDecideResponse:
        """
        Runs the SessionManager signature to choose the next interview move.

        Args:
            data (SessionDecideRequest): The validated decision request.

        Returns:
            SessionDecideResponse: The next action, reasoning, and directive.

        Raises:
            GenerationError: If the DSPy pipeline fails to produce a decision.
        """
        try:
            result = run_predictor(
                SessionManager,
                self.lm,
                candidate_profile=data.candidate_profile,
                position_details=data.position_details,
                interview_context=data.interview_context,
                session_history=data.session_history,
                progress_state=data.progress_state,
                questions_asked=data.questions_asked,
                max_questions=data.max_questions,
                time_remaining_minutes=data.time_remaining_minutes,
            )
            next_action = self._coerce_str(result.next_action, default="new_question")
            if next_action not in ("new_question", "follow_up", "switch_topic", "end_session"):
                logger.warning("Unexpected next_action '%s'; defaulting to new_question", next_action)
                next_action = "new_question"

            logger.info(
                "Session decision: %s after %d/%d questions",
                next_action,
                data.questions_asked,
                data.max_questions,
            )
            return SessionDecideResponse(
                next_action=next_action,
                action_reasoning=self._coerce_str(result.action_reasoning),
                directive=self._as_dict(result.directive),
            )
        except Exception as exc:
            logger.error("Interview session decision failed: %s", exc, exc_info=True)
            raise GenerationError(str(exc)) from exc

    async def generate_question(self, data: QuestionGenerateRequest) -> QuestionGenerateResponse:
        """
        Runs the QuestionGenerator signature to craft the next interview question.

        Args:
            data (QuestionGenerateRequest): The validated generation request.

        Returns:
            QuestionGenerateResponse: The question plus reviewer calibration data.

        Raises:
            GenerationError: If the DSPy pipeline fails to produce a question.
        """
        try:
            result = run_predictor(
                QuestionGenerator,
                self.lm,
                directive=data.directive,
                candidate_profile=data.candidate_profile,
                position_details=data.position_details,
                interview_context=data.interview_context,
                previous_question=data.previous_question,
                previous_answer=data.previous_answer,
                previous_review=data.previous_review,
                all_questions_asked=data.all_questions_asked,
            )
            difficulty = self._coerce_str(result.difficulty, default="medium")
            if difficulty not in ("easy", "medium", "hard", "expert"):
                logger.warning("Unexpected difficulty '%s'; defaulting to medium", difficulty)
                difficulty = "medium"

            logger.info("Generated interview question on topic '%s'", self._coerce_str(result.topic))
            return QuestionGenerateResponse(
                question=self._coerce_str(result.question),
                topic=self._coerce_str(result.topic),
                difficulty=difficulty,
                expected_keywords=self._coerce_list(result.expected_keywords),
                evaluation_criteria=self._coerce_str(result.evaluation_criteria),
                red_flags=self._coerce_list(result.red_flags),
                sample_strong_answer=self._coerce_str(result.sample_strong_answer),
                sample_weak_answer=self._coerce_str(result.sample_weak_answer),
            )
        except Exception as exc:
            logger.error("Interview question generation failed: %s", exc, exc_info=True)
            raise GenerationError(str(exc)) from exc

    async def review_answer(self, data: AnswerReviewRequest) -> AnswerReviewResponse:
        """
        Runs the AnswerReviewer signature to score and critique a candidate answer.

        Args:
            data (AnswerReviewRequest): The validated review request.

        Returns:
            AnswerReviewResponse: Scores, feedback, and a recommendation signal.

        Raises:
            GenerationError: If the DSPy pipeline fails to produce a review.
        """
        try:
            result = run_predictor(
                AnswerReviewer,
                self.lm,
                question=data.question,
                candidate_answer=data.candidate_answer,
                expected_keywords=data.expected_keywords,
                evaluation_criteria=data.evaluation_criteria,
                red_flags=data.red_flags,
                sample_strong_answer=data.sample_strong_answer,
                sample_weak_answer=data.sample_weak_answer,
                position_level=data.position_level,
                question_type=data.question_type,
                difficulty=data.difficulty,
            )
            recommendation = self._coerce_str(result.recommendation, default="move_on")
            if recommendation not in ("move_on", "follow_up", "switch_topic"):
                logger.warning(
                    "Unexpected recommendation '%s'; defaulting to move_on", recommendation
                )
                recommendation = "move_on"

            logger.info(
                "Reviewed answer with overall score %.1f (recommendation=%s)",
                self._coerce_float(result.overall_score),
                recommendation,
            )
            return AnswerReviewResponse(
                overall_score=self._coerce_float(result.overall_score),
                technical_accuracy=self._coerce_float(result.technical_accuracy),
                completeness=self._coerce_float(result.completeness),
                clarity_score=self._coerce_float(result.clarity_score),
                depth_score=self._coerce_float(result.depth_score),
                strengths=self._coerce_list(result.strengths),
                weaknesses=self._coerce_list(result.weaknesses),
                missed_keywords=self._coerce_list(result.missed_keywords),
                red_flags_detected=self._coerce_list(result.red_flags_detected),
                improved_answer=self._coerce_str(result.improved_answer),
                weak_topics_identified=self._coerce_list(result.weak_topics_identified),
                recommendation=recommendation,
                follow_up_suggestion=self._coerce_str(result.follow_up_suggestion),
            )
        except Exception as exc:
            logger.error("Interview answer review failed: %s", exc, exc_info=True)
            raise GenerationError(str(exc)) from exc

    async def track_progress(self, data: ProgressTrackRequest) -> ProgressTrackResponse:
        """
        Runs the ProgressTracker signature to merge a review into the profile.

        Args:
            data (ProgressTrackRequest): The validated progress request.

        Returns:
            ProgressTrackResponse: The updated profile and performance trend.

        Raises:
            GenerationError: If the DSPy pipeline fails to update the profile.
        """
        try:
            result = run_predictor(
                ProgressTracker,
                self.lm,
                current_profile=data.current_profile,
                latest_review=data.latest_review,
                question_topic=data.question_topic,
                question_type=data.question_type,
            )
            trend = self._coerce_str(result.performance_trend, default="stable")
            if trend not in ("improving", "stable", "declining"):
                logger.warning("Unexpected performance_trend '%s'; defaulting to stable", trend)
                trend = "stable"

            logger.info("Tracked progress for topic '%s' → trend=%s", data.question_topic, trend)
            return ProgressTrackResponse(
                updated_profile=self._as_dict(result.updated_profile),
                performance_trend=trend,
            )
        except Exception as exc:
            logger.error("Interview progress tracking failed: %s", exc, exc_info=True)
            raise GenerationError(str(exc)) from exc
