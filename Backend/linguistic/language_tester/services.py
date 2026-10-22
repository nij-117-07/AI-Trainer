import logging
import random
from typing import Any, Dict, List, Literal, Optional

import dspy

from core.dspy_utils import build_lm, run_predictor
from linguistic.language_tester.schemas import (
    AssessmentRequest,
    AssessmentResponse,
    EvaluationRequest,
    EvaluationResponse,
    FIBRequest,
    FIBResponse,
    MCQQuestion,
    RoleplayRequest,
    RoleplayResponse,
    TranslationChallengeRequest,
    TranslationChallengeResponse,
)

logger = logging.getLogger(__name__)

TEST_MODES: List[str] = ["translate_to_target", "translate_to_native", "explain_meaning"]


class LanguageTesterError(Exception):
    """Base exception for all language_tester module failures."""


class GenerationError(LanguageTesterError):
    """Raised when the underlying DSPy pipeline fails to produce content."""


class LanguageMCQEvaluator(dspy.Signature):
    """
    You are an Adaptive Language Examiner. Generate a specific number of
    Multiple Choice Questions (MCQs) to evaluate proficiency in a target
    language. Scale the vocabulary and grammar complexity strictly according
    to the CEFR level provided.
    """

    target_language: str = dspy.InputField(desc="The language being tested (e.g., Italian, Korean).")
    native_language: str = dspy.InputField(desc="The user's native language for explanations and reference.")
    level: Literal["A1", "A2", "B1", "B2", "C1", "C2"] = dspy.InputField(desc="CEFR proficiency level.")
    num_questions: int = dspy.InputField(desc="The total number of questions to generate.")
    scenario: str = dspy.InputField(desc="Context for questions (e.g., 'Ordering at a restaurant', 'Business meeting').")
    user_details: str = dspy.InputField(desc="Persona info to personalize the questions.")
    seed: str = dspy.InputField(desc="A unique string/number to ensure different questions on every run.")
    custom_instructions: Optional[str] = dspy.InputField(desc="Specific focus (e.g., 'only use past tense', 'no formal pronouns').")

    level_rationale: str = dspy.OutputField(desc="Briefly explain why these questions fit the requested CEFR level.")
    assessment_title: str = dspy.OutputField(desc="A creative title for this specific test set.")
    questions: List[Dict[str, Any]] = dspy.OutputField(desc="""
        A list of MCQ objects. Each object must contain:
        - 'id': unique question ID
        - 'text': The question
        - 'options': {'A': '...', 'B': '...', 'C': '...', 'D': '...'}
        - 'correct': The letter (A, B, C, or D)
        - 'explanation': Why the answer is correct (in the native language)
    """)


class FillInTheBlankGenerator(dspy.Signature):
    """
    You are a Language Tutor. Generate 'Fill in the Blank' sentences.
    The sentence should have one clear missing part (indicated by '____').
    Tailor the vocabulary to the user's profile and CEFR level.
    """

    target_language: str = dspy.InputField(desc="The language to practice.")
    level: Literal["A1", "A2", "B1", "B2", "C1", "C2"] = dspy.InputField()
    num_questions: int = dspy.InputField(desc="Number of sentences to generate.")
    scenario: str = dspy.InputField(desc="Context (e.g., 'At the Pharmacy', 'Office Gossip').")
    user_details: str = dspy.InputField(desc="User's background to make sentences relatable.")
    seed: str = dspy.InputField(desc="Seed for randomness.")

    questions: List[Dict[str, str]] = dspy.OutputField(desc="""
        List of objects:
        - 'sentence': The sentence with '____'
        - 'correct_word': The missing word/phrase
        - 'hint': A clue in the target language
        - 'context_clue': Translation of the sentence in the native language
    """)


class WordEvaluator(dspy.Signature):
    """
    You are a Linguistic Grader. Compare the User's Answer with the Correct
    Word. Determine if it is Correct, Incorrect, or 'Close' (Typo/Partial).
    Provide grammatical feedback.
    """

    sentence_context: str = dspy.InputField(desc="The full sentence where the word fits.")
    correct_word: str = dspy.InputField(desc="The expected answer.")
    user_answer: str = dspy.InputField(desc="What the user typed.")

    is_correct: bool = dspy.OutputField(desc="True if the answer is functionally correct.")
    status: Literal["correct", "typo", "incorrect"] = dspy.OutputField()
    feedback: str = dspy.OutputField(desc="Brief explanation of the mistake or praise.")
    improvement_tip: Optional[str] = dspy.OutputField(desc="Grammar rule related to this specific error.")


