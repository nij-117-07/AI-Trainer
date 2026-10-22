import logging
from typing import List, Optional

import dspy

from core.dspy_utils import build_lm, run_predictor
from learning.memory_helper.schemas import MemoryHook, MemoryRequest, MemoryResponse

logger = logging.getLogger(__name__)


class MemoryError(Exception):
    """Base exception for all memory helper module failures."""


class GenerationError(MemoryError):
    """Raised when the underlying DSPy pipeline fails to produce content."""


class MemoryAgent(dspy.Signature):
    """
    You are a Memory Specialist. Your goal is to transform complex information
    into memorable chunks using cognitive science techniques.
    You create structured study aids, mnemonics, or mental frameworks
    to help humans retain data long-term.
    """

    content_to_remember: str = dspy.InputField(description="The facts, data, or topic the user wants to memorize.")
    preferred_technique: Optional[str] = dspy.InputField(default="Best Fit", description="Optional: Specific technique like 'Mnemonics', 'Feynman Technique', or 'Method of Loci'.")

    explanation: str = dspy.OutputField(description="A brief explanation of why this technique works for this data.")
    memory_hooks: List[dict] = dspy.OutputField(description="A list of memory aids. Each item contains: 'concept': the specific piece of info, 'hook': the mnemonic, visualization, or shortcut to remember it.")
    retention_plan: str = dspy.OutputField(description="A simple 3-step plan to review this information.")


class MemoryService:
    """Business layer wrapping the DSPy mnemonic generation pipeline."""

    def __init__(self) -> None:
        self.lm = build_lm(cache=False, temperature=0.5)

    async def run_agent(self, request_data: MemoryRequest) -> MemoryResponse:
        """
        Generates structured mnemonics and a retention plan for the given topic.

        Args:
            request_data: The validated memory request.

        Returns:
            MemoryResponse: The explanation, memory hooks, and retention plan.

        Raises:
            GenerationError: If the DSPy pipeline fails to produce content.
        """
        try:
            logger.info("Generating memory hooks for topic: %s", request_data.topic)
            response = run_predictor(
                MemoryAgent,
                self.lm,
                content_to_remember=request_data.topic,
                preferred_technique=request_data.technique,
            )

            hooks = [MemoryHook(**hook) for hook in response.memory_hooks]
            return MemoryResponse(
                explanation=response.explanation,
                memory_hooks=hooks,
                retention_plan=response.retention_plan,
            )
        except Exception as exc:
            logger.error("Memory hook generation error: %s", exc, exc_info=True)
            raise GenerationError(str(exc)) from exc
