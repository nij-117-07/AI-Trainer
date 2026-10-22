import logging
from typing import Dict, List, Literal, Optional

import dspy

from core.dspy_utils import build_lm, run_predictor
from practice.guess_game.schemas import (
    CoachRequest,
    CoachResponse,
    GameStartRequest,
    GameStartResponse,
    GuessRequest,
    GuessResponse,
    HintRequest,
    HintResponse,
)

logger = logging.getLogger(__name__)

MAX_GUESSES_BY_DIFFICULTY: Dict[str, int] = {
    "easy": 10,
    "medium": 7,
    "hard": 5,
    "expert": 3,
}


class GuessGameError(Exception):
    """Base exception for all guess game failures."""


class GenerationError(GuessGameError):
    """Raised when a DSPy pipeline fails to produce content."""


class GameSetup(dspy.Signature):
    """
    You are a Game Master for a guessing game.
    Generate a mystery item (word, phrase, movie, book, etc.) based on category
    and difficulty. Keep the actual answer hidden — only return it internally
    for tracking.
    """

    category: Literal["word", "movie", "sentence", "book", "celebrity", "song"] = dspy.InputField(
        description="What type of thing the user will guess."
    )
    difficulty: Literal["easy", "medium", "hard", "expert"] = dspy.InputField(
        description="Difficulty level affecting obscurity and hint quality."
    )
    vocabulary_theme: Optional[str] = dspy.InputField(
        default=None,
        description="Optional theme constraint (e.g., 'sci-fi movies', 'animals', '90s slang').",
    )

    mystery_item: str = dspy.OutputField(description="The hidden answer (word/movie/sentence).")
    hint_1: str = dspy.OutputField(description="First vague hint (e.g., number of letters, genre, era).")
    fun_fact: str = dspy.OutputField(description="A fun trivia fact about the mystery item to share after reveal.")


class HintProvider(dspy.Signature):
    """
    You are a helpful hint generator for a guessing game.
    Provide escalating hints WITHOUT giving away the answer.
    Each hint should be more revealing than the last.
    """

    mystery_item: str = dspy.InputField(description="The actual answer (hidden from user).")
    category: str = dspy.InputField(description="What type of thing is being guessed.")
    previous_hints: List[str] = dspy.InputField(
        default=[],
        description="Hints already given to avoid repetition.",
    )
    hint_number: int = dspy.InputField(
        default=1,
        description="Which hint we're generating (1=first, 2=second, etc.).",
    )

    new_hint: str = dspy.OutputField(description="A fresh, increasingly revealing hint.")
    hint_encouragement: str = dspy.OutputField(description="An encouraging message to keep the user engaged.")


class GuessEvaluator(dspy.Signature):
    """
    You are the judge of a guessing game.
    Evaluate the user's guess against the mystery item.
    Provide helpful feedback that guides without confirming/revealing too much.
    """

    mystery_item: str = dspy.InputField(description="The actual hidden answer.")
    category: str = dspy.InputField(description="Type of thing being guessed.")
    user_guess: str = dspy.InputField(description="The user's attempted guess.")
    difficulty: str = dspy.InputField(description="Current difficulty level.")

    is_correct: bool = dspy.OutputField(description="True if the guess matches (allowing minor variations).")
    feedback: str = dspy.OutputField(description="Feedback message — encouraging if close, guiding if wrong.")
    closeness_score: float = dspy.OutputField(description="How close the guess was (0.0 to 1.0).")
    suggestion: str = dspy.OutputField(
        description="A subtle nudge or suggestion for the next guess (not the answer)."
    )


class FailGuide(dspy.Signature):
    """
    You are a compassionate game coach.
    The user is struggling. Provide guidance that helps them think differently
    WITHOUT spoiling the answer. Use hints, category reminders, or mental
    frameworks.
    """

    mystery_item: str = dspy.InputField(description="The actual answer.")
    category: str = dspy.InputField(description="What's being guessed.")
    failed_guesses: List[str] = dspy.InputField(description="Previous incorrect guesses.")
    hint_number: int = dspy.InputField(description="Current hint stage.")

    coaching_message: str = dspy.OutputField(description="Encouraging guidance with fresh angle.")
    thinking_framework: str = dspy.OutputField(
        description="A mental model or approach to help them guess better."
    )
    partial_reveal: Optional[str] = dspy.OutputField(
        default=None,
        description="Optional partial reveal (e.g., first letter, one word from phrase) for hard stages.",
    )
    ask_for_hint: bool = dspy.OutputField(description="True if we should suggest they ask for a hint.")


