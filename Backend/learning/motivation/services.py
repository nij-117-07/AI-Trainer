import logging
import uuid
from datetime import date
from typing import List, Literal, Optional

import dspy

from core.dspy_utils import build_lm, run_predictor
from learning.motivation.schemas import MotivationRequest, MotivationResponse, ReflectionRequest, ReflectionResponse

logger = logging.getLogger(__name__)


class MotivationError(Exception):
    """Base exception for all motivation module failures."""


class GenerationError(MotivationError):
    """Raised when the underlying DSPy pipeline fails to produce content."""


class MotivationalQuoteGenerator(dspy.Signature):
    """
    You are a world-class motivational coach and philosopher.
    Your goal is to provide a highly personalized, impactful quote
    based on the user's current emotional state and the specific date/context.
    """

    random_seed: str = dspy.InputField(description="A unique UUID or seed to ensure randomness in the generation process.")
    seed_topic: str = dspy.InputField(description="A keyword or topic to anchor the quote (e.g., Discipline, Loss, Success).")
    current_date: str = dspy.InputField(description="Today's date to help align with seasons or specific historical context.")
    quote_type: Literal["stoic", "modern", "poetic", "tough-love"] = dspy.InputField(description="The stylistic delivery of the quote.")
    user_feeling: str = dspy.InputField(description="How the user describes their current emotional state.")

    quote: str = dspy.OutputField(description="The generated motivational quote.")
    author_persona: str = dspy.OutputField(description="The persona/name attributed to the quote (e.g., 'The Stoic Path' or 'The Modern Hustler').")
    actionable_insight: str = dspy.OutputField(description="A 1-sentence micro-habit or action the user can take right now.")


class ReflectionPromptGenerator(dspy.Signature):
    """
    You are a compassionate journaling coach. Your mission is to help users
    transition from reactive thinking to deep self-awareness. Use the user's
    mood and goals to craft questions that bypass surface-level answers.
    """

    random_seed: str = dspy.InputField(description="A unique UUID or seed to ensure randomness in the generation process.")
    current_mood: str = dspy.InputField(description="User's mood today (e.g., 'anxious about work').")
    goal_alignment: str = dspy.InputField(description="Which personal goal or value they want to focus on.")
    recent_patterns: Optional[str] = dspy.InputField(default=None, description="Summarized mood/progress trends from the past week.")

    prompts: List[str] = dspy.OutputField(description="A list of 3 powerful, open-ended questions designed for deep journaling.")
    perspective_shift: str = dspy.OutputField(description="One transformative 'What if' sentence to reframe the user's current challenge.")


class MotivationService:
    """Business layer wrapping the DSPy motivation and reflection pipelines."""

    def __init__(self) -> None:
        self.lm = build_lm(temperature=0.5)

    async def generate_motivation_quote(self, data: MotivationRequest) -> MotivationResponse:
        """
        Generates a personalized motivational quote.

        Args:
            data: The validated quote request.

        Returns:
            MotivationResponse: The generated quote, persona, and insight.

        Raises:
            GenerationError: If the DSPy pipeline fails to generate content.
        """
        try:
            today_str = str(date.today())
            logger.info("Generating %s motivation for topic: %s", data.quote_type, data.seed_topic)

            execution_uuid = str(uuid.uuid4())
            prediction = run_predictor(
                MotivationalQuoteGenerator,
                self.lm,
                seed_topic=data.seed_topic,
                current_date=today_str,
                quote_type=data.quote_type,
                random_seed=execution_uuid,
                user_feeling=data.user_feeling,
            )

            return MotivationResponse(
                quote=prediction.quote,
                author_persona=prediction.author_persona,
                actionable_insight=prediction.actionable_insight,
                current_date=today_str,
            )
        except Exception as exc:
            logger.error("Motivation generation error: %s", exc, exc_info=True)
            raise GenerationError(str(exc)) from exc

    async def generate_reflection_session(self, data: ReflectionRequest) -> ReflectionResponse:
        """
        Generates journaling prompts and a perspective shift.

        Args:
            data: The validated reflection request.

        Returns:
            ReflectionResponse: The journaling prompts and reframing thought.

        Raises:
            GenerationError: If the DSPy pipeline fails to generate content.
        """
        try:
            logger.info("Generating reflection prompts for mood: %s", data.current_mood[:20])

            execution_uuid = str(uuid.uuid4())
            prediction = run_predictor(
                ReflectionPromptGenerator,
                self.lm,
                current_mood=data.current_mood,
                goal_alignment=data.goal_alignment,
                random_seed=execution_uuid,
                recent_patterns=data.recent_patterns or "No specific patterns recorded.",
            )

            return ReflectionResponse(
                prompts=prediction.prompts,
                perspective_shift=prediction.perspective_shift,
            )
        except Exception as exc:
            logger.error("Reflection generation error: %s", exc, exc_info=True)
            raise GenerationError(str(exc)) from exc
