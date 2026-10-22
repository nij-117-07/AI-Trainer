import logging
from typing import Any

import dspy

from core.dspy_utils import build_lm, run_predictor
from tools.flexible_writer.schemas import FlexibleWriterRequest, FlexibleWriterResponse

logger = logging.getLogger(__name__)


class FlexibleWriterError(Exception):
    """Base exception for all flexible writer module failures."""


class GenerationError(FlexibleWriterError):
    """Raised when the underlying DSPy pipeline fails to produce content."""


class FlexibleWriter(dspy.Signature):
    """
    You are an adaptable AI agent. Use the provided System Prompt to determine your
    persona and behavioral constraints. Process the input data according to the
    user's specific instructions.
    """

    system_prompt: str = dspy.InputField(description="The core persona and rules for the AI.")
    input_data: Any = dspy.InputField(description="The primary data/content to be processed or transformed.")
    additional_user_input: str = dspy.InputField(description="Specific instructions or context from the user.")

    answer_message: str = dspy.OutputField(description="A conversational summary of what was done.")
    updated_data: Any = dspy.OutputField(description="The structured result or transformed version of the input data.")


class FlexibleWriterService:
    """Stateless business layer wrapping the DSPy flexible writer pipeline."""

    def __init__(self) -> None:
        self.lm = build_lm(temperature=0.7, cache=False)

    async def transform(self, data: FlexibleWriterRequest) -> FlexibleWriterResponse:
        """
        Runs the persona-driven transformation over the input data.

        Args:
            data (FlexibleWriterRequest): The validated request.

        Returns:
            FlexibleWriterResponse: The transformation result.

        Raises:
            GenerationError: If the pipeline fails.
        """
        try:
            result = run_predictor(
                FlexibleWriter,
                self.lm,
                system_prompt=data.system_prompt,
                input_data=data.input_data,
                additional_user_input=data.additional_user_input or "",
            )
            logger.info("Flexible writer transformed input for persona '%s'", data.system_prompt[:50])
            return FlexibleWriterResponse(
                answer_message=str(result.answer_message or ""),
                updated_data=result.updated_data,
            )
        except Exception as exc:
            logger.error("Flexible writer transformation failed: %s", exc, exc_info=True)
            raise GenerationError(str(exc)) from exc
