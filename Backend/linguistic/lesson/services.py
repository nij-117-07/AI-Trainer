import logging
from typing import List, Literal, Optional

import dspy

from core.dspy_utils import build_lm, run_predictor
from linguistic.lesson.schemas import LessonRequest, LessonResponse, VocabularyItem

logger = logging.getLogger(__name__)


class LessonError(Exception):
    """Base exception for all lesson module failures."""


class GenerationError(LessonError):
    """Raised when the underlying DSPy pipeline fails to produce content."""


class LanguageLessonGenerator(dspy.Signature):
    """
    You are an AI Polyglot Tutor. Your goal is to create a scaffolded learning
    experience by bridging the gap between the user's native language and their
    target language. Use the 'seed' to randomize vocabulary selection and
    'user_custom_instruction' to wrap the lesson in a specific narrative or
    thematic shell (e.g., 'Interstellar Travel', 'Cooking', 'Classical Music').
    """

    native_language: str = dspy.InputField(desc="The user's primary language for explanations and comparisons.")
    target_language: str = dspy.InputField(desc="The language the user is currently learning.")
    current_level: Literal["A1", "A2", "B1", "B2", "C1", "C2"] = dspy.InputField(desc="CEFR Proficiency level.")
    last_lesson_summary: Optional[str] = dspy.InputField(desc="Brief recap of previous concepts to ensure continuity.")
    learning_focus: Literal["Grammar", "Vocabulary", "Conversation", "Culture", "Pronunciation"] = dspy.InputField()
    complexity_weight: Literal["Low", "Medium", "High"] = dspy.InputField(desc="Determines the depth of explanation and number of exercises.")
    seed: str = dspy.InputField(desc="A random string or number to ensure variety in examples.")
    user_custom_instruction: Optional[str] = dspy.InputField(desc="Thematic constraints (e.g., 'Cyberpunk setting', 'Business formal', 'Nature metaphors').")

    lesson_header: str = dspy.OutputField(desc="A creative title combining the target language and the custom theme.")
    comparative_analysis: str = dspy.OutputField(desc="Explanation of how this concept differs from or relates to the user's native language.")
    concept_deep_dive: str = dspy.OutputField(desc="The core lesson content, explained clearly in the native language but using target language terminology.")
    thematic_vocabulary: List[dict] = dspy.OutputField(desc="List of 5-10 words in Target Language with [Word, IPA, Translation, Thematic Example Sentence].")
    practice_suite: List[str] = dspy.OutputField(desc="A set of tiered exercises: 1. Recognition, 2. Transformation, 3. Creative Production.")
    cultural_nuance: str = dspy.OutputField(desc="An 'Insider Tip' about how native speakers actually use this concept in real life.")
    homework_mission: str = dspy.OutputField(desc="A real-world 'challenge' for the user to complete outside the app.")


class LessonService:
    """Business layer wrapping the DSPy lesson generation pipeline."""

    def __init__(self) -> None:
        self.lm = build_lm(cache=False)

    def generate_lesson(self, data: LessonRequest) -> LessonResponse:
        """
        Generates a pedagogical lesson using DSPy ChainOfThought.

        Args:
            data (LessonRequest): The validated request schema.

        Returns:
            LessonResponse: The structured scaffolded lesson.

        Raises:
            GenerationError: If the DSPy pipeline fails to produce content.
        """
        try:
            prediction = run_predictor(
                LanguageLessonGenerator,
                self.lm,
                native_language=data.native_language,
                target_language=data.target_language,
                current_level=data.current_level,
                last_lesson_summary=data.last_lesson_summary,
                learning_focus=data.learning_focus,
                complexity_weight=data.complexity_weight,
                seed=data.seed,
                user_custom_instruction=data.user_custom_instruction,
            )
            vocabulary = [VocabularyItem(**item) for item in prediction.thematic_vocabulary]
            return LessonResponse(
                header=prediction.lesson_header,
                comparative_analysis=prediction.comparative_analysis,
                deep_dive=prediction.concept_deep_dive,
                vocabulary=vocabulary,
                practice=prediction.practice_suite,
                nuance=prediction.cultural_nuance,
                homework=prediction.homework_mission,
            )
        except Exception as exc:
            logger.error("Lesson generation failed: %s", exc, exc_info=True)
            raise GenerationError(str(exc)) from exc
