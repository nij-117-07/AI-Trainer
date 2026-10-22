import logging
import uuid

import dspy

from core.dspy_utils import build_lm, run_predictor
from practice.puzzle.schemas import (
    CognitiveDomain,
    DifficultyLevel,
    PuzzleEvaluationRequest,
    PuzzleEvaluationResponse,
    PuzzleRequest,
    PuzzleResponse,
    PuzzleType,
)

logger = logging.getLogger(__name__)


class PuzzleError(Exception):
    """Base exception for all puzzle module failures."""


class GenerationError(PuzzleError):
    """Raised when the underlying DSPy pipeline fails to produce content."""


class AdaptivePuzzleGenerator(dspy.Signature):
    """
    Generates highly personalized puzzles and brain teasers.
    The agent adapts the complexity and logic style based on the target domain,
    puzzle type, and difficulty tier to provide a tailored cognitive challenge.
    """

    field_of_interest: str = dspy.InputField(
        description="The thematic topic (e.g., Cyberpunk, Ancient Egypt, Quantum Physics)."
    )
    puzzle_type: PuzzleType = dspy.InputField(
        description="The specific format of the puzzle."
    )
    target_domain: CognitiveDomain = dspy.InputField(
        description="The primary cognitive skill the puzzle should exercise."
    )
    difficulty_level: DifficultyLevel = dspy.InputField(
        description="The depth of reasoning required to solve the puzzle."
    )
    seed: int = dspy.InputField(
        description="A numerical seed to ensure variety and uniqueness in generation."
    )

    puzzler_persona: str = dspy.OutputField(
        description="A short flavor-text description of the entity presenting the puzzle."
    )
    puzzle_text: str = dspy.OutputField(
        description="The actual content of the puzzle or brain teaser."
    )
    solution: str = dspy.OutputField(
        description="The correct answer with a step-by-step logical breakdown."
    )
    cognitive_trigger: str = dspy.OutputField(
        description="Analysis of the mental 'trap' or insight required to solve it."
    )


class PuzzleEvaluator(dspy.Signature):
    """
    Evaluates a user's response to a puzzle. It determines logical correctness,
    calculates how close the user was, and provides targeted hints without spoiling the solution.
    """

    puzzle_context: str = dspy.InputField(description="The full text of the puzzle/challenge.")
    puzzle_type: str = dspy.InputField(description="The type of puzzle (e.g., cipher, logic grid, sequence).")
    official_solution: str = dspy.InputField(description="The factual correct answer and logic.")
    user_response: str = dspy.InputField(description="The user's input, answer, or query.")

    is_correct: bool = dspy.OutputField(description="Boolean indicating if the answer matches the solution's logic.")
    accuracy_score: float = dspy.OutputField(description="A score from 0.0 to 1.0 representing how close the user was.")
    evaluation_feedback: str = dspy.OutputField(description="Encouraging feedback. If wrong, point out the logical flaw.")
    hint_redirection: str = dspy.OutputField(description="A nudge toward the right path. Only provide if is_correct is False.")
    metacognitive_prompt: str = dspy.OutputField(description="A question to help the user rethink their approach.")


class PuzzleService:
    """Stateless business layer wrapping the DSPy puzzle pipelines."""

    def __init__(self) -> None:
        self.lm = build_lm(temperature=0.7, cache=False)

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

    @staticmethod
    def _coerce_float(value: object, default: float = 0.5) -> float:
        """
        Coerces a raw value into a float clamped to [0, 1].

        Args:
            value (object): The raw LLM output.
            default (float): Fallback value.

        Returns:
            float: A clamped float.
        """
        try:
            parsed = float(value)
        except (TypeError, ValueError):
            return default
        return max(0.0, min(1.0, parsed))

    async def generate_puzzle(self, data: PuzzleRequest) -> PuzzleResponse:
        """
        Generates a personalized cognitive puzzle.

        Args:
            data (PuzzleRequest): The validated request.

        Returns:
            PuzzleResponse: The generated puzzle.

        Raises:
            GenerationError: If the generation pipeline fails.
        """
        try:
            result = run_predictor(
                AdaptivePuzzleGenerator,
                self.lm,
                field_of_interest=data.field_of_interest,
                puzzle_type=data.puzzle_type,
                target_domain=data.target_domain,
                difficulty_level=data.difficulty_level,
                seed=uuid.uuid4().int % (10**6),
            )
            logger.info("Generated puzzle of type '%s'", data.puzzle_type)
            return PuzzleResponse(
                puzzler_persona=self._coerce_str(result.puzzler_persona),
                puzzle_text=self._coerce_str(result.puzzle_text),
                solution=self._coerce_str(result.solution),
                cognitive_trigger=self._coerce_str(result.cognitive_trigger),
            )
        except Exception as exc:
            logger.error("Puzzle generation failed: %s", exc, exc_info=True)
            raise GenerationError(str(exc)) from exc

    async def evaluate_puzzle(self, data: PuzzleEvaluationRequest) -> PuzzleEvaluationResponse:
        """
        Evaluates a puzzle attempt with accuracy scoring and metacognitive prompts.

        Args:
            data (PuzzleEvaluationRequest): The validated request.

        Returns:
            PuzzleEvaluationResponse: The evaluation result.

        Raises:
            GenerationError: If the evaluation pipeline fails.
        """
        try:
            result = run_predictor(
                PuzzleEvaluator,
                self.lm,
                puzzle_context=data.puzzle_context,
                puzzle_type=data.puzzle_type,
                official_solution=data.official_solution,
                user_response=data.user_response,
            )
            is_correct = self._coerce_bool(result.is_correct)
            logger.info("Evaluated a puzzle attempt (correct=%s)", is_correct)
            return PuzzleEvaluationResponse(
                is_correct=is_correct,
                accuracy_score=self._coerce_float(result.accuracy_score),
                evaluation_feedback=self._coerce_str(result.evaluation_feedback),
                hint_redirection=self._coerce_str(result.hint_redirection) if not is_correct else None,
                metacognitive_prompt=self._coerce_str(result.metacognitive_prompt),
            )
        except Exception as exc:
            logger.error("Puzzle evaluation failed: %s", exc, exc_info=True)
            raise GenerationError(str(exc)) from exc
