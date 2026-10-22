import logging
import uuid
from typing import Any, Dict, List, Optional

import dspy

from core.config import settings
from core.dspy_utils import build_lm, run_predictor
from practice.testing_portal.schemas import (
    AnswerRequest,
    AnswerResponse,
    MCQRequest,
    MCQResponse,
    MCQSolverRequest,
    MCQSolverResponse,
    TheoreticalRequest,
    TheoreticalResponse,
)

logger = logging.getLogger(__name__)


class TestingPortalError(Exception):
    """Base exception for all testing portal failures."""


class GenerationError(TestingPortalError):
    """Raised when the underlying DSPy pipeline fails to produce content."""


class MCQGenerator(dspy.Signature):
    """
    You are an expert Question Designer. Your task is to generate Multiple
    Choice Questions (MCQs) based on the provided topic, context data, and
    constraints. Ensure distractors (wrong options) are plausible and
    challenging.
    """

    random_seed: str = dspy.InputField(
        description="A unique UUID or seed to ensure randomness in the generation process."
    )
    topic: str = dspy.InputField(description="The subject or specific topic for the questions.")
    question_type: str = dspy.InputField(
        description="""
        The style of questions:
        - academic: Focus on theory and textbook definitions.
        - practical: Focus on real-world application and hands-on skills.
        - scenario-based: Situational 'what would you do' questions.
        - conceptual: Tests deep understanding of underlying principles.
        """
    )
    num_questions: int = dspy.InputField(description="The number of MCQs to generate.")
    difficulty_level: str = dspy.InputField(
        description="The complexity level of the questions."
    )
    context_setting: str = dspy.InputField(
        description="The scenario (e.g., Job Interview, University Exam, Certification)."
    )
    past_questions: Optional[str] = dspy.InputField(
        default=None,
        description="Previously generated questions to avoid repetition.",
    )
    custom_instructions: Optional[str] = dspy.InputField(
        default=None,
        description="Specific user requirements, like 'focus on technical implementation'.",
    )

    questions: List[Dict[str, Any]] = dspy.OutputField(description="""
        A list of MCQ objects. Each object must contain:
        - 'question_text': The actual question string.
        - 'options': A dictionary with keys 'A', 'B', 'C', 'D'.
        - 'correct_answer': The key (A, B, C, or D) corresponding to the right option.
    """)


class TheoreticalQuestionGenerator(dspy.Signature):
    """
    You are a Senior Academic Examiner and Technical Interviewer.
    Generate open-ended, theoretical, or scenario-based questions that
    evaluate deep conceptual understanding and critical thinking based on
    specific source data.
    """

    random_seed: str = dspy.InputField(
        description="A unique UUID or seed to ensure randomness in the generation process."
    )
    topic: str = dspy.InputField(description="The subject or specific domain for the questions.")
    question_type: str = dspy.InputField(
        description="""
        The style of the theoretical question:
        - academic: Focus on foundational principles and formal theories.
        - practical: Focus on solving real-world problems and implementation theory.
        - case-study: Analysis of a specific hypothetical or real scenario.
        - philosophical: Exploration of 'why' and ethics within the domain.
        - architectural: High-level system design and structural trade-offs.
        """
    )
    source_context: Optional[str] = dspy.InputField(
        default=None,
        description="The source text or data to use as the basis for analysis. If empty, use your knowledge.",
    )
    past_questions: Optional[str] = dspy.InputField(
        default=None,
        description="Previously generated questions to ensure variety.",
    )
    num_questions: int = dspy.InputField(description="The number of questions to generate.")
    difficulty_level: str = dspy.InputField(
        description="The depth and complexity of the questions."
    )
    context_setting: str = dspy.InputField(
        description="The scenario (e.g., Coding Interview, Research Paper, University Exam)."
    )
    custom_instructions: Optional[str] = dspy.InputField(
        default=None,
        description="Specific constraints (e.g., focus on trade-offs, security, or history).",
    )

    questions: List[Dict[str, str]] = dspy.OutputField(description="""
        A list of theoretical questions. Each object must contain:
        - 'question_text': The descriptive open-ended question.
        - 'focus_area': A brief tag (e.g., 'Scalability', 'Ethics', 'Performance').
        - 'evaluation_criteria': A brief summary of what a high-quality answer should include.
    """)


class TheoreticalAnswerGenerator(dspy.Signature):
    """
    You are a Subject Matter Expert. Your task is to provide comprehensive,
    accurate, and contextually appropriate answers to theoretical or technical
    questions. The answer should be tailored to the specific context (e.g.,
    teaching a student vs. evaluating a senior professional).
    """

    question: str = dspy.InputField(description="The theoretical/descriptive question to answer.")
    context: str = dspy.InputField(description="The setting (e.g., 'Job Interview', 'Academic Exam', 'Internal Training').")
    difficulty_level: str = dspy.InputField(description="The complexity level of the expected answer.")
    response_format: str = dspy.InputField(
        description="The structural style of the response."
    )
    custom_instructions: Optional[str] = dspy.InputField(
        default=None,
        description="Additional specific constraints or information.",
    )

    answer_text: str = dspy.OutputField(description="The generated response/answer.")
    key_concepts_covered: List[str] = dspy.OutputField(description="A list of core concepts or keywords included in the answer.")


