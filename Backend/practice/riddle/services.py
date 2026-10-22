import logging
import uuid
from typing import Dict

import dspy

from core.dspy_utils import build_lm, run_predictor
from practice.riddle.schemas import (
    CognitiveDomain,
    DifficultyLevel,
    EvaluationRequest,
    EvaluationResponse,
    RiddleRequest,
    RiddleResponse,
)

logger = logging.getLogger(__name__)


class RiddleError(Exception):
    """Base exception for all riddle module failures."""


class GenerationError(RiddleError):
    """Raised when the underlying DSPy pipeline fails to produce content."""


class AdaptiveRiddleGenerator(dspy.Signature):
    """
    Generates personalized riddles that adapt to the user's cognitive level.
    Uses a seed for variability to ensure unique puzzles.
    """

    field_of_interest: str = dspy.InputField(description="The topic (e.g. Space, History).")
    target_domain: CognitiveDomain = dspy.InputField(description="Cognitive domain.")
    difficulty_level: DifficultyLevel = dspy.InputField(description="Difficulty tier.")
    seed: int = dspy.InputField(description="A random seed for variety.")

    riddle_text: str = dspy.OutputField(description="The riddle/puzzle text.")
    solution: str = dspy.OutputField(description="Clear explanation of the logic.")
    cognitive_trigger: str = dspy.OutputField(description="The mental hook being trained.")


class RiddleEvaluator(dspy.Signature):
    """
    Evaluates the user's answer. Determines correctness and provides feedback.
    """

    riddle_text: str = dspy.InputField(description="The original riddle.")
    solution: str = dspy.InputField(description="The correct answer.")
    user_answer: str = dspy.InputField(description="The user's attempt or request for help.")

    is_correct: bool = dspy.OutputField(description="True if the answer is logically correct.")
    feedback: str = dspy.OutputField(description="Feedback or a hint if incorrect. Do not reveal the answer.")
    thought_redirection: str = dspy.OutputField(description="Instruction on how to shift their perspective.")


class RiddleService:
    """Stateless business layer wrapping the DSPy riddle pipelines."""

    def __init__(self) -> None:
        self.lms: Dict[float, dspy.LM] = {
            temperature: build_lm(temperature=temperature, cache=False)
            for temperature in (0.7, 0.2)
        }

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
    def _coerce_bool(value: object) -> bool:
        """
        Coerces a raw value into a boolean.

        Args:
            value (object): The raw LLM output.

        Returns:
            bool: The coerced boolean.
        """
        if isinstance(value, bool):
            return value
        return str(value).strip().lower() in ("true", "1", "yes", "y")

    async def generate_riddle(self, data: RiddleRequest) -> RiddleResponse:
        """
        Generates an adaptive riddle for the given topic and difficulty.

        Args:
            data (RiddleRequest): The validated request.

        Returns:
            RiddleResponse: The generated riddle.

        Raises:
            GenerationError: If the generation pipeline fails.
        """
        try:
            result = run_predictor(
                AdaptiveRiddleGenerator,
                self.lms[0.7],
                field_of_interest=data.field_of_interest,
                target_domain=data.target_domain,
                difficulty_level=data.difficulty_level,
                seed=uuid.uuid4().int % (10**6),
            )
            logger.info("Generated riddle on topic '%s'", data.field_of_interest)
            return RiddleResponse(
                riddle_text=self._coerce_str(result.riddle_text),
                solution=self._coerce_str(result.solution),
                cognitive_trigger=self._coerce_str(result.cognitive_trigger),
            )
        except Exception as exc:
            logger.error("Riddle generation failed: %s", exc, exc_info=True)
            raise GenerationError(str(exc)) from exc

    async def evaluate_answer(self, data: EvaluationRequest) -> EvaluationResponse:
        """
        Evaluates a user's answer against the riddle solution.

        Args:
            data (EvaluationRequest): The validated request.

        Returns:
            EvaluationResponse: The correctness verdict and feedback.

        Raises:
            GenerationError: If the evaluation pipeline fails.
        """
        try:
            result = run_predictor(
                RiddleEvaluator,
                self.lms[0.2],
                riddle_text=data.riddle_text,
                solution=data.solution,
                user_answer=data.user_answer,
            )
            logger.info("Evaluated a riddle answer")
            return EvaluationResponse(
                is_correct=self._coerce_bool(result.is_correct),
                feedback=self._coerce_str(result.feedback),
                thought_redirection=self._coerce_str(result.thought_redirection),
            )
        except Exception as exc:
            logger.error("Riddle evaluation failed: %s", exc, exc_info=True)
            raise GenerationError(str(exc)) from exc
