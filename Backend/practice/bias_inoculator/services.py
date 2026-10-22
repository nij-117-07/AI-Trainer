import logging
import random
from typing import List

import dspy

from core.dspy_utils import build_lm, run_predictor
from practice.bias_inoculator.schemas import (
    BiasRequest,
    BiasResponse,
    TargetBias,
)

logger = logging.getLogger(__name__)


class BiasError(Exception):
    """Base exception for all bias inoculator module failures."""


class GenerationError(BiasError):
    """Raised when the underlying DSPy pipeline fails to produce content."""


class CognitiveBiasInoculator(dspy.Signature):
    """
    Simulates a 'System 1 vs System 2' training session.
    Triggers a bias in the user, waits for their response, and then explains the logic.
    """

    conversation_history: str = dspy.InputField(description="Previous scenarios or user reactions.")
    target_bias: TargetBias = dspy.InputField(
        description="Bias to train against."
    )
    user_interest: str = dspy.InputField(description="User's field (e.g., 'trading', 'dating', 'engineering').")

    scenario_setup: str = dspy.OutputField(
        description="A stealthy scenario that ends with a question for the user."
    )
    intuitive_trap: str = dspy.OutputField(
        description="The 'gut feeling' or biased answer the user likely had."
    )
    rational_analysis: str = dspy.OutputField(
        description="Detailed breakdown of how the bias works and what the rational path is."
    )
    real_world_application: str = dspy.OutputField(
        description="A practical tip for spotting this specific bias in their work/life."
    )


class BiasInoculatorService:
    """Stateless business layer wrapping the DSPy bias inoculator pipeline."""

    _BIAS_CHOICES: tuple = ("anchoring", "availability", "confirmation", "sunk_cost", "framing")

    def __init__(self) -> None:
        self.lm = build_lm(temperature=0.7, cache=False)

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
    def _format_history(history: List[str]) -> str:
        """
        Joins a list of exchanges into a compact transcript.

        Args:
            history (List[str]): The conversation history.

        Returns:
            str: The formatted transcript.
        """
        if not history:
            return "New session."
        return "\n".join(history)

    async def inoculate_bias(self, data: BiasRequest) -> BiasResponse:
        """
        Creates a 'trap' scenario to train against cognitive biases.

        Args:
            data (BiasRequest): The validated request.

        Returns:
            BiasResponse: The training scenario and rational reveal.

        Raises:
            GenerationError: If the generation pipeline fails.
        """
        try:
            selected_bias = data.target_bias or random.choice(self._BIAS_CHOICES)
            result = run_predictor(
                CognitiveBiasInoculator,
                self.lm,
                conversation_history=self._format_history(data.conversation_history),
                target_bias=selected_bias,
                user_interest=data.user_interest,
            )
            logger.info("Generated bias inoculator scenario for bias '%s'", selected_bias)
            return BiasResponse(
                target_bias=selected_bias,
                scenario_setup=self._coerce_str(result.scenario_setup),
                intuitive_trap=self._coerce_str(result.intuitive_trap),
                rational_analysis=self._coerce_str(result.rational_analysis),
                real_world_application=self._coerce_str(result.real_world_application),
            )
        except Exception as exc:
            logger.error("Bias inoculator generation failed: %s", exc, exc_info=True)
            raise GenerationError(str(exc)) from exc
