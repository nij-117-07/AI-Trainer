import logging
from typing import Literal, Optional

import dspy

from core.dspy_utils import build_lm, run_predictor
from linguistic.poet_engine.schemas import ConceptRequest, ConceptResponse

logger = logging.getLogger(__name__)


class PoetEngineError(Exception):
    """Base exception for all poet_engine module failures."""


class GenerationError(PoetEngineError):
    """Raised when the underlying DSPy pipeline fails to produce content."""


class PoeticLanguageExplainer(dspy.Signature):
    """
    You are a Poetic Philologist and Sufi-inspired Linguist. Your goal is to
    bridge cultural gaps by explaining the 'Soul' of a word. You translate not
    just words, but the historical and emotional weight they carry, adapting the
    explanation to the user's native language.
    """

    target_language: str = dspy.InputField(desc="The source language of the concept (e.g., Urdu, Persian, Japanese).")
    native_language: str = dspy.InputField(desc="The user's primary language for the explanation and translation.")
    concept_word: str = dspy.InputField(desc="The specific word or abstract concept (e.g., 'Ishq', 'Wabi-sabi').")
    poetic_style: Literal["Shayari/Couplet", "Haiku", "Metaphorical Prose", "Ghazal-style"] = dspy.InputField()
    user_mood: Optional[str] = dspy.InputField(default="mystical", desc="The emotional tone for the generation.")
    user_custom_instruction: Optional[str] = dspy.InputField(default=None, desc="Specific constraints like nature metaphors or urban settings.")

    etymological_soul: str = dspy.OutputField(desc="The cultural and historical origin of the word.")
    original_poetry: str = dspy.OutputField(desc="The poetic piece in the target_language.")
    soulful_translation: str = dspy.OutputField(desc="A deep translation into the user's native_language.")
    philosophical_reflection: str = dspy.OutputField(desc="Connection of the word to the universal human experience.")
    visual_metaphor: str = dspy.OutputField(desc="A vivid description of a scene representing this concept.")


class PoetService:
    """Business layer wrapping the DSPy poetic philology pipeline."""

    def __init__(self) -> None:
        self.lm = build_lm(cache=False)

    def generate_explanation(self, data: ConceptRequest) -> ConceptResponse:
        """
        Generates a poetic explanation using DSPy Chain of Thought.

        Args:
            data (ConceptRequest): The validated request schema.

        Returns:
            ConceptResponse: The poetic breakdown of the concept.

        Raises:
            GenerationError: If the DSPy pipeline fails to produce content.
        """
        try:
            logger.info("Generating poetic insight for concept: %s", data.concept_word)
            prediction = run_predictor(
                PoeticLanguageExplainer,
                self.lm,
                target_language=data.target_language,
                native_language=data.native_language,
                concept_word=data.concept_word,
                poetic_style=data.poetic_style,
                user_mood=data.user_mood,
                user_custom_instruction=data.user_custom_instruction,
            )
            return ConceptResponse(
                etymological_soul=prediction.etymological_soul,
                original_poetry=prediction.original_poetry,
                soulful_translation=prediction.soulful_translation,
                philosophical_reflection=prediction.philosophical_reflection,
                visual_metaphor=prediction.visual_metaphor,
            )
        except Exception as exc:
            logger.error("Poetic explanation failed: %s", exc, exc_info=True)
            raise GenerationError(str(exc)) from exc