class TranslationChallengeGenerator(dspy.Signature):
    """
    You are a Bilingual Assessment Expert. Generate a translation challenge
    that tests either 'Active Production' (Native to Target) or 'Passive
    Recognition' (Target to Native). The challenge must be contextually
    relevant to the user's scenario and level.
    """

    target_language: str = dspy.InputField(desc="The language the user is learning.")
    native_language: str = dspy.InputField(desc="The user's primary language.")
    level: Literal["A1", "A2", "B1", "B2", "C1", "C2"] = dspy.InputField()
    scenario: str = dspy.InputField(desc="Setting (e.g., 'Navigating a Train Station', 'Technical Brainstorming').")
    user_persona: str = dspy.InputField(desc="Who the user is (e.g., 'Student', 'CEO', 'Tourist').")
    test_type: Literal["translate_to_target", "translate_to_native", "explain_meaning"] = dspy.InputField(
        desc="Direction of the test: Native->Target, Target->Native, or explaining nuance."
    )
    seed: str = dspy.InputField(desc="Randomness seed to vary the sentences.")
    custom_instructions: Optional[str] = dspy.InputField(desc="e.g., 'use informal pronouns', 'focus on medical terms'.")

    challenge_instruction: str = dspy.OutputField(desc="Specific instruction for the user (e.g., 'Translate this to Spanish').")
    source_text: str = dspy.OutputField(desc="The text provided to the user to process.")
    correct_reference: str = dspy.OutputField(desc="The ideal translation or explanation.")
    vocabulary_highlights: List[str] = dspy.OutputField(desc="Key words to pay attention to in this challenge.")
    cultural_tip: Optional[str] = dspy.OutputField(desc="A note on why this specific phrasing is used in the target culture.")


class RoleplayChatEvaluator(dspy.Signature):
    """
    You are a Language Immersion Coach. Your goal is to sustain a realistic
    conversation in the Target Language. You act as a specific character
    (e.g., a grumpy waiter, a helpful doctor). You must evaluate the user's
    response for fluency while keeping the conversation moving forward
    naturally.
    """

    target_language: str = dspy.InputField(desc="Language of the conversation.")
    level: Literal["A1", "A2", "B1", "B2", "C1", "C2"] = dspy.InputField()
    scenario: str = dspy.InputField(desc="Setting (e.g., 'At a Police Station reporting a lost bag').")
    user_persona: str = dspy.InputField(desc="The role the user is playing.")
    chat_history: List[Dict[str, str]] = dspy.InputField(desc="The previous turns of the conversation.")
    user_latest_response: str = dspy.InputField(desc="The user's most recent chat message.")
    seed: str = dspy.InputField(desc="Seed to determine the AI character's personality.")

    linguistic_critique: str = dspy.OutputField(desc="Feedback on user's grammar/vocabulary in the latest turn.")
    fluency_score: int = dspy.OutputField(desc="1-10 score of the user's latest response.")
    ai_character_response: str = dspy.OutputField(desc="The AI's next line in character (Target Language).")
    suggested_strategies: List[str] = dspy.OutputField(desc="Ways the user could have phrased things better.")
    is_goal_achieved: bool = dspy.OutputField(desc="Has the user successfully completed the scenario goal?")


