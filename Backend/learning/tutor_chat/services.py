import logging
from typing import Any, Dict, List, Optional

import dspy

from core.dspy_utils import build_lm, run_predictor
from learning.tutor_chat.schemas import ConceptItem, TutorChatRequest, TutorChatResponse

logger = logging.getLogger(__name__)


class TutorChatError(Exception):
    """Base exception for all tutor chat module failures."""


class GenerationError(TutorChatError):
    """Raised when the underlying DSPy pipeline fails to produce a response."""


class TutorBot(dspy.Signature):
    """
    You are an expert Tutor. Your goal is to help the user master a specific topic.
    Review the master topic, respect the additional context, and consider the
    previous chat history to provide a personalized learning experience.

    Break down complex concepts into digestible titles and descriptions.
    """

    master_topic: str = dspy.InputField(desc="The main subject the user wants to learn.")
    additional_context: str = dspy.InputField(desc="User's background, goals, or learning style constraints.")
    chat_history: str = dspy.InputField(desc="The record of previous interactions to maintain continuity.")
    user_input: str = dspy.InputField(desc="The current question or message from the student.")

    tutor_response: str = dspy.OutputField(desc="A supportive, conversational response to the student.")
    educational_breakdown: List[Dict[str, str]] = dspy.OutputField(desc="""
        A structured list of concepts related to the current turn.
        Each item contains:
        - 'title': The name of the concept or sub-topic.
        - 'description': A clear, educational explanation or detail.
    """)


class TutorChatService:
    """Business layer wrapping the DSPy topic-scoped tutor chat pipeline."""

    def __init__(self) -> None:
        self.lm = build_lm(temperature=0.4, cache=False)

    @staticmethod
    def _as_dict(raw: object) -> Dict[str, Any]:
        """
        Coerces a raw LLM value into a dictionary.

        Args:
            raw (object): The raw LLM output.

        Returns:
            Dict[str, Any]: The dictionary value.
        """
        return raw if isinstance(raw, dict) else {}

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
    def _format_history(history) -> str:
        """
        Formats the chat history into a flat transcript string.

        Args:
            history (list): The chat history messages.

        Returns:
            str: A formatted transcript.
        """
        if not history:
            return "No previous interaction."
        return " | ".join(f"{m.role}: {m.content}" for m in history)

    @classmethod
    def _build_breakdown(cls, raw_items: object) -> List[ConceptItem]:
        """
        Normalizes raw educational breakdown output into ConceptItem models.

        Args:
            raw_items (object): The raw breakdown list.

        Returns:
            List[ConceptItem]: Validated concept items.
        """
        items: List[ConceptItem] = []
        for item in cls._as_list(raw_items):
            data = cls._as_dict(item)
            items.append(
                ConceptItem(
                    title=cls._coerce_str(data.get("title")),
                    description=cls._coerce_str(data.get("description")),
                )
            )
        return items

    @staticmethod
    def _as_list(value: object) -> List[Any]:
        """
        Coerces a raw value into a list.

        Args:
            value (object): The raw LLM output.

        Returns:
            List[Any]: The list value.
        """
        if value is None:
            return []
        if isinstance(value, list):
            return value
        return [value]

    async def chat_turn(self, data: TutorChatRequest) -> TutorChatResponse:
        """
        Generates a single personalized tutor response for the current turn.

        Args:
            data (TutorChatRequest): The validated chat request.

        Returns:
            TutorChatResponse: The tutor's reply and educational breakdown.

        Raises:
            GenerationError: If the DSPy pipeline fails to respond.
        """
        try:
            history_text = self._format_history(data.chat_history)
            prediction = run_predictor(
                TutorBot,
                self.lm,
                master_topic=data.master_topic,
                additional_context=data.additional_context or "",
                chat_history=history_text,
                user_input=data.user_input,
            )

            logger.info("Tutor chat turn on topic '%s'", data.master_topic)
            return TutorChatResponse(
                tutor_response=self._coerce_str(prediction.tutor_response),
                educational_breakdown=self._build_breakdown(prediction.educational_breakdown),
            )
        except Exception as exc:
            logger.error("Tutor chat failed on topic %s: %s", data.master_topic, exc, exc_info=True)
            raise GenerationError(str(exc)) from exc
