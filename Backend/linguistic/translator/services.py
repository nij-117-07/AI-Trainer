import logging
from typing import Literal, Optional

import dspy

from core.dspy_utils import build_lm, run_predictor
from linguistic.translator.schemas import TranslationRequest, TranslationResponse

logger = logging.getLogger(__name__)


class TranslationError(Exception):
    """Base exception for all translator module failures."""


class GenerationError(TranslationError):
    """Raised when the underlying DSPy pipeline fails to produce content."""


class ContextualTranslator(dspy.Signature):
    """
    You are a Professional Linguist and Translator. Your goal is to translate
    text accurately while preserving the nuances of tone, cultural context,
    and specific user instructions.
    """

    text_to_translate: str = dspy.InputField(desc="The source text that needs translation.")
    source_language: str = dspy.InputField(desc="The language of the input text.")
    target_language: str = dspy.InputField(desc="The language the text should be translated into.")
    tone: Literal["formal", "casual", "business", "poetic", "technical"] = dspy.InputField(desc="The desired style of the translation.")
    reference_material: Optional[str] = dspy.InputField(default=None, desc="Glossary or context snippets to maintain consistency.")
    custom_instructions: Optional[str] = dspy.InputField(default=None, desc="Specific rules (e.g., 'avoid gendered pronouns').")

    rationale: str = dspy.OutputField(desc="Brief explanation of linguistic choices made for this translation.")
    translated_text: str = dspy.OutputField(desc="The final translated content.")
    cultural_notes: Optional[str] = dspy.OutputField(desc="Notes on idioms or cultural adjustments made during translation.")


class TranslatorService:
    """Business layer wrapping the DSPy contextual translation pipeline."""

    def __init__(self) -> None:
        self.lm = build_lm(cache=False)

    def translate(self, data: TranslationRequest) -> TranslationResponse:
        """
        Executes the DSPy ChainOfThought translation.

        Args:
            data (TranslationRequest): The validated request schema.

        Returns:
            TranslationResponse: The rationale, translated text, and cultural notes.

        Raises:
            GenerationError: If the DSPy pipeline fails to produce content.
        """
        try:
            response = run_predictor(
                ContextualTranslator,
                self.lm,
                text_to_translate=data.text_to_translate,
                source_language=data.source_language,
                target_language=data.target_language,
                tone=data.tone,
                reference_material=data.reference_material,
                custom_instructions=data.custom_instructions,
            )
            return TranslationResponse(
                rationale=response.rationale,
                translated_text=response.translated_text,
                cultural_notes=response.cultural_notes,
            )
        except Exception as exc:
            logger.error("Translation pipeline failed: %s", exc, exc_info=True)
            raise GenerationError(str(exc)) from exc