class LanguageTesterService:
    """Business layer wrapping the DSPy language assessment pipelines."""

    def __init__(self) -> None:
        self.lm = build_lm(cache=False)

    def generate_assessment(self, data: AssessmentRequest) -> AssessmentResponse:
        """
        Triggers the DSPy engine to create language MCQs.

        Args:
            data (AssessmentRequest): The validated request schema.

        Returns:
            AssessmentResponse: The generated assessment.

        Raises:
            GenerationError: If the DSPy pipeline fails to produce content.
        """
        try:
            logger.info("Generating %s %s assessment for scenario: %s", data.level, data.target_language, data.scenario)
            response = run_predictor(
                LanguageMCQEvaluator,
                self.lm,
                target_language=data.target_language,
                native_language=data.native_language,
                level=data.level,
                num_questions=data.num_questions,
                scenario=data.scenario,
                user_details=data.user_details,
                seed=data.seed,
                custom_instructions=data.custom_instructions,
            )
            return AssessmentResponse(
                assessment_title=response.assessment_title,
                level_rationale=response.level_rationale,
                questions=[MCQQuestion(**question) for question in response.questions],
            )
        except Exception as exc:
            logger.error("Assessment generation failed: %s", exc, exc_info=True)
            raise GenerationError(str(exc)) from exc

    def generate_fib_questions(self, data: FIBRequest) -> FIBResponse:
        """
        Generates fill-in-the-blank questions using DSPy.

        Args:
            data (FIBRequest): The validated request schema.

        Returns:
            FIBResponse: The generated questions.

        Raises:
            GenerationError: If the DSPy pipeline fails to produce content.
        """
        try:
            response = run_predictor(
                FillInTheBlankGenerator,
                self.lm,
                target_language=data.target_language,
                level=data.level,
                num_questions=data.num_questions,
                scenario=data.scenario,
                user_details=data.user_details,
                seed=data.seed,
            )
            return FIBResponse(questions=response.questions)
        except Exception as exc:
            logger.error("Fill-in-the-blank generation failed: %s", exc, exc_info=True)
            raise GenerationError(str(exc)) from exc

    def evaluate_answer(self, data: EvaluationRequest) -> EvaluationResponse:
        """
        Evaluates a user answer against the correct word.

        Args:
            data (EvaluationRequest): The validated request schema.

        Returns:
            EvaluationResponse: The verdict, feedback, and improvement tip.

        Raises:
            GenerationError: If the DSPy pipeline fails to produce content.
        """
        try:
            response = run_predictor(
                WordEvaluator,
                self.lm,
                sentence_context=data.sentence_context,
                correct_word=data.correct_word,
                user_answer=data.user_answer,
            )
            return EvaluationResponse(
                is_correct=response.is_correct,
                status=response.status,
                feedback=response.feedback,
                improvement_tip=response.improvement_tip,
            )
        except Exception as exc:
            logger.error("Answer evaluation failed: %s", exc, exc_info=True)
            raise GenerationError(str(exc)) from exc

    def generate_translation_task(self, data: TranslationChallengeRequest) -> TranslationChallengeResponse:
        """
        Orchestrates the Translation Challenge generation with deterministic randomness.

        Args:
            data (TranslationChallengeRequest): The validated request schema.

        Returns:
            TranslationChallengeResponse: The generated challenge.

        Raises:
            GenerationError: If the DSPy pipeline fails to produce content.
        """
        try:
            random_gen = random.Random(data.seed)
            chosen_mode = random_gen.choice(TEST_MODES)

            response = run_predictor(
                TranslationChallengeGenerator,
                self.lm,
                target_language=data.target_language,
                native_language=data.native_language,
                level=data.level,
                scenario=data.scenario,
                user_persona=data.user_persona,
                test_type=chosen_mode,
                seed=data.seed,
                custom_instructions=data.custom_instructions,
            )
            return TranslationChallengeResponse(
                test_type=chosen_mode,
                challenge_instruction=response.challenge_instruction,
                source_text=response.source_text,
                correct_reference=response.correct_reference,
                vocabulary_highlights=response.vocabulary_highlights,
                cultural_tip=response.cultural_tip,
            )
        except Exception as exc:
            logger.error("Translation challenge generation failed: %s", exc, exc_info=True)
            raise GenerationError(str(exc)) from exc

    def continue_roleplay(self, data: RoleplayRequest) -> RoleplayResponse:
        """
        Simulates a turn in an immersive language roleplay.

        Args:
            data (RoleplayRequest): The validated request schema.

        Returns:
            RoleplayResponse: The critique, score, and AI's next line.

        Raises:
            GenerationError: If the DSPy pipeline fails to produce content.
        """
        try:
            logger.info("Continuing roleplay in %s for scenario: %s", data.target_language, data.scenario)
            history_dicts = [message.model_dump() for message in data.chat_history]

            response = run_predictor(
                RoleplayChatEvaluator,
                self.lm,
                target_language=data.target_language,
                level=data.level,
                scenario=data.scenario,
                user_persona=data.user_persona,
                chat_history=history_dicts,
                user_latest_response=data.user_latest_response,
                seed=data.seed,
            )
            return RoleplayResponse(
                linguistic_critique=response.linguistic_critique,
                fluency_score=response.fluency_score,
                ai_character_response=response.ai_character_response,
                suggested_strategies=response.suggested_strategies,
                is_goal_achieved=response.is_goal_achieved,
            )
        except Exception as exc:
            logger.error("Roleplay turn failed: %s", exc, exc_info=True)
            raise GenerationError(str(exc)) from exc