class MCQDetailedAnswerGenerator(dspy.Signature):
    """
    You are an expert educator. Your task is to analyze a Multiple Choice
    Question and identify the correct option. You must also provide a clear,
    concise explanation justifying why that option is correct and why others
    are not.
    """

    question_text: str = dspy.InputField(description="The text of the question.")
    options: Dict[str, str] = dspy.InputField(description="A dictionary of options (e.g., {'A': 'text', 'B': 'text'}).")
    context_setting: Optional[str] = dspy.InputField(default=None, description="The scenario for the question (e.g., University Exam).")

    correct_option: str = dspy.OutputField(description="The letter of the correct option.")
    reasoning: str = dspy.OutputField(description="A brief explanation of the correct answer and logic.")


class TestingPortalService:
    """Business layer wrapping the DSPy testing portal pipelines."""

    def __init__(self) -> None:
        self.lm = build_lm(temperature=0.5)

    @staticmethod
    def _extract_past_questions(past_questions: Optional[List[str]]) -> str:
        """
        Extracts question texts from a list payload and keeps only the last N.

        Args:
            past_questions: Previously generated question strings.

        Returns:
            str: The trimmed, newline-joined past questions. Empty string when
            no questions are provided. The number of questions kept is bounded
            by settings.PAST_QUESTIONS_LIMIT.
        """
        if not past_questions:
            return ""

        texts: List[str] = [text.strip() for text in past_questions if text and text.strip()]
        return "\n".join(texts[-settings.PAST_QUESTIONS_LIMIT:])

    async def generate_mcqs(self, data: MCQRequest) -> MCQResponse:
        """
        Generates multiple choice questions using DSPy ChainOfThought.

        Args:
            data (MCQRequest): The validated MCQ generation request.

        Returns:
            MCQResponse: The generated MCQs.

        Raises:
            GenerationError: If the DSPy pipeline fails to produce questions.
        """
        try:
            cleaned_past = self._extract_past_questions(data.past_questions)
            result = run_predictor(
                MCQGenerator,
                self.lm,
                topic=data.topic,
                question_type=data.question_type,
                num_questions=data.num_questions,
                difficulty_level=data.difficulty_level,
                context_setting=data.context_setting,
                past_questions=cleaned_past,
                custom_instructions=data.custom_instructions,
                random_seed=str(uuid.uuid4()),
            )
            logger.info("Generated %d MCQs for topic: %s", len(result.questions), data.topic)
            return MCQResponse(questions=result.questions)
        except Exception as exc:
            logger.error("MCQ generation failed for topic %s: %s", data.topic, exc, exc_info=True)
            raise GenerationError(str(exc)) from exc

    async def generate_theoretical(self, data: TheoreticalRequest) -> TheoreticalResponse:
        """
        Generates open-ended theoretical questions using DSPy ChainOfThought.

        Args:
            data (TheoreticalRequest): The validated theoretical question request.

        Returns:
            TheoreticalResponse: The generated theoretical questions.

        Raises:
            GenerationError: If the DSPy pipeline fails to produce questions.
        """
        try:
            cleaned_past = self._extract_past_questions(data.past_questions)
            result = run_predictor(
                TheoreticalQuestionGenerator,
                self.lm,
                topic=data.topic,
                question_type=data.question_type,
                source_context=data.source_context,
                num_questions=data.num_questions,
                difficulty_level=data.difficulty_level,
                context_setting=data.context_setting,
                past_questions=cleaned_past,
                custom_instructions=data.custom_instructions,
                random_seed=str(uuid.uuid4()),
            )
            logger.info("Generated %d theoretical questions for topic: %s", len(result.questions), data.topic)
            return TheoreticalResponse(questions=result.questions)
        except Exception as exc:
            logger.error("Theoretical question generation failed for topic %s: %s", data.topic, exc, exc_info=True)
            raise GenerationError(str(exc)) from exc

    async def generate_answer(self, data: AnswerRequest) -> AnswerResponse:
        """
        Generates a detailed expert answer using the SME DSPy module.

        Args:
            data (AnswerRequest): The validated answer generation request.

        Returns:
            AnswerResponse: The generated expert answer.

        Raises:
            GenerationError: If the DSPy pipeline fails to produce an answer.
        """
        try:
            result = run_predictor(
                TheoreticalAnswerGenerator,
                self.lm,
                question=data.question,
                context=data.context,
                difficulty_level=data.difficulty,
                response_format=data.response_format,
                custom_instructions=data.custom_instructions,
            )
            logger.info("Generated SME answer for question: %s", data.question)
            return AnswerResponse(
                answer_text=result.answer_text,
                key_concepts_covered=result.key_concepts_covered,
            )
        except Exception as exc:
            logger.error("SME answer generation failed for question %s: %s", data.question, exc, exc_info=True)
            raise GenerationError(str(exc)) from exc

    async def solve_mcq(self, data: MCQSolverRequest) -> MCQSolverResponse:
        """
        Analyzes an MCQ to identify the correct answer and provide reasoning.

        Args:
            data (MCQSolverRequest): The validated MCQ solving request.

        Returns:
            MCQSolverResponse: The identified correct option and reasoning.

        Raises:
            GenerationError: If the DSPy pipeline fails to analyze the question.
        """
        try:
            result = run_predictor(
                MCQDetailedAnswerGenerator,
                self.lm,
                question_text=data.question,
                options=data.options,
                context_setting=data.context,
            )
            logger.info("Solved MCQ: %s", data.question)
            return MCQSolverResponse(
                correct_option=result.correct_option,
                reasoning=result.reasoning,
            )
        except Exception as exc:
            logger.error("MCQ solving failed for question %s: %s", data.question, exc, exc_info=True)
            raise GenerationError(str(exc)) from exc
