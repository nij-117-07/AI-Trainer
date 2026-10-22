import logging
from datetime import datetime
from typing import List, Literal, Optional

import dspy

from core.dspy_utils import build_lm, run_predictor
from linguistic.word_of_the_day.schemas import WOTDRequest, WOTDResponse

logger = logging.getLogger(__name__)


class WordOfTheDayError(Exception):
    """Base exception for all word_of_the_day module failures."""


class GenerationError(WordOfTheDayError):
    """Raised when the underlying DSPy pipeline fails to produce content."""


class WordOfTheDayExplorer(dspy.Signature):
    """
    You are a Master Etymologist and Linguist. Your goal is to provide a
    'Deep Dive' Word of the Day. You bridge the gap between ancient linguistic
    roots and modern-day usage, providing translations and context in the
    user's native language to deepen understanding.
    """

    date: str = dspy.InputField(desc="The current date (YYYY-MM-DD).")
    target_language: str = dspy.InputField(desc="The language of the 'Word of the Day'.")
    native_language: str = dspy.InputField(desc="The user's primary language for explanations and translations.")
    user_proficiency: Literal["basic", "academic", "poetic", "slang"] = dspy.InputField()
    thematic_focus: Optional[str] = dspy.InputField(default="General", desc="Theme like 'Nature' or 'Technology'.")
    seed: str = dspy.InputField(desc="Entropy string for unique daily selection.")
    user_custom_instructions: Optional[str] = dspy.InputField(default=None, desc="e.g., 'Untranslatable words only'.")

    word: str = dspy.OutputField(desc="The chosen word.")
    native_translation: str = dspy.OutputField(desc="The closest equivalent in the user's native language.")
    phonetic_and_audio_guide: str = dspy.OutputField(desc="Pronunciation guide.")
    morphology_breakdown: str = dspy.OutputField(desc="Etymological roots (Latin, Greek, etc.).")
    primary_definition: str = dspy.OutputField(desc="Dictionary-style meaning in the native language.")
    the_vibe_check: str = dspy.OutputField(desc="The 'feeling' and social context of the word.")
    historical_evolution: str = dspy.OutputField(desc="How the meaning has shifted over the centuries.")
    modern_usage_sentence: str = dspy.OutputField(desc="Example sentence in target language with native translation.")
    synonym_web: List[str] = dspy.OutputField(desc="3-5 related words or concepts.")


class WordOfTheDayService:
    """Business layer wrapping the DSPy Word of the Day pipeline."""

    def __init__(self) -> None:
        self.lm = build_lm(cache=False)

    async def generate_daily_word(self, data: WOTDRequest) -> WOTDResponse:
        """
        Generates a linguistic deep-dive using DSPy ChainOfThought.

        Args:
            data (WOTDRequest): The validated request schema.

        Returns:
            WOTDResponse: The generated Word of the Day.

        Raises:
            GenerationError: If the DSPy pipeline fails to generate content.
        """
        try:
            prediction = run_predictor(
                WordOfTheDayExplorer,
                self.lm,
                date=datetime.now().strftime("%Y-%m-%d"),
                target_language=data.target_language,
                native_language=data.native_language,
                user_proficiency=data.proficiency,
                thematic_focus=data.theme,
                seed=f"fixed_seed_{datetime.now().day}",
                user_custom_instructions=data.custom_instructions,
            )
            return WOTDResponse(
                word=prediction.word,
                native_translation=prediction.native_translation,
                phonetic_and_audio_guide=prediction.phonetic_and_audio_guide,
                morphology_breakdown=prediction.morphology_breakdown,
                primary_definition=prediction.primary_definition,
                the_vibe_check=prediction.the_vibe_check,
                historical_evolution=prediction.historical_evolution,
                modern_usage_sentence=prediction.modern_usage_sentence,
                synonym_web=prediction.synonym_web,
            )
        except Exception as exc:
            logger.error("Word of the Day generation failed: %s", exc, exc_info=True)
            raise GenerationError(str(exc)) from exc
