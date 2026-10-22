import logging
from datetime import datetime
from typing import List, Literal

import dspy

from core.dspy_utils import build_lm, run_predictor
from linguistic.sentence_of_the_day.schemas import SentenceRequest, SentenceResponse

logger = logging.getLogger(__name__)


class SentenceOfTheDayError(Exception):
    """Base exception for all sentence_of_the_day module failures."""


class GenerationError(SentenceOfTheDayError):
    """Raised when the underlying DSPy pipeline fails to produce content."""


class SentenceOfTheDaySignature(dspy.Signature):
    """
    You are a Cultural Linguistic Guide. Your goal is to provide a 'Sentence
    of the Day' that captures the soul of the target language. You focus on
    idiomatic expressions, proverbs, or sophisticated conversational structures
    that don't always translate literally.
    """

    date: str = dspy.InputField(desc="YYYY-MM-DD")
    target_language: str = dspy.InputField(desc="The language the user is learning.")
    native_language: str = dspy.InputField(desc="The user's primary language.")
    context_setting: Literal["business", "casual", "literary", "romantic", "travel"] = dspy.InputField()
    complexity_level: Literal["beginner", "intermediate", "advanced", "native-level"] = dspy.InputField()
    seed: str = dspy.InputField(desc="Entropy string for variety.")

    target_sentence: str = dspy.OutputField(desc="The sentence in the target language.")
    literal_translation: str = dspy.OutputField(desc="Word-for-word translation in native language.")
    natural_translation: str = dspy.OutputField(desc="The equivalent 'meaning-based' translation in native language.")
    grammatical_highlight: str = dspy.OutputField(desc="Explanation of a specific rule or tense used in the sentence.")
    cultural_context: str = dspy.OutputField(desc="Where and why a native would say this. Any hidden social taboos or nuances.")
    substitution_options: List[str] = dspy.OutputField(desc="2-3 variations of the sentence by changing one key word.")


class SentenceService:
    """Business layer wrapping the DSPy Sentence of the Day pipeline."""

    def __init__(self) -> None:
        self.lm = build_lm(cache=False)

    def generate_daily_sentence(self, data: SentenceRequest) -> SentenceResponse:
        """
        Generates a culturally relevant sentence using DSPy.

        Args:
            data (SentenceRequest): The validated request schema.

        Returns:
            SentenceResponse: Validated Pydantic model with linguistic data.

        Raises:
            GenerationError: If the DSPy pipeline fails to produce content.
        """
        today = datetime.now().strftime("%Y-%m-%d")
        try:
            response = run_predictor(
                SentenceOfTheDaySignature,
                self.lm,
                date=today,
                target_language=data.target_language,
                native_language=data.native_language,
                context_setting=data.context_setting,
                complexity_level=data.complexity_level,
                seed=f"{today}_{data.target_language}",
            )
            return SentenceResponse(
                date=today,
                target_sentence=response.target_sentence,
                literal_translation=response.literal_translation,
                natural_translation=response.natural_translation,
                grammatical_highlight=response.grammatical_highlight,
                cultural_context=response.cultural_context,
                substitution_options=response.substitution_options,
            )
        except Exception as exc:
            logger.error("Error generating daily sentence: %s", exc, exc_info=True)
            raise GenerationError(str(exc)) from exc