class GuessGameService:
    """Stateless business layer orchestrating the DSPy guessing game components."""

    def __init__(self) -> None:
        self.lm = build_lm(temperature=0.4)

    async def start_game(self, data: GameStartRequest) -> GameStartResponse:
        """
        Generates a mystery item, first hint, and fun fact for a new game.

        The response is persisted by the client's session/memory app, which
        passes the fields back with every subsequent request.

        Args:
            data (GameStartRequest): The validated start request.

        Returns:
            GameStartResponse: The generated setup for the client to persist.

        Raises:
            GenerationError: If the setup pipeline fails.
        """
        try:
            response = run_predictor(
                GameSetup,
                self.lm,
                category=data.category,
                difficulty=data.difficulty,
                vocabulary_theme=data.vocabulary_theme or "",
            )
            logger.info("Set up new %s %s game", data.difficulty, data.category)
            return GameStartResponse(
                mystery_item=response.mystery_item,
                fun_fact=response.fun_fact,
                first_hint=response.hint_1,
                max_guesses=MAX_GUESSES_BY_DIFFICULTY.get(data.difficulty, 7),
                message=f"New {data.difficulty.upper()} {data.category} game started!",
            )
        except Exception as exc:
            logger.error("Game setup failed: %s", exc, exc_info=True)
            raise GenerationError(str(exc)) from exc

    async def get_hint(self, data: HintRequest) -> HintResponse:
        """
        Generates the next hint without repeating previous ones.

        Args:
            data (HintRequest): The validated hint request.

        Returns:
            HintResponse: The new hint and the full list of hints used so far.

        Raises:
            GenerationError: If the hint pipeline fails.
        """
        try:
            response = run_predictor(
                HintProvider,
                self.lm,
                mystery_item=data.mystery_item,
                category=data.category,
                previous_hints=data.previous_hints,
                hint_number=len(data.previous_hints) + 1,
            )
            hints_used = data.previous_hints + [response.new_hint]
            logger.info("Generated hint %d", len(hints_used))
            return HintResponse(
                hint=response.new_hint,
                encouragement=response.hint_encouragement,
                hints_used=hints_used,
            )
        except Exception as exc:
            logger.error("Hint generation failed: %s", exc, exc_info=True)
            raise GenerationError(str(exc)) from exc

    async def check_guess(self, data: GuessRequest) -> GuessResponse:
        """
        Evaluates a user's guess against the mystery item.

        Args:
            data (GuessRequest): The validated guess request.

        Returns:
            GuessResponse: The evaluation of the guess.

        Raises:
            GenerationError: If the evaluation pipeline fails.
        """
        try:
            response = run_predictor(
                GuessEvaluator,
                self.lm,
                mystery_item=data.mystery_item,
                category=data.category,
                user_guess=data.guess,
                difficulty=data.difficulty,
            )
            logger.info(
                "Evaluated guess (correct=%s, closeness=%s)",
                response.is_correct,
                response.closeness_score,
            )
            return GuessResponse(
                correct=response.is_correct,
                feedback=response.feedback,
                closeness=response.closeness_score,
                suggestion=response.suggestion,
            )
        except Exception as exc:
            logger.error("Guess evaluation failed: %s", exc, exc_info=True)
            raise GenerationError(str(exc)) from exc

    async def get_coaching(self, data: CoachRequest) -> CoachResponse:
        """
        Provides coaching guidance for a struggling player.

        Args:
            data (CoachRequest): The validated coaching request.

        Returns:
            CoachResponse: The coaching message and mental framework.

        Raises:
            GenerationError: If the coaching pipeline fails.
        """
        try:
            response = run_predictor(
                FailGuide,
                self.lm,
                mystery_item=data.mystery_item,
                category=data.category,
                failed_guesses=data.failed_guesses,
                hint_number=data.hint_number,
            )
            logger.info("Coaching provided at hint stage %d", data.hint_number)
            return CoachResponse(
                coaching=response.coaching_message,
                framework=response.thinking_framework,
                partial_reveal=response.partial_reveal,
                should_hint=response.ask_for_hint,
            )
        except Exception as exc:
            logger.error("Coaching failed: %s", exc, exc_info=True)
            raise GenerationError(str(exc)) from exc
