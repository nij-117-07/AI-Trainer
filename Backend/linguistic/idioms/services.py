import logging
from typing import Literal, Optional

import dspy

from core.dspy_utils import build_lm, run_predictor
from linguistic.idioms.schemas import IdiomRequest, IdiomResponse

logger = logging.getLogger(__name__)


class IdiomError(Exception):
    """Base exception for all idioms module failures."""


class GenerationError(IdiomError):
    """Raised when the underlying DSPy pipeline fails to produce content."""


class IdiomsHelper(dspy.Signature):
    """
    You are an Expert Polyglot and Philologist. Your mission is to help users
    master idiomatic expressions across different languages. Use the 'seed' to
    rotate through different idioms for the same topic. Incorporate the
    'custom_user_request' to tailor the tone, complexity, or specific niche.
    """

    target_language: str = dspy.InputField(desc="The language the user wants to learn (e.g., Spanish, Mandarin).")
    user_proficiency: Literal["beginner", "intermediate", "advanced", "native-aspirant"] = dspy.InputField(desc="Current level of the user.")
    theme_or_keyword: str = dspy.InputField(desc="The general topic (e.g., 'Time', 'Money', 'Health').")
    native_language: str = dspy.InputField(desc="The user's primary language for explanations.")
    seed: str = dspy.InputField(desc="A unique string to ensure variety in idiom selection.")
    custom_user_request: Optional[str] = dspy.InputField(default=None, desc="Specific user preferences (e.g., 'make it funny', 'business context only').")

    rationale: str = dspy.OutputField(desc="Reasoning for selecting this specific idiom based on the seed and user request.")
    idiom_in_target_language: str = dspy.OutputField(desc="The idiom written in the target language.")
    phonetic_pronunciation: str = dspy.OutputField(desc="How to say it (IPA or phonetic spelling).")
    figurative_meaning: str = dspy.OutputField(desc="The actual meaning interpreted in the native language.")
    cultural_context: str = dspy.OutputField(desc="The 'Why' and 'When' - historical origin or social setting.")
    equivalent_in_native_language: str = dspy.OutputField(desc="A matching idiom in the user's native tongue.")
    dialogue_scenario: str = dspy.OutputField(desc="A short script showing the idiom in use.")
    practice_prompt: str = dspy.OutputField(desc="A question asking the user to use the idiom in a new sentence.")


class IdiomService:
    """Business layer wrapping the DSPy idiom lesson pipeline."""

    def __init__(self) -> None:
        self.lm = build_lm(cache=False)

    def generate_idiom_lesson(self, data: IdiomRequest) -> IdiomResponse:
        """
        Generates an idiomatic expression lesson using DSPy ChainOfThought.

        Args:
            data (IdiomRequest): The validated request schema.

        Returns:
            IdiomResponse: The generated idiom lesson.

        Raises:
            GenerationError: If the DSPy pipeline fails to produce content.
        """
        try:
            result = run_predictor(
                IdiomsHelper,
                self.lm,
                target_language=data.target_language,
                user_proficiency=data.user_proficiency,
                theme_or_keyword=data.theme_or_keyword,
                native_language=data.native_language,
                seed=data.seed,
                custom_user_request=data.custom_user_request,
            )
            return IdiomResponse(
                rationale=result.rationale,
                idiom_in_target_language=result.idiom_in_target_language,
                phonetic_pronunciation=result.phonetic_pronunciation,
                figurative_meaning=result.figurative_meaning,
                cultural_context=result.cultural_context,
                equivalent_in_native_language=result.equivalent_in_native_language,
                dialogue_scenario=result.dialogue_scenario,
                practice_prompt=result.practice_prompt,
            )
        except Exception as exc:
            logger.error("Idiom generation failed: %s", exc, exc_info=True)
            raise GenerationError(str(exc)) from exc
