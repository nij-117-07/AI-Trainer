import logging
from typing import List, Optional

import dspy

from core.dspy_utils import build_lm, run_predictor
from tools.creative_assets.schemas import CreativeAssetRequest, CreativeAssetResponse, CreativeSuggestion

logger = logging.getLogger(__name__)


class CreativeAssetsError(Exception):
    """Base exception for all creative_assets module failures."""


class GenerationError(CreativeAssetsError):
    """Raised when the underlying DSPy pipeline fails to produce content."""


class CreativeAssetGenerator(dspy.Signature):
    """
    You are a Creative Marketing Expert. Your task is to generate high-impact
    product names, titles, hashtags, or marketing lines based on user input.
    You must align your suggestions with the provided context and the user's
    existing preferred style.
    """

    task_type: str = dspy.InputField(description="The type of asset to generate (e.g., 'Product Names', 'Hashtags', 'SEO Titles', 'Slogans').")
    user_query: str = dspy.InputField(description="The primary topic, product description, or raw idea.")
    context: Optional[str] = dspy.InputField(default=None, description="Target audience, tone, or specific marketing goals.")
    reference_examples: Optional[List[str]] = dspy.InputField(default=None, description="A list of existing titles or hashtags that the user likes for style reference.")
    number_of_suggestions: int = dspy.InputField(description="The number of unique variations to generate.")

    suggestions: List[dict] = dspy.OutputField(description="""
        A list of generated creative assets. Each dictionary contains:
        - 'suggestion': The generated name, title, or tag.
        - 'explanation': Why this aligns with the user's preference and why it's effective for the target audience.
    """)


class CreativeAssetService:
    """Business layer wrapping the DSPy creative asset generation pipeline."""

    def __init__(self) -> None:
        self.lm = build_lm(temperature=0.4, cache=False)

    def generate(self, data: CreativeAssetRequest) -> CreativeAssetResponse:
        """
        Generates creative marketing assets using DSPy.

        Args:
            data (CreativeAssetRequest): The validated request schema.

        Returns:
            CreativeAssetResponse: The generated suggestions with explanations.

        Raises:
            GenerationError: If the DSPy pipeline fails to produce content.
        """
        try:
            result = run_predictor(
                CreativeAssetGenerator,
                self.lm,
                task_type=data.task_type,
                user_query=data.user_query,
                context=data.context,
                reference_examples=data.reference_examples,
                number_of_suggestions=data.number_of_suggestions,
            )
            suggestions = [CreativeSuggestion(**item) for item in result.suggestions]
            return CreativeAssetResponse(suggestions=suggestions)
        except Exception as exc:
            logger.error("Creative asset generation failed: %s", exc, exc_info=True)
            raise GenerationError(str(exc)) from exc
