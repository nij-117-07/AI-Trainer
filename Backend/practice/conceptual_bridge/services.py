import logging
import random

import dspy

from core.dspy_utils import build_lm, run_predictor
from practice.conceptual_bridge.schemas import (
    AbstractionDepth,
    BridgeRequest,
    BridgeResponse,
)

logger = logging.getLogger(__name__)


class BridgeError(Exception):
    """Base exception for all conceptual bridge module failures."""


class GenerationError(BridgeError):
    """Raised when the underlying DSPy pipeline fails to produce content."""


class ConceptualBridgeBuilder(dspy.Signature):
    """
    Forces connections between unrelated domains to enhance cognitive flexibility.
    Targets: Creativity, analogical thinking, and knowledge transfer.
    """

    concept_a: str = dspy.InputField(description="First concept (e.g., 'Photosynthesis').")
    concept_b: str = dspy.InputField(description="Second seemingly unrelated concept (e.g., 'Blockchain').")
    abstraction_depth: AbstractionDepth = dspy.InputField(
        description="How deep the analogy should be."
    )
    seed: int = dspy.InputField(description="Seed for variation in creative connections.")

    structural_analogy: str = dspy.OutputField(
        description="Deep structural similarity between the concepts."
    )
    bridging_narrative: str = dspy.OutputField(
        description="A story that connects A to B in 2-3 sentences."
    )
    insight_question: str = dspy.OutputField(
        description="A question that forces the user to find a missing link."
    )
    cognitive_flexibility_score: int = dspy.OutputField(
        description="Estimated IQ points impact: 1-5 (5 being high transfer learning potential)."
    )


class ConceptualBridgeService:
    """Stateless business layer wrapping the DSPy conceptual bridge pipeline."""

    def __init__(self) -> None:
        self.lm = build_lm(temperature=0.8, cache=False)

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
    def _coerce_int(value: object, default: int = 3) -> int:
        """
        Coerces a raw value into an integer clamped to [1, 5].

        Args:
            value (object): The raw LLM output.
            default (int): Fallback value.

        Returns:
            int: A clamped integer.
        """
        try:
            parsed = int(float(value))
        except (TypeError, ValueError):
            return default
        return max(1, min(5, parsed))

    async def build_bridge(self, data: BridgeRequest) -> BridgeResponse:
        """
        Finds a creative structural link between two disparate ideas.

        Args:
            data (BridgeRequest): The validated request.

        Returns:
            BridgeResponse: The conceptual bridge.

        Raises:
            GenerationError: If the generation pipeline fails.
        """
        try:
            result = run_predictor(
                ConceptualBridgeBuilder,
                self.lm,
                concept_a=data.concept_a,
                concept_b=data.concept_b,
                abstraction_depth=data.abstraction_depth,
                seed=random.randint(1, 100000),
            )
            logger.info("Built conceptual bridge between '%s' and '%s'", data.concept_a, data.concept_b)
            return BridgeResponse(
                structural_analogy=self._coerce_str(result.structural_analogy),
                bridging_narrative=self._coerce_str(result.bridging_narrative),
                insight_question=self._coerce_str(result.insight_question),
                cognitive_flexibility_score=self._coerce_int(result.cognitive_flexibility_score),
            )
        except Exception as exc:
            logger.error("Conceptual bridge generation failed: %s", exc, exc_info=True)
            raise GenerationError(str(exc)) from exc
