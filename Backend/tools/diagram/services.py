import logging
from typing import Optional

import dspy

from core.dspy_utils import build_lm, run_predictor
from tools.diagram.schemas import DiagramRequest, DiagramResponse

logger = logging.getLogger(__name__)


class DiagramError(Exception):
    """Base exception for all diagram module failures."""


class GenerationError(DiagramError):
    """Raised when the underlying DSPy pipeline fails to produce content."""


class MermaidGenerator(dspy.Signature):
    """
    You are an expert Mermaid.js developer. Your task is to generate or update
    Mermaid.js syntax for diagrams (flowcharts, sequence diagrams, class diagrams, etc.).

    Rules:
    1. Return ONLY the Mermaid.js code in the 'updated_code' field.
    2. If 'existing_code' is provided, modify it based on the instruction.
    3. Ensure the syntax is correct and can be rendered by Mermaid loaders.
    """

    user_instruction: str = dspy.InputField(description="Specific visual change or diagram request.")
    context: Optional[str] = dspy.InputField(description="Business logic or technical context for the diagram content.")
    existing_code: Optional[str] = dspy.InputField(default=None, description="Current Mermaid code to be refined.")

    updated_code: str = dspy.OutputField(
        description="The final valid Mermaid.js code starting with the diagram type (e.g., 'graph TD'). Do not include markdown code delimiters"
    )
    answer_message: str = dspy.OutputField(description="A brief explanation of what was added or changed.")


class DrawIOCodeGenerator(dspy.Signature):
    """
    You are an expert Draw.io (diagrams.net) architect. Your goal is to generate or
    edit XML/mxGraph code for diagrams based on user instructions.

    If 'existing_code' is provided, modify it according to the instructions.
    If 'existing_code' is empty, generate a new diagram from scratch.
    Ensure the XML is valid and compatible with Draw.io import.
    """

    user_instruction: str = dspy.InputField(description="What the user wants to build or change in the diagram.")
    context: Optional[str] = dspy.InputField(description="Background info about the system, flow, or business logic.")
    existing_code: Optional[str] = dspy.InputField(default=None, description="The current Draw.io XML/mxGraph code to be edited.")

    updated_code: str = dspy.OutputField(
        description="The complete, valid Draw.io XML/mxGraph code. Do not include markdown code delimiters"
    )
    answer_message: str = dspy.OutputField(description="A concise explanation of the changes or the logic used to build the diagram.")


class DiagramService:
    """Business layer wrapping the DSPy Mermaid/Draw.io generation pipelines."""

    def __init__(self) -> None:
        self.lm = build_lm(temperature=0.4, cache=False)

    def generate(self, data: DiagramRequest) -> DiagramResponse:
        """
        Generates or edits diagram code in the requested format using DSPy.

        Args:
            data (DiagramRequest): The validated request schema.

        Returns:
            DiagramResponse: The explanation message and generated diagram code.

        Raises:
            GenerationError: If the DSPy pipeline fails to produce content.
        """
        try:
            logger.info("Generating %s diagram via DSPy", data.format)
            if data.format == "mermaid":
                response = run_predictor(
                    MermaidGenerator,
                    self.lm,
                    user_instruction=data.instruction,
                    context=data.context,
                    existing_code=data.existing_code or None,
                )
            elif data.format == "drawio":
                response = run_predictor(
                    DrawIOCodeGenerator,
                    self.lm,
                    user_instruction=data.instruction,
                    context=data.context,
                    existing_code=data.existing_code or None,
                )
            else:
                raise GenerationError(f"Unsupported format: {data.format}")
            return DiagramResponse(
                message=response.answer_message,
                code=response.updated_code,
                format=data.format,
            )
        except Exception as exc:
            logger.error("Diagram generation failed: %s", exc, exc_info=True)
            raise GenerationError(str(exc)) from exc
