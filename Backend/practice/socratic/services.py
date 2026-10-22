import logging
from typing import List

import dspy

from core.dspy_utils import build_lm, run_predictor
from practice.socratic.schemas import (
    ConfidenceLevel,
    SocraticRequest,
    SocraticResponse,
)

logger = logging.getLogger(__name__)


class SocraticError(Exception):
    """Base exception for all socratic module failures."""


class GenerationError(SocraticError):
    """Raised when the underlying DSPy pipeline fails to produce content."""


class SocraticChallenger(dspy.Signature):
    """
    Challenges user's reasoning rather than providing answers.
    Targets: Intellectual humility, logical consistency, and argumentation skills.
    Continuously probes the user's logic based on their current statement and past history.
    """

    conversation_history: str = dspy.InputField(
        description="The log of previous exchanges to avoid repetition and deepen the challenge."
    )
    user_statement: str = dspy.InputField(description="The user's latest opinion or rebuttal.")
    confidence_level: ConfidenceLevel = dspy.InputField(
        description="The user's perceived certainty in their current stance."
    )

    logical_fallacy_check: str = dspy.OutputField(
        description="If present, name the fallacy (e.g., Strawman, Ad Hominem); else 'None detected'."
    )
    falsification_question: str = dspy.OutputField(
        description="A pithy question that asks: 'What evidence would prove you wrong?'"
    )
    edge_case_scenario: str = dspy.OutputField(
        description="A 'What if...' scenario where the user's current logic leads to a contradiction."
    )
    refined_perspective: str = dspy.OutputField(
        description="A bridge: 'A more nuanced way to look at this might be...'"
    )


class SocraticService:
    """Stateless business layer wrapping the DSPy socratic challenger pipeline."""

    def __init__(self) -> None:
        self.lm = build_lm(temperature=0.4, cache=False)

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
            return "No prior history."
        return "\n".join(history)

    async def get_socratic_challenge(self, data: SocraticRequest) -> SocraticResponse:
        """
        Processes a single turn of the Socratic dialogue.

        Args:
            data (SocraticRequest): The validated request.

        Returns:
            SocraticResponse: The structured logical challenge.

        Raises:
            GenerationError: If the challenge pipeline fails.
        """
        try:
            result = run_predictor(
                SocraticChallenger,
                self.lm,
                conversation_history=self._format_history(data.conversation_history),
                user_statement=data.user_statement,
                confidence_level=data.confidence_level,
            )
            logger.info("Generated socratic challenge for statement '%s'", data.user_statement[:50])
            return SocraticResponse(
                logical_fallacy_check=self._coerce_str(result.logical_fallacy_check) or None,
                falsification_question=self._coerce_str(result.falsification_question),
                edge_case_scenario=self._coerce_str(result.edge_case_scenario),
                refined_perspective=self._coerce_str(result.refined_perspective),
            )
        except Exception as exc:
            logger.error("Socratic challenge failed: %s", exc, exc_info=True)
            raise GenerationError(str(exc)) from exc
