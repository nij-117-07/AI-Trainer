import logging
from typing import Any, Dict, List, Optional

import dspy

from core.dspy_utils import build_lm, run_predictor
from learning.resource_suggestor.schemas import (
    ResourceItem,
    ResourceSuggestRequest,
    ResourceSuggestResponse,
)

logger = logging.getLogger(__name__)


class ResourceSuggestError(Exception):
    """Base exception for all resource suggestor module failures."""


class GenerationError(ResourceSuggestError):
    """Raised when the underlying DSPy pipeline fails to produce a response."""


class ResourceSuggestor(dspy.Signature):
    """
    You are an expert Learning Resource Advisor. Your role is to analyze a learner's
    current background and their target learning topic, then provide personalized,
    high-quality resource recommendations.

    Consider the learner's existing knowledge to suggest resources that:
    - Bridge the gap between their current level and the target topic
    - Match their preferred learning style and constraints
    - Progress from foundational to advanced as needed
    - Include diverse resource types for comprehensive learning

    Provide actionable, specific resources with clear reasoning for each recommendation.
    """

    background_subject: str = dspy.InputField(
        desc="The subject or domain the user is currently studying or has background knowledge in."
    )
    target_topic: str = dspy.InputField(
        desc="The specific topic or skill the user wants to learn."
    )
    additional_preferences: str = dspy.InputField(
        desc=(
            "Optional preferences like learning style, time commitment, difficulty preference, "
            "format preference, language, or any other constraints."
        )
    )

    learning_path_summary: str = dspy.OutputField(
        desc="A brief overview of the recommended learning approach and progression strategy."
    )
    recommended_resources: List[Dict[str, str]] = dspy.OutputField(
        desc=(
            "A list of 5-8 curated learning resources. Each resource must include: "
            "title, type, author_or_creator, description, difficulty_level, estimated_time, "
            "why_recommended, prerequisite_knowledge, access_info."
        )
    )
    next_steps: str = dspy.OutputField(
        desc="Suggested order to consume the resources and what to do after completing them."
    )


class ResourceSuggestService:
    """Business layer wrapping the DSPy resource suggestion pipeline."""

    def __init__(self) -> None:
        self.lm = build_lm(temperature=0.7, cache=False)

    @staticmethod
    def _coerce_str(value: object, default: str = "") -> str:
        """
        Coerces a raw value into a string.

        Args:
            value: The raw LLM output.
            default: Fallback value.

        Returns:
            The coerced string.
        """
        if value is None:
            return default
        return str(value)

    @staticmethod
    def _as_list(value: object) -> List[Any]:
        """
        Coerces a raw value into a list.

        Args:
            value: The raw LLM output.

        Returns:
            The list value.
        """
        if value is None:
            return []
        if isinstance(value, list):
            return value
        return [value]

    @staticmethod
    def _as_dict(value: object) -> Dict[str, Any]:
        """
        Coerces a raw value into a dictionary.

        Args:
            value: The raw LLM output.

        Returns:
            The dictionary value.
        """
        return value if isinstance(value, dict) else {}

    @classmethod
    def _build_resources(cls, raw_items: object) -> List[ResourceItem]:
        """
        Normalizes raw resource output into ResourceItem models.

        Args:
            raw_items: The raw resource list from the LLM.

        Returns:
            Validated resource items.
        """
        items: List[ResourceItem] = []
        for item in cls._as_list(raw_items):
            data = cls._as_dict(item)
            items.append(
                ResourceItem(
                    title=cls._coerce_str(data.get("title")),
                    type=cls._coerce_str(data.get("type")),
                    author_or_creator=cls._coerce_str(data.get("author_or_creator")),
                    description=cls._coerce_str(data.get("description")),
                    difficulty_level=cls._coerce_str(data.get("difficulty_level")),
                    estimated_time=cls._coerce_str(data.get("estimated_time")),
                    why_recommended=cls._coerce_str(data.get("why_recommended")),
                    prerequisite_knowledge=cls._coerce_str(data.get("prerequisite_knowledge")),
                    access_info=cls._coerce_str(data.get("access_info")),
                )
            )
        return items

    async def suggest(self, data: ResourceSuggestRequest) -> ResourceSuggestResponse:
        """
        Generates personalized resource recommendations based on the learner's profile.

        Args:
            data: The validated resource suggestion request.

        Returns:
            Learning path summary, recommended resources, and next steps.

        Raises:
            GenerationError: If the DSPy pipeline fails to respond.
        """
        try:
            preferences = data.additional_preferences or "No specific preferences provided."
            prediction = run_predictor(
                ResourceSuggestor,
                self.lm,
                background_subject=data.background_subject,
                target_topic=data.target_topic,
                additional_preferences=preferences,
            )

            logger.info(
                "Resource suggestion generated for topic '%s'",
                data.target_topic,
            )
            return ResourceSuggestResponse(
                learning_path_summary=self._coerce_str(prediction.learning_path_summary),
                recommended_resources=self._build_resources(prediction.recommended_resources),
                next_steps=self._coerce_str(prediction.next_steps),
            )
        except Exception as exc:
            logger.error(
                "Resource suggestion failed for topic '%s': %s",
                data.target_topic,
                exc,
                exc_info=True,
            )
            raise GenerationError(str(exc)) from exc
